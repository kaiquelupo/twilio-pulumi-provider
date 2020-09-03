import * as pulumi from "@pulumi/pulumi";
import * as twilio from "twilio"; 
import { isEqual } from "lodash";
import { getAPI } from "../utils/api";
import { deployFlexPlugins, runFlexPluginsTests } from './deployFlexPlugins';
import { getPaths, getDirectories } from "../utils";
import { getOrCreateService } from "../serverless/checkServerless";


const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, PULUMI_CI } = process.env;

export interface WorkspaceArgs {
    attributes: pulumi.Input<any>;
}

class FlexPluginsProvider implements pulumi.dynamic.ResourceProvider {

    public async check(olds: any, news: any): Promise<pulumi.dynamic.CheckResult> {

        const { attributes } = news;

        if(PULUMI_CI !== "up") {

            await runFlexPluginsTests({ 
                files: process.env.FILES, 
                ...attributes,  
                deployAll: !isEqual(olds.attributes, attributes)
            });

        }

        return { inputs: news };

    }

    public async diff(id: pulumi.ID, olds: any, news: any): Promise<pulumi.dynamic.DiffResult> {
        
        const { attributes } = olds.inputs;

        const { relativePath} = getPaths(attributes.cwd);

        return { 
            changes: 
                getDirectories({ files: process.env.FILES, relativePath }).length > 0  || 
                !isEqual(attributes, news.attributes)
        };

    }

    public async create(inputs: any): Promise<pulumi.dynamic.CreateResult> {

        const { attributes } = inputs;

        const { sid } = await getOrCreateService("default");

        await deployFlexPlugins({ ...attributes, deployAll: true });

        return {
            id: sid,
            outs: { sid, inputs }
        };
    }

    public async update(id:pulumi.ID, olds: any, news:any): Promise<pulumi.dynamic.UpdateResult> {

        const { attributes } = news;

        const { sid } = await getOrCreateService("default");

        await deployFlexPlugins({ 
            files: process.env.FILES, 
            ...attributes,  
            deployAll: !isEqual(olds.attributes, attributes)
        });
            
        return {
            outs: { 
                sid, 
                inputs: news
            }
        };
        
    }

    public async delete(id:pulumi.ID, props: any) {

        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        await getAPI(client, ["serverless", "services"])(id).remove();

    }
}

export class FlexPlugins extends pulumi.dynamic.Resource {
    public readonly sid?: pulumi.Output<string>;
    public readonly inputs?: pulumi.Output<any>;

    constructor(name: string, args: WorkspaceArgs, opts?: pulumi.CustomResourceOptions) {
        super(new FlexPluginsProvider(), name, { ...args, sid: undefined, inputs: undefined, info: undefined }, opts);
    }
}
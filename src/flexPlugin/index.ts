import * as pulumi from "@pulumi/pulumi";
import * as twilio from "twilio"; 
import { isEqual } from "lodash";
import { getAPI } from "../utils/api";
import { deployFlexPlugin, runFlexPluginsTests } from './deployFlexPlugin';
import { hashElement } from 'folder-hash';
import { getService } from '../serverless/checkServerless';
import { getPaths } from "../utils";


const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, PULUMI_CI } = process.env;

export interface WorkspaceArgs {
    attributes: pulumi.Input<any>;
}

class FlexPluginProvider implements pulumi.dynamic.ResourceProvider {

    public async check(olds: any, news: any): Promise<pulumi.dynamic.CheckResult> {

        news.attributes.hash = (await hashElement(news.attributes.cwd, {
            folders: { exclude: ['node_modules', 'build'] },
        })).hash;

        return { inputs: news };

    }

    public async diff(id: pulumi.ID, olds: any, news: any): Promise<pulumi.dynamic.DiffResult> {
        
        const { attributes } = olds.inputs;
        const { runTestsOnPreview } = news.attributes;
        const { METHOD } = process.env;

        const changes = !isEqual(attributes, news.attributes)

        //Probably not the best way of doing that. Open to ideas :D
        if(METHOD === "preview" && changes && runTestsOnPreview) {
            await runFlexPluginsTests(news.attributes);
        }

        return { 
            changes
        };

    }

    public async create(inputs: any): Promise<pulumi.dynamic.CreateResult> {

        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        const { attributes } = inputs;

        await deployFlexPlugin(attributes);

        const { sid: serviceSid } = await getService("default", false);

        const environments = await client.serverless.services(serviceSid)
            .environments
            .list({limit: 20});

        const environmentName = require(`${getPaths(attributes.cwd).absolutePath}/package.json`).name;

        let environment = environments.find((environment:any) => environment.uniqueName === environmentName);

        return {
            id: environment!.sid,
            outs: { sid: environment!.sid, serviceSid, inputs }
        };
    }

    public async update(id:pulumi.ID, olds: any, news:any): Promise<pulumi.dynamic.UpdateResult> {

        const { attributes } = news;

        await deployFlexPlugin(attributes);

        const { sid: serviceSid } = await getService("default", false);
            
        return {
            outs: { 
                sid: id, 
                serviceSid,
                inputs: news
            }
        };
        
    }

    public async delete(id:pulumi.ID, props: any) {

        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        await getAPI(client, ["serverless", { "services" : props.serviceSid }, "environments" ])(id).remove();

    }
}

export class FlexPlugin extends pulumi.dynamic.Resource {
    public readonly sid?: pulumi.Output<string>;
    public readonly inputs?: pulumi.Output<any>;

    constructor(name: string, args: WorkspaceArgs, opts?: pulumi.CustomResourceOptions) {
        super(new FlexPluginProvider(), name, { ...args, sid: undefined, inputs: undefined, info: undefined }, opts);
    }
}
import * as pulumi from "@pulumi/pulumi";
import { isEqual } from "lodash";
import { getAPI } from "../utils/api";
import { deployFlexPlugin } from './deployFlexPlugin';
import { hashElement } from 'folder-hash';
import { getService } from '../serverless/checkServerless';
import { getPaths, getTwilioClient } from "../utils";

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

        const changes = !isEqual(attributes, news.attributes)

        return { 
            changes
        };

    }

    public async create(inputs: any): Promise<pulumi.dynamic.CreateResult> {

        const client:any = getTwilioClient();

        const { attributes } = inputs;

        await deployFlexPlugin(attributes);

        const { sid: serviceSid } = await getService("default", false);

        const environments = await client.serverless.services(serviceSid)
            .environments
            .list({limit: 20});

        const environmentName = require(`${getPaths(attributes.cwd).absolutePath}/package.json`).name;

        let environment = environments.find((environment:any) => environment.uniqueName === environmentName);

        inputs.attributes.hash = (await hashElement(attributes.cwd, {
            folders: { exclude: ['node_modules', 'build'] },
        })).hash;

        return {
            id: environment!.sid,
            outs: { sid: environment!.sid, serviceSid, inputs }
        };
    }

    public async update(id:pulumi.ID, olds: any, news:any): Promise<pulumi.dynamic.UpdateResult> {

        const { attributes } = news;

        await deployFlexPlugin(attributes);

        const { sid: serviceSid } = await getService("default", false);

        news.attributes.hash = (await hashElement(attributes.cwd, {
            folders: { exclude: ['node_modules', 'build'] },
        })).hash;
            
        return {
            outs: { 
                sid: id, 
                serviceSid,
                inputs: news
            }
        };
        
    }

    public async delete(id:pulumi.ID, props: any) {

        const client = getTwilioClient();

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
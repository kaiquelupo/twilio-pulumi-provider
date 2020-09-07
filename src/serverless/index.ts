import * as pulumi from "@pulumi/pulumi";
import * as twilio from "twilio"; 
import { isEqual } from "lodash";
import { getAPI, cleanObject } from "../utils/api";
import { transformServerlessAttributes } from "../utils";
import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import { hashElement } from 'folder-hash';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, FILES } = process.env;

export interface WorkspaceArgs {
    attributes: pulumi.Input<any>;
}

class ServerlessProvider implements pulumi.dynamic.ResourceProvider {

    public async check(olds: any, news: any): Promise<pulumi.dynamic.CheckResult> {

        news.attributes.overrideExistingService = true;

        news.attributes.hash = (await hashElement(news.attributes.cwd, {
            folders: { exclude: ['node_modules'] },
        })).hash;

        return { inputs: news };

    }

    public async diff(id: pulumi.ID, olds: any, news: any): Promise<pulumi.dynamic.DiffResult> {
        
        const { attributes } = olds.inputs;

        return { 
            changes:  !isEqual(attributes, news.attributes)  
        };

    }

    public async create(inputs: any): Promise<pulumi.dynamic.CreateResult> {

        const { attributes } = inputs;

        const newAttributes = transformServerlessAttributes(attributes);

        const client =  
            new TwilioServerlessApiClient({
                username: TWILIO_ACCOUNT_SID!,
                password: TWILIO_AUTH_TOKEN!
            });

        let { sid, ...info } = 
            cleanObject(
                await client.deployLocalProject(newAttributes),
                true
            );
            
        return {
            id: sid,
            outs: { sid, inputs, info },
        };
    }

    public async update(id:pulumi.ID, olds: any, news:any): Promise<pulumi.dynamic.UpdateResult> {

        const { attributes } = news;

        const newAttributes = transformServerlessAttributes(attributes);

        const client =  
            new TwilioServerlessApiClient({
                username: TWILIO_ACCOUNT_SID!,
                password: TWILIO_AUTH_TOKEN!
            });

        let { sid, ...info } = 
            cleanObject(
                await client.deployLocalProject(newAttributes),
                true
            );
            
        return {
            outs: { 
                sid, 
                inputs: news, 
                info 
            },
        };
     }

    public async delete(id:pulumi.ID, props: any) {

       const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        await getAPI(client, ["serverless", "services"])(id).remove();

    }
}

export class Serverless extends pulumi.dynamic.Resource {
    public readonly sid?: pulumi.Output<string>;
    public readonly inputs?: pulumi.Output<any>;
    public readonly info?: pulumi.Output<any>;

    constructor(name: string, args: WorkspaceArgs, opts?: pulumi.CustomResourceOptions) {
        super(new ServerlessProvider(), name, { ...args, sid: undefined, inputs: undefined, info: undefined }, opts);
    }
}
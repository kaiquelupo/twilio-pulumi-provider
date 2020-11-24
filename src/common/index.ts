import * as pulumi from "@pulumi/pulumi";
import { isEqual } from "lodash";
import { getTwilioClient } from "../utils";
import { getAPI, cleanObject } from "../utils/api";

export interface WorkspaceArgs {
    resource: pulumi.Input<any>;
    attributes: pulumi.Input<any>;
}

class ResourceProvider implements pulumi.dynamic.ResourceProvider {

    public async check(olds: any, news: any): Promise<pulumi.dynamic.CheckResult> {

        return { inputs: news };

    }

    public async diff(id: pulumi.ID, olds: any, news: any): Promise<pulumi.dynamic.DiffResult> {

        const { attributes, resource } = olds.inputs;
        const { replaceAndNotDelete } = news.attributes;

        let replaces = replaceAndNotDelete ? [ "replaceAndNotDelete" ] : [];

        if(!isEqual(resource, news.resource)){
            replaces = [ "resource" ];
        }

        return { 
            changes: 
                replaces.length > 0 || 
                !isEqual(attributes, news.attributes),
            replaces
        };

    }

    public async read(id: pulumi.ID, props?: any): Promise<pulumi.dynamic.ReadResult> {

        const { inputs } = props;

        const client : any = getTwilioClient();

        const info = cleanObject(await getAPI(client, inputs.resource)(id).fetch(), false);

        return {
            id: info.sid,
            props:  { ...props, info }
        };

    }

    public async create(inputs: any): Promise<pulumi.dynamic.CreateResult> {

        const { resource, attributes } = inputs;

        const client : any = getTwilioClient();

        let info:any;

        if(attributes.sid) {

            await getAPI(client, resource)(attributes.sid).fetch();

            info = cleanObject(await getAPI(client, resource)(attributes.sid).update(attributes), false);

        } else {

            info = cleanObject(await (getAPI(client, resource).create(attributes)), false);

        }
            
        return {
            id: info.sid,
            outs: { sid: info.sid, inputs: cleanObject(inputs, false), info },
        };
    }

    public async update(id:pulumi.ID, olds: any, news:any): Promise<pulumi.dynamic.UpdateResult> {

        const client = getTwilioClient();

        const { resource, attributes } = news;

        const info = cleanObject(await getAPI(client, resource)(id).update(attributes), false);

        return {
            outs: { sid: info.sid, inputs: cleanObject(news, false), info }
        }   
     }

    public async delete(id:pulumi.ID, props: any) {

       const client = getTwilioClient();

       if(!props.inputs.attributes.sid && !props.inputs.attributes.replaceAndNotDelete){

        await getAPI(client, props.inputs.resource)(id).remove();

       }

    }
}

export class Resource extends pulumi.dynamic.Resource {
    public readonly sid?: pulumi.Output<string>;
    public readonly inputs?: pulumi.Output<any>;
    public readonly info?: pulumi.Output<any>;

    constructor(name: string, args: WorkspaceArgs, opts?: pulumi.CustomResourceOptions) {
        super(new ResourceProvider(), name, { ...args, sid: undefined, inputs: undefined, info: undefined }, opts);
    }
}
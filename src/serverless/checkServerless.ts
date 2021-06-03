import { getTwilioClient } from "../utils";

export const getDomainName = async (serviceName: string, branch: string) => {

    const client : any = getTwilioClient();

    const BRANCH_NAME = branch;
    const service: any = await getService(serviceName, true);
    
    const environments = await client.serverless.services(service.sid)
        .environments
        .list({limit: 20});

    let environment = environments.find((environment:any) => environment.domainSuffix === BRANCH_NAME);

    if(!environment) {

        const { domainName } = await client.serverless.services(service.sid)
            .environments
            .create({ domainSuffix: BRANCH_NAME, uniqueName: BRANCH_NAME });

        environment = { domainName };
    }

    return environment.domainName;
    
}

export const getService = async (serviceName:string, create:boolean) => {

    const client : any = getTwilioClient();

    const services = await client.serverless.services.list();

    let service = services.find((service:any) => service.uniqueName === serviceName);

    if(!service && create){
        
        const { sid } = await client.serverless.services
            .create({
                includeCredentials: true,
                uniqueName: serviceName,
                friendlyName: serviceName === "default" ?  
                    "Flex Plugins Default Service" : serviceName
            }); 

        service = { sid };    
    
    }

    return service;
} 
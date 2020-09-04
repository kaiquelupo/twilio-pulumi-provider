
export const getDomainName = async (serviceName: string, branch: string) => {

    const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const BRANCH_NAME = branch;
    const service: any = await getOrCreateService(serviceName);
    
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

export const getOrCreateService = async (serviceName:string) => {

    const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const services = await client.serverless.services.list();

    let service = services.find((service:any) => service.uniqueName === serviceName);

    if(!service){
        
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
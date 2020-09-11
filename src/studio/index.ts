import { getAPI } from "../utils/api";
import * as twilio from "twilio"; 

export const getStudioFlowDefinition = async (attributes:any, options:any) => {

    const { flowSid, revision, environment } = attributes;

    const environmentName = environment.toUpperCase();

    const definitionClient : any = twilio(
        process.env[`TWILIO_${environmentName}_ACCOUNT_SID`], 
        process.env[`TWILIO_${environmentName}_AUTH_TOKEN`]
    );

    const studioFlow = (await getAPI(definitionClient, ["studio", {"flows" : flowSid}, "revisions"])(revision).fetch()).definition;

    const transformedStudioFlow = options.transformations.reduce((prev:any, cur:any) => {

        if(typeof cur === "function") {
            return cur(prev);
        } else {
            runTransformation(cur, prev);
            return prev;
        }

    }, studioFlow);

    return transformedStudioFlow;
}


const runTransformation = (attributes:any, obj:any) => {

    const { name, widgets, types, value, matchValues, matchProps, exec } = attributes;

    let tempObj = obj.states;

    if(widgets && Array.isArray(widgets)) {
        tempObj = tempObj.filter((widget:any) => widgets.includes(widget.name));
    }

    if(types && Array.isArray(types)) {
        tempObj = tempObj.filter((widget:any) => types.includes(widget.type));
    }

    switch(name) {
        case "changeWidgetProps": 
            
            tempObj.forEach((state:any) => {
                exec(state);
            });

            break;

        case "replaceValue": 

            tempObj.forEach((state:any) => {
                
                Object.keys(state).forEach((prop:string) => {

                    if(matchProps) {
                        if(prop.match(new RegExp(matchProps))){
                            state[prop] = value;
                        }
                    }

                    if(matchValues) {
                        if(state[prop].match(new RegExp(matchValues))){
                            state[prop] = value;
                        }
                    }
                });

            });

            break;

        default : break;
    }

}
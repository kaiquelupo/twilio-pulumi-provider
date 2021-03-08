import { readFileSync }  from 'fs';

export const getStudioFlowDefinition = async (attributes:any, options:any) => {

    const { pathToFlow } = attributes;

    const fileContent = readFileSync(pathToFlow);
    const studioFlow = JSON.parse(fileContent.toString());

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

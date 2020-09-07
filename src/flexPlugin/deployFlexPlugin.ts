import { getPaths, getEnv } from "../utils";
import { hashElement } from 'folder-hash';


export const deployFlexPlugin = async (attributes: any) => {

    //The credentials are exposed here if any log such as error occurs. 

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env

    return runScriptInPlugins(
        attributes, 
        ({ absolutePath, envs}:any) => `
            cd ${absolutePath} && 
            npm install && 
            TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID} TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN} ${envs} npm run deploy
        `
    );
};

export const runFlexPluginsTests = async (attributes: any) => {

    return runScriptInPlugins(
        attributes,
        ({absolutePath, envs}:any) => `
            cd ${absolutePath} && 
            npm install && 
            CI=true ${envs} npm run test
        `
    );
};

const runScriptInPlugins = async (attributes:any, script: any) => {

    const { cwd, env } = attributes;

    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    const { absolutePath } = getPaths(cwd);

    const envs = getPluginVars(absolutePath, env); 

    try {                
                
        await exec(script({ absolutePath, envs, exec}));

    } catch (err){

        throw new Error(err);

    }

}

const getPluginVars = (absolutePath:string, env: any) => {

    const envFile = getEnv(`${absolutePath}/.env`);
    const listOfVars = Object.keys(envFile);

    return Object.keys(env).reduce((pr: string, cur: string) => {

        if(listOfVars.includes(cur)) {
            return `${pr} ${cur}=${env[cur]}`
        }

        return pr;

    }, "");

}

export const getArrayOfHashes = async (cwd:string) => {
    const rawHashObj = await hashElement(cwd);

    return rawHashObj.children.reduce((pr: any[], cur) => [...pr, { name: cur.name, hash: cur.hash }], []);
}
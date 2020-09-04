import { getPaths, getDirectories, getAllDirectories, getEnv } from "../utils";

export const deployFlexPlugins = async (attributes: any) => {

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env

    return runScriptInPlugins({
        ...attributes, 
        info: (finalPlugins:string[]) => {

            if(finalPlugins.length > 0) {
                console.log("At least one plugin needs to be deployed: \n");
            } else {
                console.log("No plugin needs to be deployed \n");
            }
        },
        script: async ({ absolutePath, plugin, envs, exec }:any) => {

            try{                
                console.log(`- "Deploying plugin "${plugin}"`);

                await exec(`
                    cd ${absolutePath}/${plugin} && 
                    npm install && 
                    TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID} TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN} ${envs} npm run deploy
                `);

                console.log(`✔ Plugin ${plugin} deployed\n`);

            } catch (err){

                console.log(`x Plugin ${plugin} deploy failed\n`);
                throw new Error(err);

            }
        }

    });
};

export const runFlexPluginsTests = async (attributes: any) => {

    return runScriptInPlugins({
        ...attributes, 
        info: (finalPlugins:string[]) => {

            if(finalPlugins.length > 0) {
                console.log("At least one plugin needs to be tested: \n");
            } else {
                console.log("No plugin needs to be tested \n");
            }
        },
        script: async ({ absolutePath, plugin, envs, exec }:any) => {

            try{                
                console.log(`- "Testing plugin "${plugin}"`);

                await exec(`
                    cd ${absolutePath}/${plugin} && 
                    npm install && 
                    CI=true npm run test
                `);

                console.log(`✔ Plugin ${plugin} tested\n`);

            } catch (err){

                console.log(`x Plugin ${plugin} test failed\n`);
                throw new Error(err);

            }
        }

    });
};

const runScriptInPlugins = async ({ files, plugins, cwd, env, deployAll, test, info, script }: any) => {

    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    const { PULUMI_CI } = process.env

    const { absolutePath, relativePath} = getPaths(cwd);

    //TODO: find a better way of running it with preview
    let finalPlugins:string[] = (deployAll || PULUMI_CI === "PR") ? 
        getAllDirectories(absolutePath): 
        getDirectories({ files, relativePath, absolutePath });
    
    if(plugins) {

        finalPlugins = finalPlugins.filter((plugin:string) => plugins.includes(plugin));

    }

    if(info) {
        info(finalPlugins);
    }

    await Promise.all(finalPlugins.map(async (plugin: string) => {
        
        const envs = getPluginVars(absolutePath, plugin, env); 
        return script({ absolutePath, plugin, envs, exec});

    }));
}

const getPluginVars = (absolutePath:string, plugin:string, env: any) => {

    const envFile = getEnv(`${absolutePath}/${plugin}/.env`);
    const listOfVars = Object.keys(envFile);

    return Object.keys(env).reduce((pr: string, cur: string) => {

        if(listOfVars.includes(cur)) {
            return `${pr} ${cur}=${env[cur]}`
        }

        return pr;

    }, "");

}
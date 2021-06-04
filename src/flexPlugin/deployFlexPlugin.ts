import { getPaths } from "../utils";
import { hashElement } from 'folder-hash';
import * as childProcess from 'child_process';

const setDeployFlags = (attributes:any):string[] => {

    const result = [];

    if(attributes.description) {
        result.push(`--description=${attributes.description}`)
    }

    ['major', 'minor', 'patch', 'public'].forEach(flag => {
        if(attributes[flag]){ 
            result.push(`--${flag}`)
        }
    });

    return result;

}

const setReleaseFlags = (attributes:any, packageJson:any):string[] => {

    const result = [];

    if(attributes.name) {
        result.push(`--name=${attributes.name}`)
    }

    if(attributes.description) {
        result.push(`--description=${attributes.description}`)
    }

    if(attributes.disablePlugin) {
        result.push(`--disable-plugin=${packageJson.name}`)
    }

    return result;
}

export const deployFlexPlugin = async (attributes: any) => {

    try {

        const { absolutePath } = getPaths(attributes.cwd);

        const env = { 
            ...process.env,
            ...(attributes.env || {})
        };

        await childProcess.execFileSync('twilio', [
            'flex:plugins:deploy',
            `--changelog=${attributes.changelog || 'deployed by infra as code'}`,
            ...setDeployFlags(attributes)
        ], {
            cwd: absolutePath,
            stdio: 'inherit',
            env
        });

        if(attributes.release) {

            const pluginPackageJson = 
                require(`${absolutePath}/package.json`);

            if(pluginPackageJson) {

                await childProcess.execFileSync('twilio', [
                    'flex:plugins:release', 
                    `--enable-plugin=${pluginPackageJson.name}@latest`,
                    ...setReleaseFlags(attributes.release, pluginPackageJson)
                ], {
                    cwd: absolutePath,
                    stdio: 'inherit',
                    env
                });

            }

        }

    } catch (err) {

        throw new Error(err);

    }

}

export const getArrayOfHashes = async (cwd:string) => {
    const rawHashObj = await hashElement(cwd);

    return rawHashObj.children.reduce((pr: any[], cur) => [...pr, { name: cur.name, hash: cur.hash }], []);
}
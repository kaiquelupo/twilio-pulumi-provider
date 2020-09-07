import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export const getEnv = (path:string) => {
 return dotenv.parse(fs.readFileSync(path, 'utf8').toString())
}

export const transformServerlessAttributes = (attributes: any) => {

    const { envPath, env, cwd } = attributes;

    const newAttributes = { ...attributes };

    newAttributes.cwd = path.join(process.cwd(), cwd);
    newAttributes.pkgJson = require(path.join(newAttributes.cwd, "package.json"));
    
    if(envPath) {
        newAttributes.env = {
            ...env,
            ...getEnv(path.join(newAttributes.cwd, envPath))
        }  
    }

    return newAttributes;
}

export const getPaths = (cwd:string) => {

    const absolutePath = cwd ? path.join(process.cwd(), cwd) : process.cwd();
    const pathMatch = absolutePath.match(/.*\/(src\/.*)/);
    const relativePath = pathMatch ? pathMatch[1] : "";

    return {
        absolutePath,
        relativePath
    }
}
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

export const getDirectories = ({ files, relativePath, absolutePath }:any) => {

    let folders: string[] = [];

    if(files){

        const filesList  = files.split(" ") || [];

        folders = filesList.reduce((pr: string[], cur:string) => {

            const match = cur.match(new RegExp(`${relativePath.replace(/\//gi, "\\/")}\\/([a-z-A-Z]*)\\/.*`));

            if(match && !pr.includes(match[1])){
                return [...pr, match[1]];
            }

            return pr;

        }, []);

    } 

    return folders;

}

export const getAllDirectories = (source:string) => {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}
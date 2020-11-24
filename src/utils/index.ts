import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import * as twilio from "twilio"; 

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

export const getTwilioClient = (opts?:any) => {

    const { isServerless=false } = opts || {};

    const { 
        TWILIO_ACCOUNT_SID, 
        TWILIO_AUTH_TOKEN, 
        TWILIO_USERNAME, 
        TWILIO_PASSWORD 
    } = process.env;
    
    if(isServerless) {

        return new TwilioServerlessApiClient({
            username: (TWILIO_USERNAME || TWILIO_ACCOUNT_SID)!,
            password: (TWILIO_PASSWORD || TWILIO_AUTH_TOKEN)!
        })

    }

    return TWILIO_USERNAME ? 
        twilio(TWILIO_USERNAME, TWILIO_PASSWORD, { accountSid: TWILIO_ACCOUNT_SID }) : 
        twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}
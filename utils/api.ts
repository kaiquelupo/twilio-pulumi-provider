import { pick } from "lodash";

export const getAPI = (client:any, resource:any) => {

    return resource.reduce((prev: any, cur: any) => {

        const path = prev == null ? client : prev;

        if(typeof cur === "object") {

            return path[Object.keys(cur)[0]](cur[Object.keys(cur)[0]]);

        } else {

            return path[cur];

        }

    }, null);

}

export const cleanObject = (obj: any, isServerless: boolean) => {
    if(isServerless) {

        return {
            sid: obj.serviceSid,
            ...pick(obj, ['serviceSid', 'environmentSid', 'buildSid', 'domain'])
        }

    } else {

        return Object.keys(obj).reduce((pr: any, cur: any) => {
            if(cur.match(/^_/)){
                return pr;
            }
            return {
                ...pr,
                [cur]: obj[cur]
            }
        }, {})

    }
}
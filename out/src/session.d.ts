import * as request from "request";
export declare class Session {
    cookie: request.CookieJar;
    constructor(serializedObject?: any);
    toJSON(): any;
}

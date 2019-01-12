import * as request from "request"
import { CookieJar } from "tough-cookie"

export class Session {
    public cookie: request.CookieJar
    constructor(serializedObject?: any) {
        this.cookie = request.jar()
        if (serializedObject) {
            (this.cookie as any)._jar = CookieJar.deserializeSync(serializedObject)
        }
    }
    public toJSON(): any {
        return (this.cookie as any)._jar.toJSON()
    }
}

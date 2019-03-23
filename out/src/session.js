"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const tough_cookie_1 = require("tough-cookie");
class Session {
    constructor(serializedObject) {
        this.cookie = request.jar();
        if (serializedObject) {
            this.cookie._jar = tough_cookie_1.CookieJar.deserializeSync(serializedObject);
        }
    }
    toJSON() {
        return this.cookie._jar.toJSON();
    }
}
exports.Session = Session;
//# sourceMappingURL=session.js.map
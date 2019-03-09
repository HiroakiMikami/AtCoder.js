"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
function get(domain, path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const r = request.defaults({ jar: options.session.cookie });
        const result = yield new Promise((resolve, reject) => {
            r({ url: `${domain}/${path}`, headers: options.headers }, (err, response, body) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve([response, body]);
            });
        });
        return { body: result[1] };
    });
}
exports.get = get;
function postForm(domain, path, data, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const r = request.defaults({ jar: options.session.cookie });
        const result = yield new Promise((resolve, reject) => {
            r.post({ url: `${domain}/${path}`, headers: options.headers, form: data }, (err, response, body) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve([response, body]);
            });
        });
        return { body: result[1] };
    });
}
exports.postForm = postForm;
//# sourceMappingURL=request.js.map
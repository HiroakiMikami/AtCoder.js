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
class HttpClient {
    get(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = request.defaults({ jar: options.session.cookie });
            const result = yield new Promise((resolve, reject) => {
                r({ url, headers: options.headers }, (err, response, body) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve([response, body]);
                });
            });
            return { code: result[0].statusCode, body: result[1] };
        });
    }
    postForm(url, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = request.defaults({ jar: options.session.cookie });
            const result = yield new Promise((resolve, reject) => {
                r.post({ url, headers: options.headers, form: data }, (err, response, body) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve([response, body]);
                });
            });
            return { code: result[0].statusCode, body: result[1] };
        });
    }
}
exports.HttpClient = HttpClient;
class CachedClient {
    constructor(client) {
        this.client = client;
        this.cachedContent = new Map();
    }
    clearCache() {
        this.cachedContent.clear();
    }
    get(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cachedContent.has(url)) {
                return this.cachedContent.get(url);
            }
            const response = yield this.client.get(url, options);
            this.cachedContent.set(url, response);
            return response;
        });
    }
    postForm(url, data, options) {
        return this.client.postForm(url, data, options);
    }
}
exports.CachedClient = CachedClient;
class ClientWithValidation {
    constructor(client) {
        this.client = client;
    }
    get(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.get(url, options);
            if (response.code >= 400) {
                throw response;
            }
            return response;
        });
    }
    postForm(url, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.postForm(url, data, options);
            if (response.code >= 400) {
                throw response;
            }
            return response;
        });
    }
}
exports.ClientWithValidation = ClientWithValidation;
//# sourceMappingURL=client.js.map
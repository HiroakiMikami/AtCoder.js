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
            return yield new Promise((resolve, reject) => {
                r({ url, headers: options.headers }, (err, response) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(response);
                });
            });
        });
    }
    postForm(url, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = request.defaults({ jar: options.session.cookie });
            return yield new Promise((resolve, reject) => {
                r.post({ url, headers: options.headers, form: data }, (err, response) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(response);
                });
            });
        });
    }
}
exports.HttpClient = HttpClient;
class CachedClient {
    constructor(client, cache) {
        this.client = client;
        this.cache = cache;
    }
    clearCache() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cache.clear();
            return;
        });
    }
    get(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const tag = encodeURIComponent(url);
            const entry = yield this.cache.get(tag);
            if (entry !== null) {
                return entry;
            }
            const response = yield this.client.get(url, options);
            if (typeof response.body === "string") {
                return yield this.cache.put(tag, response);
            }
            return response;
        });
    }
    postForm(url, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.postForm(url, data, options);
        });
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
            if (response.statusCode >= 400) {
                throw response;
            }
            return response;
        });
    }
    postForm(url, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.postForm(url, data, options);
            if (response.statusCode >= 400) {
                throw response;
            }
            return response;
        });
    }
}
exports.ClientWithValidation = ClientWithValidation;
//# sourceMappingURL=client.js.map
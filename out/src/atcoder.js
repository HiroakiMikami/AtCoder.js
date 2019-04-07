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
const cheerio = require("cheerio");
const cache_1 = require("./cache");
const client_1 = require("./client");
const contest_1 = require("./contest");
const session_1 = require("./session");
class AtCoder {
    constructor(session, options) {
        const rawClient = options.rawClient || new client_1.ClientWithValidation(new client_1.HttpClient());
        const cacheOptions = options.cache || { maxMemoryEntries: 0 };
        const url = options.url || {};
        let client = rawClient;
        const caches = [];
        if (cacheOptions.maxMemoryEntries !== null) {
            caches.push(new cache_1.MemoryCache(cacheOptions.maxMemoryEntries));
        }
        if (cacheOptions.cachedir !== null && cacheOptions.cachedir !== undefined) {
            caches.push(new cache_1.FilesystemCache(cacheOptions.cachedir));
        }
        if (caches.length !== 0) {
            client = new client_1.CachedClient(client, new cache_1.CompositeCache(caches));
        }
        this.params = {
            client,
            session,
            url: {
                atcoder: url.atcoder || "https://atcoder.jp",
                atcoderProblems: url.atcoderProblems || "https://kenkoooo.com/atcoder",
            },
        };
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.params.client.get(`${this.params.url.atcoder}/login`, { session: this.params.session });
            const dom = cheerio.load(r.body);
            const csrfToken = dom(`input[name=csrf_token]`).attr("value");
            const r2 = yield this.params.client.postForm(`${this.params.url.atcoder}/login`, { username, password, csrf_token: csrfToken }, { session: this.params.session });
            if (r2.body !== "") {
                throw new Error(`Login failed: ${r2.body}`);
            }
            // Clear all cache
            if (this.params.client instanceof client_1.CachedClient) {
                yield this.params.client.clearCache();
            }
        });
    }
    isLoggedIn() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.params.client.get(this.params.url.atcoder, { session: this.params.session });
            const dom = cheerio.load(page.body);
            if (dom('a[href="javascript:form_logout.submit()"]').length === 0) {
                return false;
            }
            else {
                return true;
            }
        });
    }
    contests() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.params.client.get(`${this.params.url.atcoderProblems}/resources/contests.json`, { session: new session_1.Session() });
            const contests = JSON.parse(response.body.toString());
            return contests.map((data) => data.id);
        });
    }
    contest(id) {
        return new contest_1.Contest(id, this.params);
    }
}
exports.AtCoder = AtCoder;
//# sourceMappingURL=atcoder.js.map
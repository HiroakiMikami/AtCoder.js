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
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
class MemoryCache {
    constructor(maxElements = 0) {
        this.maxElements = maxElements;
        this.cachedContent = new Map();
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cachedContent.clear();
            return;
        });
    }
    put(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cachedContent.has(key)) {
                this.cachedContent.set(key, value);
                return value;
            }
            if (this.maxElements > 0) {
                /* Remove random elements */
                while (this.cachedContent.size >= this.maxElements) {
                    const keyToBeDeleted = Array.from(this.cachedContent.keys())[Math.floor(Math.random() * this.cachedContent.size)];
                    this.cachedContent.delete(keyToBeDeleted);
                }
            }
            this.cachedContent.set(key, value);
            return value;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cachedContent.has(key)) {
                return this.cachedContent.get(key);
            }
            return null;
        });
    }
}
exports.MemoryCache = MemoryCache;
class FilesystemCache {
    constructor(cachedir) {
        this.cachedir = cachedir;
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const file of yield util_1.promisify(fs.readdir)(this.cachedir)) {
                yield util_1.promisify(fs.unlink)(path.join(this.cachedir, file));
            }
        });
    }
    put(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield util_1.promisify(fs.exists)(this.cachedir))) {
                yield util_1.promisify(fs.mkdir)(this.cachedir);
            }
            yield util_1.promisify(fs.writeFile)(path.join(this.cachedir, key), JSON.stringify(value));
            return value;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield util_1.promisify(fs.exists)(path.join(this.cachedir, key))) {
                const content = yield util_1.promisify(fs.readFile)(path.join(this.cachedir, key), "utf8");
                try {
                    const output = JSON.parse(content);
                    return output;
                }
                catch (exception) {
                    return null;
                }
            }
            return null;
        });
    }
}
exports.FilesystemCache = FilesystemCache;
class CompositeCache {
    constructor(caches) {
        this.caches = caches;
    }
    put(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const cache of this.caches) {
                yield cache.put(key, value);
            }
            return value;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const cache of this.caches) {
                const v = yield cache.get(key);
                if (v !== null) {
                    return v;
                }
            }
            return null;
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const cache of this.caches) {
                yield cache.clear();
            }
        });
    }
}
exports.CompositeCache = CompositeCache;
//# sourceMappingURL=cache.js.map
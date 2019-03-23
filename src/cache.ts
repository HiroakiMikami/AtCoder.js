import * as fs from "fs"
import * as path from "path"
import { promisify} from "util"

export interface ICache<K, V> {
    put(key: K, value: V): Promise<V>
    get(key: K): Promise<V | null>
    clear(): Promise<void>
}

export class MemoryCache<K, V> implements ICache<K, V> {
    private cachedContent: Map<K, V>
    constructor(private maxElements: number = 0) {
        this.cachedContent = new Map<K, V>()
    }
    public async clear() {
        this.cachedContent.clear()
        return
    }
    public async put(key: K, value: V) {
        if (this.cachedContent.has(key)) {
            this.cachedContent.set(key, value)
            return value
        }

        if (this.maxElements > 0) {
            /* Remove random elements */
            while (this.cachedContent.size >= this.maxElements) {
                const keyToBeDeleted =
                    Array.from(this.cachedContent.keys())[Math.floor(Math.random() * this.cachedContent.size)]
                this.cachedContent.delete(keyToBeDeleted)
            }
        }
        this.cachedContent.set(key, value)
        return value
    }
    public async get(key: K) {
        if (this.cachedContent.has(key)) {
            return this.cachedContent.get(key)
        }
        return null
    }
}

export class FilesystemCache<V> implements ICache<string, V> {
    constructor(private cachedir: string) {}

    public async clear() {
        for (const file of await promisify(fs.readdir)(this.cachedir)) {
            await promisify(fs.unlink)(path.join(this.cachedir, file))
        }
    }
    public async put(key: string, value: V) {
        if (!await promisify(fs.exists)(this.cachedir)) {
            await promisify(fs.mkdir)(this.cachedir)
        }
        await promisify(fs.writeFile)(path.join(this.cachedir, key), JSON.stringify(value))

        return value
    }
    public async get(key: string) {
        if (await promisify(fs.exists)(path.join(this.cachedir, key))) {
            const content = await promisify(fs.readFile)(path.join(this.cachedir, key), "utf8")
            try {
                const output = JSON.parse(content)
                return output as V
            } catch (exception) {
                return null
            }
        }
        return null
    }
}

export class CompositeCache<K, V> implements ICache<K, V> {
    constructor(private caches: Array<ICache<K, V>>) {}
    public async put(key: K, value: V): Promise<V> {
        for (const cache of this.caches) {
            await cache.put(key, value)
        }
        return value
    }
    public async get(key: K): Promise<V> {
        for (const cache of this.caches) {
            const v = await cache.get(key)
            if (v !== null) {
                return v
            }
        }
        return null
    }
    public async clear(): Promise<void> {
        for (const cache of this.caches) {
            await cache.clear()
        }
    }
}

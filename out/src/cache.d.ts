export interface ICache<K, V> {
    put(key: K, value: V): Promise<V>;
    get(key: K): Promise<V | null>;
    clear(): Promise<void>;
}
export declare class MemoryCache<K, V> implements ICache<K, V> {
    private maxElements;
    private cachedContent;
    constructor(maxElements?: number);
    clear(): Promise<void>;
    put(key: K, value: V): Promise<V>;
    get(key: K): Promise<V>;
}
export declare class FilesystemCache<V> implements ICache<string, V> {
    private cachedir;
    constructor(cachedir: string);
    clear(): Promise<void>;
    put(key: string, value: V): Promise<V>;
    get(key: string): Promise<V>;
}
export declare class CompositeCache<K, V> implements ICache<K, V> {
    private caches;
    constructor(caches: Array<ICache<K, V>>);
    put(key: K, value: V): Promise<V>;
    get(key: K): Promise<V>;
    clear(): Promise<void>;
}

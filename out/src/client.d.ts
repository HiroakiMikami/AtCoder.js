import { Session } from "./session";
export interface IResponse {
    code: number;
    body: any;
}
export interface IOptions {
    session: Session;
    headers?: {
        [index: string]: string;
    };
}
export interface IClient {
    get(url: string, options: IOptions): Promise<IResponse>;
    postForm(url: string, data: any, options: IOptions): Promise<IResponse>;
}
export declare class HttpClient implements IClient {
    get(url: string, options: IOptions): Promise<IResponse>;
    postForm(url: string, data: any, options: IOptions): Promise<IResponse>;
}
export declare class CachedClient implements IClient {
    private client;
    private cachedContent;
    constructor(client: IClient);
    clearCache(): void;
    get(url: string, options: IOptions): Promise<IResponse>;
    postForm(url: string, data: any, options: IOptions): Promise<IResponse>;
}
export declare class FilesystemCachedClient implements IClient {
    private client;
    private cachedir;
    constructor(client: IClient, cachedir: string);
    get(url: string, options: IOptions): Promise<IResponse>;
    postForm(url: string, data: any, options: IOptions): Promise<IResponse>;
}
export declare class ClientWithValidation implements IClient {
    private client;
    constructor(client: IClient);
    get(url: string, options: IOptions): Promise<IResponse>;
    postForm(url: string, data: any, options: IOptions): Promise<IResponse>;
}

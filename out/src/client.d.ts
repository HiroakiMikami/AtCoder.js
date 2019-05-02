import { ICache } from "./cache";
import { Session } from "./session";
export interface IResponse {
    statusCode: number;
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
    private cache;
    constructor(client: IClient, cache: ICache<string, IResponse>);
    clearCache(): Promise<void>;
    get(url: string, options: IOptions): Promise<IResponse>;
    postForm(url: string, data: any, options: IOptions): Promise<IResponse>;
}
export declare class ClientWithValidation implements IClient {
    private client;
    constructor(client: IClient);
    get(url: string, options: IOptions): Promise<IResponse>;
    postForm(url: string, data: any, options: IOptions): Promise<IResponse>;
}

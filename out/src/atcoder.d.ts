import { IClient } from "./client";
import { Contest } from "./contest";
import { Session } from "./session";
export interface IUrl {
    atcoder?: string;
    atcoderProblems?: string;
}
export interface IParams {
    url: {
        atcoder: string;
        atcoderProblems: string;
    };
    client: IClient;
    session: Session;
}
export interface ICacheOptions {
    maxMemoryEntries: number | null;
    cachedir?: string;
}
export interface IOptions {
    cache?: ICacheOptions;
    rawClient?: IClient;
    url?: IUrl;
}
export declare class AtCoder {
    private params;
    constructor(session: Session, options: IOptions);
    login(username: string, password: string): Promise<void>;
    isLoggedIn(): Promise<boolean>;
    contests(): Promise<string[]>;
    contest(id: string): Contest;
}

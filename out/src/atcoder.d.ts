import { IClient } from "./client";
import { Contest } from "./contest";
import { Session } from "./session";
export declare enum Language {
    English = 1,
    Japanese = 2
}
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
    languages: ReadonlySet<Language>;
}
export interface ICacheOptions {
    maxMemoryEntries: number | null;
    cachedir?: string;
}
export interface IOptions {
    cache?: ICacheOptions;
    rawClient?: IClient;
    url?: IUrl;
    languages?: ReadonlySet<Language>;
}
export declare class AtCoder {
    private params;
    constructor(session: Session, options: IOptions);
    login(username: string, password: string): Promise<void>;
    isLoggedIn(): Promise<boolean>;
    contests(): Promise<string[]>;
    contest(id: string): Contest;
}

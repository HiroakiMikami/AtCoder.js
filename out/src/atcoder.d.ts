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
    rawClient: IClient;
    session: Session;
}
export declare class AtCoder {
    private params;
    constructor(session: Session, rawClient?: IClient, url?: IUrl, cachedir?: string);
    login(username: string, password: string): Promise<void>;
    isLoggedIn(): Promise<boolean>;
    contests(): Promise<string[]>;
    contest(id: string): Contest;
}

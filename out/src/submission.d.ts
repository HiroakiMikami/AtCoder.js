/// <reference types="cheerio" />
import { IParams } from "./atcoder";
import { INumberWithUnits } from "./utils";
export declare enum Status {
    WJ = "WJ",
    AC = "AC",
    WA = "WA",
    IE = "IE",
    OLE = "OLE",
    RE = "RE",
    TLE = "TLE",
    MLE = "MLE",
    CE = "CE"
}
export declare function toStatus(value: any): Status[keyof Status] | undefined;
export interface ISubmissionInfo {
    id: string;
    submissionTime: Date;
    task: string;
    user: string;
    language: string;
    codeSize: INumberWithUnits;
    status: Status;
    execTime?: INumberWithUnits;
    memory?: INumberWithUnits;
}
export interface ITestCaseSet {
    name: string;
    score: number;
    maxScore: number;
    testCases: string[];
}
export interface ITestResult {
    name: string;
    status: Status;
    execTime: INumberWithUnits;
    memory: INumberWithUnits;
}
export declare class Submission {
    private contestId;
    private id;
    private params;
    submissionPage: Promise<CheerioStatic> | null;
    constructor(contestId: string, id: string, params: IParams);
    sourceCode(): Promise<string>;
    info(): Promise<ISubmissionInfo>;
    testCaseSets(): Promise<ITestCaseSet[] | null>;
    results(): Promise<ITestResult[] | null>;
    compileError(): Promise<string | null>;
    private sendRequest;
}

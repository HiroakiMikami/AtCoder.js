import { IParams } from "./atcoder";
import { INumberWithUnits } from "./utils";
export interface IFormat {
    input: string;
    output: string;
}
export interface ISample {
    input: string;
    output: string;
    notes: string;
}
export interface ITaskInfo {
    id: string;
    name: string;
    timeLimit: INumberWithUnits;
    memoryLimit: INumberWithUnits;
}
export declare class Task {
    private contestId;
    private id;
    private params;
    private static LANG;
    private static TITLES;
    private tasksPage;
    private languages;
    constructor(contestId: string, id: string, params: IParams);
    info(): Promise<ITaskInfo>;
    score(): Promise<number>;
    problemStatement(): Promise<string>;
    constraints(): Promise<string>;
    format(): Promise<IFormat>;
    examples(): Promise<ISample[]>;
    private language;
    private findSection;
    private toHtml;
    private sendRequest;
}

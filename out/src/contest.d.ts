import { IParams } from "./atcoder";
import { ISubmissionInfo, Status, Submission } from "./submission";
import { ITaskInfo, Task } from "./task";
export interface ISubmissionQuery {
    task?: string;
    language?: string;
    status?: Status;
    user?: string;
    page?: number;
}
export interface ISubmissionPage {
    numberOfPages: number;
    submissions: ISubmissionInfo[];
}
export declare class Contest {
    private id;
    private params;
    private tasksPage;
    constructor(id: string, params: IParams);
    name(): Promise<string>;
    tasks(): Promise<ITaskInfo[]>;
    task(id: string): Task;
    submission(id: string): Submission;
    submissions(query?: ISubmissionQuery): Promise<ISubmissionPage>;
    mySubmissions(query?: ISubmissionQuery): Promise<ISubmissionPage>;
    private parseSubmissions;
    private sendRequestToTasks;
}

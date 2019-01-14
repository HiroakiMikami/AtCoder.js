export enum Status {
    WJ = "WJ",
    AC = "AC",
    WA = "WA", IE = "IE", OLE = "OLE", RE = "RE", TLE = "TLE", MLE = "MLE", CE = "CE",
}
export function toStatus(value: any): Status[keyof Status] | undefined {
    for (const key in Status) {
        if (Status.hasOwnProperty(key) && Status[key] === value) {
            return Status[key]
        }
    }
    return undefined
}

export interface INumberWithUnits {
    value: number
    unit: string
}

export interface ISubmissionSummary {
    id: string
    submissionTime: Date
    task: string
    user: string
    language: string
    codeSize: INumberWithUnits
    status: Status
    execTime: INumberWithUnits
    memory: INumberWithUnits
}

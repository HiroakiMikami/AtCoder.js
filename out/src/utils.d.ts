export interface INumberWithUnits {
    value: number;
    unit: string;
}
export declare function toNumberWithUnits(str: string): {
    unit: string;
    value: number;
};

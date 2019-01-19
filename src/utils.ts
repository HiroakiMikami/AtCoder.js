export interface INumberWithUnits {
    value: number
    unit: string
}

export function toNumberWithUnits(str: string) {
    return { unit: str.split(" ")[1], value: Number(str.split(" ")[0]) }
}

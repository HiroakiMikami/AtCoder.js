"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toNumberWithUnits(str) {
    return { unit: str.split(" ")[1], value: Number(str.split(" ")[0]) };
}
exports.toNumberWithUnits = toNumberWithUnits;
//# sourceMappingURL=utils.js.map
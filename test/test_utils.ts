import * as chai from "chai"
import { toNumberWithUnits } from "../src/utils"
chai.should()

describe("toNumberWithUnits", () => {
    it("parse a string", () => {
        toNumberWithUnits("1 sec").should.deep.equal({ unit: "sec", value: 1 })
    })
})

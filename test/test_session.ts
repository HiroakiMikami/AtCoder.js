import * as chai from "chai"
chai.should()

import { Session } from "../src/session"

describe("Session", () => {
    it("serialize the session", () => {
        const s = new Session()
        s.cookie.setCookie("xxx", "http://tmp")

        const serialized = JSON.stringify(s.toJSON())
        const s2 = new Session(serialized)

        s2.toJSON().should.deep.equal(s.toJSON())

    })
})

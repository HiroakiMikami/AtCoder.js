import * as chai from "chai"
chai.should()

import { AtCoder } from "../src/atcoder"
import { IOptions } from "../src/client"
import { Session } from "../src/session"

describe("AtCoder", () => {
    describe("#login", () => {
        it("send POST request to AtCoder", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ code: 200, body: "<input type='hidden' name='csrf_token' value='tmp'>" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, mockClient, { atcoder: "http://tmp" })
            await atcoder.login("foo", "bar")

            history.should.deep.equal([
                ["http://tmp/login", { session }],
                ["http://tmp/login", { username: "foo", password: "bar", csrf_token: "tmp"}, { session }],
            ])
        })
    })
    describe("#contests", () => {
        it("send GET request to AtCoder Problems", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, _: IOptions) {
                    history.push([url])
                    return Promise.resolve({ code: 200, body: `[{"id":"c1"},{"id":"c2"}]` })
                },
                postForm(url: string, data: any, _: IOptions) {
                    history.push([url, data])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, mockClient,
                                        { atcoder: "http://tmp", atcoderProblems: "http://problems" })
            const contests = await atcoder.contests()
            contests.should.deep.equal(["c1", "c2"])

            history.should.deep.equal([
                ["http://problems/resources/contests.json"],
            ])
        })
    })
})

import * as chai from "chai"
chai.should()

import { AtCoder } from "../src/atcoder"
import { IOptions } from "../src/client"
import { Session } from "../src/session"

describe("AtCoder", () => {
    describe("#login", () => {
        it("post login request", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ body: "<input type='hidden' name='csrf_token' value='tmp'>" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const atcoder = new AtCoder(session, mockClient, "http://tmp")
            await atcoder.login("foo", "bar")

            history.should.deep.equal([
                ["http://tmp/login", { session }],
                ["http://tmp/login", { username: "foo", password: "bar", csrf_token: "tmp"}, { session }],
            ])
        })
    })
})

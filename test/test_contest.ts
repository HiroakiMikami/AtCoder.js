import * as chai from "chai"
chai.should()

import { IOptions } from "../src/client"
import { Contest } from "../src/contest"
import { Session } from "../src/session"

describe("Contest", () => {
    describe("#name", () => {
        it("return the contest name", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ body: "<a class='contest-title'>Title</a>" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const contest = new Contest("c1", session, mockClient, "http://tmp")
            const name = await contest.name()
            name.should.equal("Title")

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks?lang=en", { session }],
            ])
        })
    })
    describe("#problems", () => {
        it("get the list of the problems", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ body: "<table><tbody>" +
                        "<tr><td class='text-center'><a href='contests/c1/tasks/foo'></a></td></tr>" +
                        "<tr><td class='text-center'><a href='contests/c1/tasks/bar'></a></td></tr>" +
                        "</tbody></table"})
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ body: "" })
                },
            }
            const session = new Session()
            const contest = new Contest("c1", session, mockClient, "http://tmp")
            const problems = await contest.problems()
            problems.should.deep.equal(["foo", "bar"])

            history.should.deep.equal([
                ["http://tmp/contests/c1/tasks?lang=en", { session }],
            ])
        })
    })
})

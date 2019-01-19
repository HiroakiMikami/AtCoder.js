import * as chai from "chai"
chai.should()

import { CachedClient, IOptions } from "../src/client"
import { Session } from "../src/session"

describe("CachedClient", () => {
    describe("#get", () => {
        it("caches the response", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const c = new CachedClient(mockClient)

            const session = new Session()
            const res = await c.get("http://tmp", { session })
            res.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", { session }]])

            const res2 = await c.get("http://tmp", { session })
            res2.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", { session }]])
        })
    })
    describe("#postForm", () => {
        it("does not cache the response", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const c = new CachedClient(mockClient)

            const session = new Session()
            const res = await c.postForm("http://tmp", "", { session })
            res.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", "", { session }]])

            const res2 = await c.postForm("http://tmp", "", { session })
            res2.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", "", { session }], ["http://tmp", "", { session }]])
        })
    })
})

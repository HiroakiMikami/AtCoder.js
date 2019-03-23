import * as chai from "chai"
const should = chai.should()
import { MemoryCache } from "../src/cache"
import { CachedClient, ClientWithValidation, IOptions } from "../src/client"
import { Session } from "../src/session"

describe("FilesystemCachedClient", () => {
    describe("#get", () => {
        it("caches the response", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const c = new CachedClient(mockClient, new MemoryCache())

            const session = new Session()
            const res = await c.get("http://tmp", { session })
            res.should.deep.equal({ statusCode: 200, body: "" })
            history.should.deep.equal([["http://tmp", { session }]])

            const res2 = await c.get("http://tmp", { session })
            res2.should.deep.equal({ statusCode: 200, body: "" })
            history.should.deep.equal([["http://tmp", { session }]])
        })
        it("does not cache the response if body is not string", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ statusCode: 200, body: Buffer.from("xxx") })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const c = new CachedClient(mockClient, new MemoryCache())

            const session = new Session()
            const res = await c.get("http://tmp", { session })
            res.should.deep.equal({ statusCode: 200, body: Buffer.from("xxx") })
            history.should.deep.equal([["http://tmp", { session }]])

            const res2 = await c.get("http://tmp", { session })
            res2.should.deep.equal({ statusCode: 200, body: Buffer.from("xxx") })
            history.should.deep.equal([["http://tmp", { session }], ["http://tmp", { session }]])
        })
    })
    describe("#postForm", () => {
        it("does not cache the response", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const c = new CachedClient(mockClient, new MemoryCache())

            const session = new Session()
            const res = await c.postForm("http://tmp", "", { session })
            res.should.deep.equal({ statusCode: 200, body: "" })
            history.should.deep.equal([["http://tmp", "", { session }]])

            const res2 = await c.postForm("http://tmp", "", { session })
            res2.should.deep.equal({ statusCode: 200, body: "" })
            history.should.deep.equal([["http://tmp", "", { session }], ["http://tmp", "", { session }]])
        })
    })
})

describe("ClientWithValidation", () => {
    describe("#get", () => {
        it("do nothing if the code does not represent error", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const c = new ClientWithValidation(mockClient)

            const session = new Session()
            const res = await c.get("http://tmp", { session })
            res.should.deep.equal({ statusCode: 200, body: "" })
            history.should.deep.equal([["http://tmp", { session }]])
        })
        it("throw error if the code represents error", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ statusCode: 404, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 404, body: "" })
                },
            }
            const c = new ClientWithValidation(mockClient)

            const session = new Session()
            try {
                await c.get("http://tmp", { session })
            } catch (e) {
                e.should.deep.equal({ statusCode: 404, body: "" })
                history.should.deep.equal([["http://tmp", { session }]])
                return
            }
            should.exist(null) // fail
        })
    })
    describe("#postForm", () => {
        it("do nothing if the code does not represent error", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 200, body: "" })
                },
            }
            const c = new ClientWithValidation(mockClient)

            const session = new Session()
            const res = await c.postForm("http://tmp", "", { session })
            res.should.deep.equal({ statusCode: 200, body: "" })
            history.should.deep.equal([["http://tmp", "", { session }]])
        })
        it("throw error if the code represents error", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ statusCode: 404, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ statusCode: 404, body: "" })
                },
            }
            const c = new ClientWithValidation(mockClient)

            const session = new Session()
            try {
                await c.postForm("http://tmp", "", { session })
            } catch (e) {
                e.should.deep.equal({ statusCode: 404, body: "" })
                history.should.deep.equal([["http://tmp", "", { session }]])
                return
            }
            should.exist(null) // fail
        })
    })
})

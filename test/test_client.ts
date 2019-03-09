import * as chai from "chai"
const should = chai.should()
import * as fs from "fs"
import * as path from "path"
import * as tmp from "tmp"

import { promisify } from "util"
import { CachedClient, ClientWithValidation, FilesystemCachedClient, IOptions } from "../src/client"
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

describe("FilesystemCachedClient", () => {
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
            const tmpdir = tmp.dirSync()
            const c = new FilesystemCachedClient(mockClient, tmpdir.name)

            const session = new Session()
            const res = await c.get("http://tmp", { session })
            res.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", { session }]])

            const res2 = await c.get("http://tmp", { session })
            res2.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", { session }]])

            for (const file of await promisify(fs.readdir)(tmpdir.name)) {
                await promisify(fs.unlink)(path.join(tmpdir.name, file))
            }
            tmpdir.removeCallback()
        })
        it("does not cache the response if body is not string", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ code: 200, body: Buffer.from("xxx") })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const tmpdir = tmp.dirSync()
            const c = new FilesystemCachedClient(mockClient, tmpdir.name)

            const session = new Session()
            const res = await c.get("http://tmp", { session })
            res.should.deep.equal({ code: 200, body: Buffer.from("xxx") })
            history.should.deep.equal([["http://tmp", { session }]])

            const res2 = await c.get("http://tmp", { session })
            res2.should.deep.equal({ code: 200, body: Buffer.from("xxx") })
            history.should.deep.equal([["http://tmp", { session }], ["http://tmp", { session }]])

            tmpdir.removeCallback()
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
            const tmpdir = tmp.dirSync()
            const c = new FilesystemCachedClient(mockClient, tmpdir.name)

            const session = new Session()
            const res = await c.postForm("http://tmp", "", { session })
            res.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", "", { session }]])

            const res2 = await c.postForm("http://tmp", "", { session })
            res2.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", "", { session }], ["http://tmp", "", { session }]])

            tmpdir.removeCallback()
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
                    return Promise.resolve({ code: 200, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const c = new ClientWithValidation(mockClient)

            const session = new Session()
            const res = await c.get("http://tmp", { session })
            res.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", { session }]])
        })
        it("throw error if the code represents error", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ code: 404, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 404, body: "" })
                },
            }
            const c = new ClientWithValidation(mockClient)

            const session = new Session()
            try {
                await c.get("http://tmp", { session })
            } catch (e) {
                e.should.deep.equal({ code: 404, body: "" })
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
                    return Promise.resolve({ code: 200, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 200, body: "" })
                },
            }
            const c = new ClientWithValidation(mockClient)

            const session = new Session()
            const res = await c.postForm("http://tmp", "", { session })
            res.should.deep.equal({ code: 200, body: "" })
            history.should.deep.equal([["http://tmp", "", { session }]])
        })
        it("throw error if the code represents error", async () => {
            const history: any[] = []
            const mockClient = {
                get(url: string, options: IOptions) {
                    history.push([url, options])
                    return Promise.resolve({ code: 404, body: "" })
                },
                postForm(url: string, data: any, options: IOptions) {
                    history.push([url, data, options])
                    return Promise.resolve({ code: 404, body: "" })
                },
            }
            const c = new ClientWithValidation(mockClient)

            const session = new Session()
            try {
                await c.postForm("http://tmp", "", { session })
            } catch (e) {
                e.should.deep.equal({ code: 404, body: "" })
                history.should.deep.equal([["http://tmp", "", { session }]])
                return
            }
            should.exist(null) // fail
        })
    })
})

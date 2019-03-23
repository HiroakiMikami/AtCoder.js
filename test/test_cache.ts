import * as chai from "chai"
const should = chai.should()
import * as fs from "fs"
import * as path from "path"
import * as tmp from "tmp"

import { promisify } from "util"
import { FilesystemCache, MemoryCache } from "../src/cache"

describe("MemoryCache", () => {
    describe("#put", () => {
        it("caches the value", async () => {
            const c = new MemoryCache<string, number>()

            should.not.exist(await c.get("key"))
            const v = await c.put("key", 0)
            v.should.equal(0)
            const w = await c.get("key")
            w.should.equal(0)

            const v2 = await c.put("key", 1)
            v2.should.equal(1)
            const w2 = await c.get("key")
            w2.should.equal(1)
        })
        it("remove the existing entries if the number of elements exceeds the threshold", async () => {
            const c = new MemoryCache<string, number>(1)

            await c.put("key1", 0)
            await c.put("key2", 0)
            const v = await c.get("key2")
            v.should.equal(0)
            should.not.exist(await c.get("key1"))
        })
    })
    describe("#clear", () => {
        it("clear all entries", async () => {
            const c = new MemoryCache<string, number>()

            c.put("key1", 0)
            c.put("key2", 0)
            await c.clear()
            should.not.exist(await c.get("key1"))
            should.not.exist(await c.get("key2"))
        })
    })
})

describe("FilesystemCache", () => {
    describe("#put", () => {
        it("caches the value", async () => {
            const tmpdir = tmp.dirSync()
            const c = new FilesystemCache<number>(tmpdir.name)

            const v = await c.put("key", 0)
            v.should.equal(0)
            const w = await c.get("key")
            w.should.equal(0)

            for (const file of await promisify(fs.readdir)(tmpdir.name)) {
                await promisify(fs.unlink)(path.join(tmpdir.name, file))
            }
            tmpdir.removeCallback()
        })
    })
    describe("#clear", () => {
        it("clear all entries", async () => {
            const tmpdir = tmp.dirSync()
            const c = new FilesystemCache<number>(tmpdir.name)

            await c.put("key1", 0)
            await c.put("key2", 0)
            await c.clear()
            should.not.exist(await c.get("key1"))
            should.not.exist(await c.get("key2"))

            for (const file of await promisify(fs.readdir)(tmpdir.name)) {
                await promisify(fs.unlink)(path.join(tmpdir.name, file))
            }
            tmpdir.removeCallback()
        })
    })
})

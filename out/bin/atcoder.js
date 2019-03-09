#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const os = require("os");
const path = require("path");
const fs = require("fs");
const util_1 = require("util");
const session_1 = require("../src/session");
const atcoder_1 = require("../src/atcoder");
function dump(format, data) {
    if (format === "json") {
        console.log(JSON.stringify(data));
    }
    else if (format === "table") {
        console.table(data);
    }
    else {
        console.log(data);
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        /* Get session file */
        const sessionFile = process.env.ATCODER_JS_SESSION_FILE ||
            path.join(os.homedir(), ".atcoderjs", "session.json");
        const sessionFileExsits = yield util_1.promisify(fs.exists)(sessionFile);
        let session = new session_1.Session();
        if (sessionFileExsits) {
            const json = yield util_1.promisify(fs.readFile)(sessionFile);
            session = new session_1.Session(JSON.parse(json.toString()));
        }
        const atcoder = new atcoder_1.AtCoder(session);
        try {
            program
                .version("0.0.1")
                .option("-f, --format <format>", "The output format", "text");
            program
                .command("login <username> <password>")
                .action((username, password) => __awaiter(this, void 0, void 0, function* () {
                yield atcoder.login(username, password);
            }));
            program
                .command("contests <command(list|info)> [contest_id]")
                .action((command, id) => __awaiter(this, void 0, void 0, function* () {
                if (command === "list") {
                    const contests = yield atcoder.contests();
                    dump(program.format, contests);
                }
                else if (command === "info") {
                    if (!id) {
                        throw new Error(`The id should be specified`);
                    }
                    const contest = atcoder.contest(id);
                    const name = yield contest.name();
                    const tasks = yield contest.tasks();
                    dump(program.format, { name, tasks });
                }
                else {
                    throw new Error(`Invalid command: ${command}`);
                }
            }));
            program
                .command("task <command(list|info)> <contest_id> [task_id]")
                .action((command, contestId, taskId) => __awaiter(this, void 0, void 0, function* () {
                if (command === "list") {
                    const tasks = yield atcoder.contest(contestId).tasks();
                    dump(program.format, tasks);
                }
                else if (command === "info") {
                    if (!taskId) {
                        throw new Error(`The id should be specified`);
                    }
                    const task = atcoder.contest(contestId).task(taskId);
                    const info = yield task.info();
                    dump(program.format, { info });
                }
                else {
                    throw new Error(`Invalid command: ${command}`);
                }
            }));
            program
                .command("submission [command]")
                .action(console.log);
            program.parse(process.argv);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            if (!fs.existsSync(path.parse(sessionFile).dir)) {
                fs.mkdirSync(path.parse(sessionFile).dir);
            }
            fs.writeFileSync(sessionFile, JSON.stringify(session.toJSON()));
        }
    });
}
main();
//# sourceMappingURL=atcoder.js.map
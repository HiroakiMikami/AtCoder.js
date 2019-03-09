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
const cheerio = require("cheerio");
const submission_1 = require("./submission");
const task_1 = require("./task");
const utils_1 = require("./utils");
class Contest {
    constructor(id, params) {
        this.id = id;
        this.params = params;
        this.tasksPage = null;
    }
    name() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequestToTasks();
            return tasks(`a.contest-title`).text();
        });
    }
    tasks() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequestToTasks();
            const list = tasks(`table tbody tr`);
            return list.map((_, elem) => {
                const children = tasks(elem).children();
                const id = tasks(children[0]).find("a").attr("href").split("/").slice(-1)[0];
                const name = `${tasks(children[0]).text()} - ${tasks(children[1]).text()}`;
                const timeLimit = utils_1.toNumberWithUnits(tasks(children[2]).text());
                const memoryLimit = utils_1.toNumberWithUnits(tasks(children[3]).text());
                return { id, name, timeLimit, memoryLimit };
            }).get();
        });
    }
    task(id) {
        return new task_1.Task(this.id, id, this.params);
    }
    submission(id) {
        return new submission_1.Submission(this.id, id, this.params);
    }
    submissions(query) {
        return __awaiter(this, void 0, void 0, function* () {
            query = query || {};
            const response = yield this.params.client.get(`${this.params.url.atcoder}/contests/${this.id}/submissions?` +
                `f.Task=${query.task || ""}&` +
                `f.Language=${query.language || ""}&` +
                `f.Status=${query.status || ""}&` +
                `f.User=${query.user || ""}&` +
                `page=${query.page || 1}&` +
                `lang=en`, { session: this.params.session });
            const submissions = cheerio.load(response.body);
            return this.parseSubmissions(submissions);
        });
    }
    mySubmissions(query) {
        return __awaiter(this, void 0, void 0, function* () {
            query = query || {};
            const response = yield this.params.client.get(`${this.params.url.atcoder}/contests/${this.id}/submissions/me?` +
                `f.Task=${query.task || ""}&` +
                `f.Language=${query.language || ""}&` +
                `f.Status=${query.status || ""}&` +
                `f.User=${query.user || ""}&` +
                `page=${query.page || 1}&` +
                `lang=en`, { session: this.params.session });
            const submissions = cheerio.load(response.body);
            return this.parseSubmissions(submissions);
        });
    }
    parseSubmissions(submissions) {
        const ss = submissions("table tbody tr").map((_, elem) => {
            const children = submissions(elem).children().get();
            if (children.length === 10) {
                return {
                    codeSize: utils_1.toNumberWithUnits(submissions(children[5]).text()),
                    execTime: utils_1.toNumberWithUnits(submissions(children[7]).text()),
                    id: submissions(children[9]).find("a").attr("href").split("/").slice(-1)[0],
                    language: submissions(children[3]).text(),
                    memory: utils_1.toNumberWithUnits(submissions(children[8]).text()),
                    status: submission_1.toStatus(submissions(children[6]).text()),
                    submissionTime: new Date(submissions(children[0]).text()),
                    task: submissions(children[1]).find("a").attr("href").split("/").slice(-1)[0],
                    user: submissions(children[2]).text(),
                };
            }
            else {
                return {
                    codeSize: utils_1.toNumberWithUnits(submissions(children[5]).text()),
                    id: submissions(children[7]).find("a").attr("href").split("/").slice(-1)[0],
                    language: submissions(children[3]).text(),
                    status: submission_1.toStatus(submissions(children[6]).text()),
                    submissionTime: new Date(submissions(children[0]).text()),
                    task: submissions(children[1]).find("a").attr("href").split("/").slice(-1)[0],
                    user: submissions(children[2]).text(),
                };
            }
        }).get();
        const pages = submissions(submissions(".pagination").get()[0]).children();
        const lastPage = pages.slice(-1)[0];
        const numberOfPages = Number(submissions(lastPage).find("a").text());
        return { numberOfPages, submissions: ss };
    }
    sendRequestToTasks() {
        if (this.tasksPage === null) {
            this.tasksPage = this.params.client.get(`${this.params.url.atcoder}/contests/${this.id}/tasks?lang=en`, { session: this.params.session })
                .then((response) => cheerio.load(response.body));
        }
        return this.tasksPage;
    }
}
exports.Contest = Contest;
//# sourceMappingURL=contest.js.map
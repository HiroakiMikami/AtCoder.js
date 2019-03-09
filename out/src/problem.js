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
class Problem {
    constructor(contestId, id, session, client, atcoderUrl) {
        this.contestId = contestId;
        this.id = id;
        this.session = session;
        this.client = client;
        this.atcoderUrl = atcoderUrl;
        this.tasksPage = null;
    }
    name() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            return tasks(`span.h2`).text();
        });
    }
    score() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            const score = tasks("div#task-statement span.lang-en>p var").first().text();
            return Number(score);
        });
    }
    problemStatement() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            return this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.part", "Problem Statement"));
        });
    }
    constraints() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            return this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.part", "Constraints"));
        });
    }
    format() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            const input = this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.io-style>div.part", "Input"));
            const output = this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.io-style>div.part", "Output"));
            return { input, output };
        });
    }
    examples() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            const samples = [];
            let n = 1;
            while (true) {
                const input = this.findSection(tasks, "div#task-statement span.lang-en>div.part", `Sample Input ${n}`);
                const output = this.findSection(tasks, "div#task-statement span.lang-en>div.part", `Sample Output ${n}`);
                const sample = {
                    input: this.toHtml(tasks, input, "section>pre:nth-child(2)"),
                    notes: this.toHtml(tasks, input, "section>:nth-child(n+3)") +
                        this.toHtml(tasks, output, "section>:nth-child(n+3)"),
                    output: this.toHtml(tasks, output, "section>pre:nth-child(2)"),
                };
                if (sample.input === "" && sample.output === "") {
                    break;
                }
                n += 1;
                samples.push(sample);
            }
            return samples;
        });
    }
    findSection(root, selector, title) {
        return root(selector).filter((_, elem) => {
            return title === root(elem).children().find("section>h3").text();
        });
    }
    toHtml(root, dom, selector = "section>:not(h3)") {
        return dom.map((_, elem) => {
            return root.html(root(elem).children().find(selector));
        }).get().join("\n");
    }
    sendRequest() {
        if (this.tasksPage === null) {
            this.tasksPage = this.client.get(`${this.atcoderUrl}/contests/${this.contestId}/tasks/${this.id}?lang=en`, { session: this.session })
                .then((response) => cheerio.load(response.body));
        }
        return this.tasksPage;
    }
}
exports.Problem = Problem;
//# sourceMappingURL=problem.js.map
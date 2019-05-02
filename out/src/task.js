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
const atcoder_1 = require("./atcoder");
const utils_1 = require("./utils");
class Task {
    constructor(contestId, id, params) {
        this.contestId = contestId;
        this.id = id;
        this.params = params;
        this.tasksPage = null;
        this.languages = params.languages;
    }
    static TITLES() {
        return {
            constraints: [
                [atcoder_1.Language.English, "Constraints"], [atcoder_1.Language.Japanese, "制約"],
            ],
            input: [
                [atcoder_1.Language.English, "Input"], [atcoder_1.Language.Japanese, "入力"],
            ],
            output: [
                [atcoder_1.Language.English, "Output"], [atcoder_1.Language.Japanese, "出力"],
            ],
            problemStatement: [
                [atcoder_1.Language.English, "Problem Statement"], [atcoder_1.Language.Japanese, "問題文"],
            ],
            sampleInput: [
                [atcoder_1.Language.English, "Sample Input"], [atcoder_1.Language.Japanese, "入力例"],
            ],
            sampleOutput: [
                [atcoder_1.Language.English, "Sample Output"], [atcoder_1.Language.Japanese, "出力例"],
            ],
        };
    }
    info() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            const name = tasks(`span.h2`).text();
            const limits = tasks("div.col-sm-12>p").text();
            return {
                id: this.id,
                memoryLimit: utils_1.toNumberWithUnits(limits.split(" / ")[1].split(": ")[1]),
                name,
                timeLimit: utils_1.toNumberWithUnits(limits.split(" / ")[0].split(": ")[1]),
            };
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
            const titles = Task.TITLES().problemStatement
                .filter((xs) => this.languages.has(xs[0]))
                .map((xs) => RegExp(`^${xs[1]}$`));
            return this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.part", titles));
        });
    }
    constraints() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            const titles = Task.TITLES().constraints
                .filter((xs) => this.languages.has(xs[0]))
                .map((xs) => RegExp(`^${xs[1]}$`));
            return this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.part", titles));
        });
    }
    format() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            const inputTitles = Task.TITLES().input
                .filter((xs) => this.languages.has(xs[0]))
                .map((xs) => RegExp(`^${xs[1]}$`));
            const input = this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.io-style>div.part", inputTitles));
            const outputTitles = Task.TITLES().output
                .filter((xs) => this.languages.has(xs[0]))
                .map((xs) => RegExp(`^${xs[1]}$`));
            const output = this.toHtml(tasks, this.findSection(tasks, "div#task-statement span.lang-en>div.io-style>div.part", outputTitles));
            return { input, output };
        });
    }
    examples() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.sendRequest();
            const samples = [];
            let n = 1;
            while (true) {
                const inputTitles = Task.TITLES().sampleInput
                    .filter((xs) => this.languages.has(xs[0]))
                    .map((xs) => RegExp(`${xs[1]} ${n}`));
                const input = this.findSection(tasks, "div#task-statement span.lang-en>div.part", inputTitles);
                const outputTitles = Task.TITLES().sampleOutput
                    .filter((xs) => this.languages.has(xs[0]))
                    .map((xs) => RegExp(`${xs[1]} ${n}`));
                const output = this.findSection(tasks, "div#task-statement span.lang-en>div.part", outputTitles);
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
            const x = root(elem).children().find("section>h3").text();
            return title.some((t) => t.test(x));
        });
    }
    toHtml(root, dom, selector = "section>:not(h3)") {
        return dom.map((_, elem) => {
            return root.html(root(elem).children().find(selector));
        }).get().join("\n");
    }
    sendRequest() {
        if (this.tasksPage === null) {
            this.tasksPage = this.params.client.get(`${this.params.url.atcoder}/contests/${this.contestId}/tasks/${this.id}?lang=en`, { session: this.params.session })
                .then((response) => cheerio.load(response.body));
        }
        return this.tasksPage;
    }
}
exports.Task = Task;
//# sourceMappingURL=task.js.map
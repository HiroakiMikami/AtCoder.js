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
const utils_1 = require("./utils");
var Status;
(function (Status) {
    Status["WJ"] = "WJ";
    Status["AC"] = "AC";
    Status["WA"] = "WA";
    Status["IE"] = "IE";
    Status["OLE"] = "OLE";
    Status["RE"] = "RE";
    Status["TLE"] = "TLE";
    Status["MLE"] = "MLE";
    Status["CE"] = "CE";
})(Status = exports.Status || (exports.Status = {}));
function toStatus(value) {
    for (const key in Status) {
        if (Status.hasOwnProperty(key) && Status[key] === value) {
            return Status[key];
        }
    }
    return undefined;
}
exports.toStatus = toStatus;
class Submission {
    constructor(contestId, id, params) {
        this.contestId = contestId;
        this.id = id;
        this.params = params;
        this.submissionPage = null;
    }
    sourceCode() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.sendRequest();
            return page("#submission-code").text();
        });
    }
    info() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.sendRequest();
            const infoTable = page("table").get()[0];
            const data = page(infoTable).find("table tr td:nth-child(2)").get();
            if (data.length === 9) {
                return {
                    codeSize: utils_1.toNumberWithUnits(page(data[5]).text()),
                    execTime: utils_1.toNumberWithUnits(page(data[7]).text()),
                    id: this.id,
                    language: page(data[3]).text(),
                    memory: utils_1.toNumberWithUnits(page(data[8]).text()),
                    status: (toStatus(page(data[6]).text())),
                    submissionTime: new Date(page(data[0]).text()),
                    task: page(data[1]).find("a").attr("href").split("/").slice(-1)[0],
                    user: page(data[2]).text(),
                };
            }
            else {
                return {
                    codeSize: utils_1.toNumberWithUnits(page(data[5]).text()),
                    id: this.id,
                    language: page(data[3]).text(),
                    status: (toStatus(page(data[6]).text())),
                    submissionTime: new Date(page(data[0]).text()),
                    task: page(data[1]).find("a").attr("href").split("/").slice(-1)[0],
                    user: page(data[2]).text(),
                };
            }
        });
    }
    testCaseSets() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.sendRequest();
            const infoTable = page("table").get()[1];
            if (page(infoTable).children().length === 0) {
                return null;
            }
            return page(infoTable).find("table tr").map((_, elem) => {
                const children = page(elem).children();
                const name = page(children[0]).text();
                const score = Number(page(children[1]).text().split("/")[0]);
                const maxScore = Number(page(children[1]).text().split("/")[1]);
                const testCases = page(children[2]).text().split(",").map((x) => x.replace(" ", ""));
                return { name, score, maxScore, testCases };
            }).get();
        });
    }
    results() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.sendRequest();
            const infoTable = page("table").get()[2];
            if (page(infoTable).children().length === 0) {
                return null;
            }
            return page(infoTable).find("table tr").map((_, elem) => {
                const children = page(elem).children();
                const name = page(children[0]).text();
                const status = toStatus(page(children[1]).text());
                const execTime = utils_1.toNumberWithUnits(page(children[2]).text());
                const memory = utils_1.toNumberWithUnits(page(children[3]).text());
                return { name, status, execTime, memory };
            }).get();
        });
    }
    compileError() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.sendRequest();
            const elems = page("div.col-sm-12:not(#contst-nav-tabs)").children();
            let retval = null;
            elems.each((index, elem) => {
                if (page(elem).text() === "Compile Error") {
                    retval = page(elems[index + 1]).text();
                }
            });
            return retval;
        });
    }
    sendRequest() {
        if (this.submissionPage === null) {
            this.submissionPage = this.params.client.get(`${this.params.url.atcoder}/contests/${this.contestId}/submissions/${this.id}?lang=en`, { session: this.params.session }).then((response) => cheerio.load(response.body));
        }
        return this.submissionPage;
    }
}
exports.Submission = Submission;
//# sourceMappingURL=submission.js.map
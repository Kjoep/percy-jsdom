"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("./environment");
var fs_1 = require("fs");
var _a = require('@percy/agent/dist/utils/sdk-utils'), agentJsFilename = _a.agentJsFilename, isAgentRunning = _a.isAgentRunning, postSnapshot = _a.postSnapshot;
/**
 * A function to take a Percy snapshot from a Puppeteer test or script. To use in your tests:
 *   const { percySnapshot } = require('@percy/puppeteer')
 *
 *   const browser = await puppeteer.launch()
 *   const jsdom = await browser.newPage()
 *   await jsdom.goto(<your.test.url>)
 *   await percySnapshot(jsdom, <your snapshot name>, <maybe options>)
 *
 * @param jsdom Puppeteer Page object that we are snapshotting. Required.
 * @param name Name of the snapshot that we're taking. Required.
 * @param options Additional options, e.g. '{widths: [768, 992, 1200]}'. Optional.
 */
function percySnapshot(jsdom, name, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var document, _i, _a, stylesheet, domSnapshot;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!name) {
                        throw new Error("'name' must be provided. In Mocha, this.test.fullTitle() is a good default.");
                    }
                    return [4 /*yield*/, sleep(100)];
                case 1:
                    _b.sent();
                    document = jsdom.window.document;
                    try {
                        addScript(document, fs_1.readFileSync(agentJsFilename()).toString());
                    }
                    catch (err) {
                        console.error("[percy] Could not take snapshot named '" + name + "'.", err);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, isAgentRunning()];
                case 2:
                    if (!(_b.sent())) {
                        throw new Error('Percy agent is not running');
                    }
                    /* Percy checks the ownerNode for stylesheets to make sure they are no already inline in the DOM.
                     * JSDom does not support the ownerNode property for stylesheets.  This basically deactivates that check - the
                     * downside is style could appear twice in the snapshot.
                     */
                    for (_i = 0, _a = Array.from(document.styleSheets); _i < _a.length; _i++) {
                        stylesheet = _a[_i];
                        // @ts-ignore
                        stylesheet.ownerNode = document.createElement('style');
                    }
                    addScript(document, "\n        try {\n            console.info('Ready to snap');\n            var name = " + JSON.stringify(name) + ";\n            var options = " + JSON.stringify(options) + ";\n            console.info('Making client');\n            var percyAgentClient = new PercyAgent({ handleAgentCommunication: false })\n            console.info('Making snapshot');\n            debugger;\n            window._percySnapshot = percyAgentClient.snapshot(name, options)\n            console.info('Snapshot made');\n        } catch (error) {\n            console.error('Failed to make snapshot', error);\n        }\n    ");
                    return [4 /*yield*/, waitFor(function () { return jsdom.window._percySnapshot; }, 'percy snapshot')];
                case 3:
                    domSnapshot = _b.sent();
                    if (!domSnapshot)
                        throw new Error('Snapshot failed');
                    return [4 /*yield*/, postDomSnapshot(name, domSnapshot, jsdom.window.location.toString(), options)];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.percySnapshot = percySnapshot;
function postDomSnapshot(name, domSnapshot, url, options) {
    return __awaiter(this, void 0, void 0, function () {
        var postSuccess;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, postSnapshot(__assign({ name: name,
                        url: url,
                        domSnapshot: domSnapshot, clientInfo: environment_1.clientInfo() }, options))];
                case 1:
                    postSuccess = _a.sent();
                    if (!postSuccess) {
                        throw new Error("[percy] Error posting snapshot to agent.");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function addScript(document, script) {
    var newScript = document.createElement("script");
    var inlineScript = document.createTextNode(script);
    newScript.appendChild(inlineScript);
    document.body.appendChild(newScript);
}
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
function waitFor(condition, description) {
    return __awaiter(this, void 0, void 0, function () {
        var deadline, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deadline = new Date().getTime() + 30 * 60;
                    _a.label = 1;
                case 1:
                    if (!(new Date().getTime() < deadline)) return [3 /*break*/, 3];
                    result = condition();
                    if (result)
                        return [2 /*return*/, result];
                    return [4 /*yield*/, sleep(100)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: throw new Error("Could not resolve " + description + " in time");
            }
        });
    });
}

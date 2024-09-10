"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEpub = void 0;
var jszip_1 = __importDefault(require("jszip"));
var xmldom_1 = require("xmldom");
var handleEpub = function (buffer) { return __awaiter(void 0, void 0, void 0, function () {
    var zip, contentOpf, parser, doc, items, coverImageId, coverImageHref, htmlPages, resources, styles, tocIndex, index, item, content, text, cssContent;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, jszip_1.default.loadAsync(buffer)];
            case 1:
                zip = _e.sent();
                return [4 /*yield*/, ((_a = zip.file("content.opf")) === null || _a === void 0 ? void 0 : _a.async("text"))];
            case 2:
                contentOpf = _e.sent();
                if (!contentOpf)
                    throw new Error("content.opf not found");
                parser = new xmldom_1.DOMParser();
                doc = parser.parseFromString(contentOpf, "application/xml");
                items = Array.from(doc.getElementsByTagName("item")).map(function (item) { return ({
                    id: item.getAttribute("id") || "",
                    href: item.getAttribute("href") || "",
                    mediaType: item.getAttribute("media-type") || "",
                }); });
                coverImageId = (_b = Array.from(doc.getElementsByTagName("meta")).find(function (meta) { return meta.getAttribute("name") === "cover"; })) === null || _b === void 0 ? void 0 : _b.getAttribute("content");
                coverImageHref = coverImageId ? (_c = items.find(function (item) { return item.id === coverImageId; })) === null || _c === void 0 ? void 0 : _c.href : undefined;
                htmlPages = [];
                resources = new Map();
                styles = [];
                tocIndex = -1;
                index = 0;
                _e.label = 3;
            case 3:
                if (!(index < items.length)) return [3 /*break*/, 6];
                item = items[index];
                return [4 /*yield*/, ((_d = zip.file(item.href)) === null || _d === void 0 ? void 0 : _d.async("arraybuffer"))];
            case 4:
                content = _e.sent();
                if (!content)
                    return [3 /*break*/, 5];
                if (item.mediaType === "application/xhtml+xml") {
                    text = new TextDecoder().decode(content);
                    htmlPages.push(text);
                    if (item.id.toLowerCase().includes("toc") || item.href.toLowerCase().includes("toc")) {
                        tocIndex = htmlPages.length - 1;
                    }
                }
                else if (item.mediaType.startsWith("image/")) {
                    resources.set(item.href, content);
                }
                else if (item.mediaType === "text/css") {
                    cssContent = new TextDecoder().decode(content);
                    styles.push(cssContent);
                }
                _e.label = 5;
            case 5:
                index++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/, { htmlPages: htmlPages, resources: resources, coverImage: coverImageHref, styles: styles, tocIndex: tocIndex }];
        }
    });
}); };
exports.handleEpub = handleEpub;

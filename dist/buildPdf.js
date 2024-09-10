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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPdf = void 0;
var jspdf_1 = require("jspdf");
var fetchFile_1 = require("./fetchFile");
var handleEpub_1 = require("./handleEpub");
var htmlToText_1 = require("./htmlToText");
var buildPdf = function (epubUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, buffer, mimeType, _b, htmlPages, resources, coverImage, styles, tocIndex, pdf, pageWidth, pageHeight, margin, lineHeightMultiplier, defaultFontSize, imgData, dataUrl, i, parser, doc, images, paragraphs, y, j, img, src, imgData, dataUrl, imgProps, imgWidth, imgHeight, k, paragraph, nodes, _i, nodes_1, node, fontSize, isBold, isItalic, text, lines, lineHeight, _c, lines_1, line, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 10, , 11]);
                return [4 /*yield*/, (0, fetchFile_1.fetchFile)(epubUrl)];
            case 1:
                _a = _d.sent(), buffer = _a.buffer, mimeType = _a.mimeType;
                if (mimeType !== "application/epub+zip") {
                    throw new Error("Unsupported file type");
                }
                return [4 /*yield*/, (0, handleEpub_1.handleEpub)(buffer)];
            case 2:
                _b = _d.sent(), htmlPages = _b.htmlPages, resources = _b.resources, coverImage = _b.coverImage, styles = _b.styles, tocIndex = _b.tocIndex;
                pdf = new jspdf_1.jsPDF({
                    orientation: "portrait",
                    unit: "pt",
                    format: "a4",
                });
                pageWidth = pdf.internal.pageSize.getWidth();
                pageHeight = pdf.internal.pageSize.getHeight();
                margin = 40;
                lineHeightMultiplier = 1.6;
                defaultFontSize = 14;
                if (coverImage && resources.has(coverImage)) {
                    imgData = resources.get(coverImage);
                    dataUrl = "data:image/".concat(coverImage.split('.').pop(), ";base64,").concat(btoa(String.fromCharCode.apply(String, new Uint8Array(imgData))));
                    pdf.addImage(dataUrl, 'JPEG', margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
                    pdf.addPage();
                }
                i = 0;
                _d.label = 3;
            case 3:
                if (!(i < htmlPages.length)) return [3 /*break*/, 9];
                if (i > 0 || (i === 0 && coverImage))
                    pdf.addPage();
                parser = new DOMParser();
                doc = parser.parseFromString(htmlPages[i], "text/html");
                images = doc.getElementsByTagName('img');
                paragraphs = doc.getElementsByTagName('p');
                y = margin;
                j = 0;
                _d.label = 4;
            case 4:
                if (!(j < images.length)) return [3 /*break*/, 7];
                img = images[j];
                src = img.getAttribute('src');
                if (!src)
                    return [3 /*break*/, 6];
                if (!resources.has(src)) return [3 /*break*/, 6];
                imgData = resources.get(src);
                dataUrl = "data:image/".concat(src.split('.').pop(), ";base64,").concat(btoa(String.fromCharCode.apply(String, new Uint8Array(imgData))));
                return [4 /*yield*/, pdf.getImageProperties(dataUrl)];
            case 5:
                imgProps = _d.sent();
                imgWidth = pageWidth - 2 * margin;
                imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                if (y + imgHeight > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }
                pdf.addImage(dataUrl, 'JPEG', margin, y, imgWidth, imgHeight);
                y += imgHeight + 10;
                _d.label = 6;
            case 6:
                j++;
                return [3 /*break*/, 4];
            case 7:
                for (k = 0; k < paragraphs.length; k++) {
                    paragraph = paragraphs[k];
                    nodes = Array.from(paragraph.childNodes);
                    for (_i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                        node = nodes_1[_i];
                        fontSize = defaultFontSize;
                        isBold = false;
                        isItalic = false;
                        if (node.nodeName === 'B' || node.nodeName === 'STRONG') {
                            isBold = true;
                        }
                        else if (node.nodeName === 'I' || node.nodeName === 'EM') {
                            isItalic = true;
                        }
                        else if (/H[1-6]/.test(node.nodeName)) {
                            fontSize = defaultFontSize + 4 * (7 - parseInt(node.nodeName[1]));
                            isBold = true;
                        }
                        pdf.setFont("helvetica", isBold ? "bold" : isItalic ? "italic" : "normal");
                        pdf.setFontSize(fontSize);
                        text = (0, htmlToText_1.htmlToText)(node.textContent || "").replace(/:\s*\n/g, ': ');
                        text = text.replace(/\s+/g, ' ').trim();
                        lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
                        lineHeight = lineHeightMultiplier * fontSize;
                        for (_c = 0, lines_1 = lines; _c < lines_1.length; _c++) {
                            line = lines_1[_c];
                            if (y + lineHeight > pageHeight - margin) {
                                pdf.addPage();
                                y = margin;
                            }
                            pdf.text(line, margin, y);
                            y += lineHeight;
                        }
                    }
                    y += 10;
                }
                _d.label = 8;
            case 8:
                i++;
                return [3 /*break*/, 3];
            case 9:
                pdf.save("downloaded_epub.pdf");
                return [3 /*break*/, 11];
            case 10:
                error_1 = _d.sent();
                console.error("Error building PDF:", error_1.message);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.buildPdf = buildPdf;

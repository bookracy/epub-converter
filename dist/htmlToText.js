"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlToText = void 0;
var html_to_text_1 = require("html-to-text");
var htmlToText = function (html) {
    var text = (0, html_to_text_1.convert)(html, {
        wordwrap: 130,
        preserveNewlines: true,
        selectors: [
            { selector: 'img', format: 'skip' },
            { selector: 'a', options: { ignoreHref: true } },
            { selector: 'b', format: 'inline' },
            { selector: 'strong', format: 'inline' },
            { selector: 'i', format: 'inline' },
            { selector: 'em', format: 'inline' },
            { selector: 'h1', format: 'block' },
            { selector: 'h2', format: 'block' },
            { selector: 'h3', format: 'block' },
            { selector: 'h4', format: 'block' },
            { selector: 'h5', format: 'block' },
            { selector: 'h6', format: 'block' },
            { selector: 'ul', format: 'block' },
            { selector: 'ol', format: 'block' },
            { selector: 'li', format: 'block' },
            { selector: 'blockquote', format: 'block' },
            { selector: 'pre', format: 'block' },
            { selector: 'code', format: 'inline' },
        ]
    });
    text = text.replace(/(\w+)(\s*[\.\?\!\:\;]\s*\n)/g, "$1$2");
    return text;
};
exports.htmlToText = htmlToText;

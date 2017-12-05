"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("./message");
const shortid_1 = require("shortid");
function fetchData() {
    const maxLength = message_1.MESSAGES.length;
    const responseData = Array(1000).fill(0).map(() => ({ id: shortid_1.generate(), content: message_1.MESSAGES[Math.round(Math.random() * message_1.MESSAGES.length)] }));
    return Promise.resolve(responseData);
}
exports.fetchData = fetchData;

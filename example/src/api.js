"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("./message");
const shortid_1 = require("shortid");
const faker = require("faker");
function fetchLocalMessage() {
    return Array(1000).fill(0).map(() => ({ id: shortid_1.generate(), content: message_1.MESSAGES[Math.round(Math.random() * 200)] }));
}
exports.fetchLocalMessage = fetchLocalMessage;
function fetchData() {
    const maxLength = message_1.MESSAGES.length;
    const responseData = Array(100000).fill(0).map(() => ({ id: shortid_1.generate(), content: genTextOrImgage() }));
    return Promise.resolve(responseData);
}
exports.fetchData = fetchData;
function fetchDataSync() {
    const responseData = Array(1000).fill(0).map(() => ({ id: shortid_1.generate(), content: genTextOrImgage() }));
    return responseData;
}
exports.fetchDataSync = fetchDataSync;
function genTextOrImgage() {
    return faker.lorem.paragraph();
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Projector {
    constructor(divDom, items) {
        this.divDom = divDom;
        this.items = items;
        this.anchorItem = { index: 0, offset: 0 };
    }
    up() {
    }
    down() {
    }
    subscribe(callback) {
        this._callback = callback;
    }
}
exports.Projector = Projector;

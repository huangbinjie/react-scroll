"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Projector {
    constructor(divDom, items, averageHeight) {
        this.divDom = divDom;
        this.items = items;
        this.averageHeight = averageHeight;
        this.startIndex = 0;
        this.endIndex = 0;
        this.anchorItem = { index: 0, offset: 0 };
        this.cachedItemRect = [];
        this.guestimatedItemCountPerPage = Math.ceil(this.divDom.clientHeight / averageHeight);
        this.endIndex = this.startIndex + this.guestimatedItemCountPerPage * 2 - 1;
    }
    next(items) {
        if (items)
            this.items = items;
        const projectedItems = items.slice(this.startIndex, this.endIndex + 1);
        const uponContentPlaceholderHeight = this.cachedItemRect[this.startIndex].top - this.divDom.offsetTop;
        this._callback(projectedItems, uponContentPlaceholderHeight);
    }
    up() {
        const delta = this.divDom.scrollTop - this.anchorItem.offset;
        const anchorItemRect = this.cachedItemRect[this.anchorItem.index];
        if (delta > anchorItemRect.height) {
            const currentAnchorItemTop = anchorItemRect.top + delta;
            const itemIndex = this.cachedItemRect.findIndex(item => item.bottom > currentAnchorItemTop);
            this.endIndex += itemIndex - this.anchorItem.index;
            this.anchorItem.index = itemIndex;
            this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0;
            this.anchorItem.offset = this.cachedItemRect[itemIndex].top - this.divDom.offsetTop;
            this.next();
        }
    }
    down() {
        const delta = this.divDom.scrollTop - this.anchorItem.offset;
        const beforeAnchorRect = this.cachedItemRect[this.anchorItem.index - 1];
        if (!beforeAnchorRect)
            return;
        if (delta * -1 > beforeAnchorRect.height) {
            const currentAnchorItemBottom = beforeAnchorRect.bottom + delta;
            const itemIndex = this.cachedItemRect.findIndex(item => item.top > currentAnchorItemBottom);
            this.endIndex += itemIndex - this.anchorItem.index;
            this.anchorItem.index = itemIndex;
            this.anchorItem.offset = this.cachedItemRect[itemIndex].top - this.divDom.offsetTop;
            this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0;
            this.next();
        }
    }
    subscribe(callback) {
        this._callback = callback;
    }
}
exports.Projector = Projector;

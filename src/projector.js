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
        this.displayCount = this.guestimatedItemCountPerPage;
        this.endIndex = this.startIndex + this.displayCount - 1;
    }
    next(items) {
        if (items)
            this.items = items;
        const projectedItems = this.items.slice(this.startIndex, this.endIndex + 1);
        const startItem = this.cachedItemRect[this.startIndex];
        let uponContentPlaceholderHeight = 0;
        if (startItem) {
            uponContentPlaceholderHeight = startItem.top;
        }
        else if (this.startIndex > 0) {
            uponContentPlaceholderHeight = this.anchorItem.offset - 3 * this.averageHeight;
        }
        else {
            uponContentPlaceholderHeight = 0;
        }
        const cachedItemRectLength = this.cachedItemRect.length;
        const unCachedItemCount = this.items.length - cachedItemRectLength;
        const lastCachedItemRect = this.cachedItemRect[cachedItemRectLength - 1];
        const lastCachedItemRectBottom = lastCachedItemRect ? lastCachedItemRect.bottom : 0;
        const lastItemRect = this.endIndex >= cachedItemRectLength ? this.cachedItemRect[cachedItemRectLength - 1] : this.cachedItemRect[this.endIndex];
        const lastItemRectBottom = lastItemRect ? lastItemRect.bottom : 0;
        const underContentPlaceholderHeight = lastCachedItemRectBottom - lastItemRectBottom + unCachedItemCount * this.averageHeight;
        this._callback(projectedItems, uponContentPlaceholderHeight, underContentPlaceholderHeight);
    }
    up() {
        const delta = this.divDom.scrollTop - this.anchorItem.offset;
        const anchorItemRect = this.cachedItemRect[this.anchorItem.index];
        if (delta > anchorItemRect.height) {
            const currentAnchorItemTop = anchorItemRect.top + delta;
            const itemIndex = this.cachedItemRect.findIndex(item => item ? item.bottom > currentAnchorItemTop : false);
            if (itemIndex === -1) {
                const cachedItemLength = this.cachedItemRect.length;
                const unCachedDelta = currentAnchorItemTop - this.cachedItemRect[cachedItemLength - 1].bottom;
                const guestimatedUnCachedCount = Math.ceil(unCachedDelta / this.averageHeight);
                this.anchorItem.index = this.endIndex + guestimatedUnCachedCount;
                this.startIndex = this.anchorItem.index - 3;
                this.endIndex = this.startIndex + this.displayCount - 1;
                this.anchorItem.offset = this.cachedItemRect[cachedItemLength - 1].bottom + guestimatedUnCachedCount * this.averageHeight;
            }
            else {
                this.endIndex += itemIndex - this.anchorItem.index;
                this.anchorItem.index = itemIndex;
                this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0;
                this.anchorItem.offset = this.cachedItemRect[itemIndex].top;
            }
            this.next();
        }
    }
    down() {
        const delta = (this.divDom.scrollTop - this.anchorItem.offset) * -1;
        const beforeAnchorRect = this.cachedItemRect[this.anchorItem.index - 1];
        if (!beforeAnchorRect)
            return;
        if (delta > beforeAnchorRect.height) {
            const currentAnchorItemBottom = beforeAnchorRect.bottom - delta;
            const itemIndex = this.cachedItemRect.findIndex(item => item ? item.top > currentAnchorItemBottom : false);
            if (itemIndex === this.anchorItem.index - 3) {
                const guestimatedOutOfProjectorDelta = delta - this.cachedItemRect[this.anchorItem.index - 1].height - this.cachedItemRect[this.anchorItem.index - 2].height - this.cachedItemRect[this.anchorItem.index - 3].height;
                const guestimatedOutOfProjectorCount = Math.floor(guestimatedOutOfProjectorDelta / this.averageHeight);
                const guestimatedStartIndex = itemIndex - guestimatedOutOfProjectorCount - 3;
                this.startIndex = guestimatedStartIndex < 0 ? 0 : guestimatedStartIndex;
                this.endIndex = this.startIndex + this.displayCount - 1;
                this.anchorItem.index = this.startIndex + 3;
                this.anchorItem.offset = currentAnchorItemBottom;
            }
            else {
                this.endIndex += itemIndex - this.anchorItem.index;
                this.anchorItem.index = itemIndex;
                this.anchorItem.offset = this.cachedItemRect[itemIndex].top;
                this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0;
            }
            this.next();
        }
    }
    subscribe(callback) {
        this._callback = callback;
    }
}
exports.Projector = Projector;

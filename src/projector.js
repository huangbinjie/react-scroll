"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Projector {
    constructor(scroller, items, averageHeight, cachedItemRect = []) {
        this.scroller = scroller;
        this.items = items;
        this.averageHeight = averageHeight;
        this.cachedItemRect = cachedItemRect;
        this.startIndex = 0;
        this.endIndex = 0;
        this.anchorItem = { index: 0, offset: 0 };
        this.up = () => {
            const scrollTop = this.scrollerDom.scrollTop;
            const anchorItemRect = this.cachedItemRect[this.anchorItem.index];
            if (scrollTop > anchorItemRect.bottom) {
                const itemIndex = this.cachedItemRect.findIndex(item => item ? item.bottom > scrollTop : false);
                if (itemIndex === -1) {
                    const cachedItemLength = this.cachedItemRect.length;
                    const unCachedDelta = scrollTop - this.cachedItemRect[cachedItemLength - 1].bottom;
                    const guestimatedUnCachedCount = Math.ceil(unCachedDelta / this.averageHeight);
                    this.startIndex = this.endIndex + guestimatedUnCachedCount - 3;
                    this.endIndex = this.startIndex + this.displayCount - 1;
                    this.cachedItemRect.length = 0;
                }
                else {
                    this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0;
                    this.endIndex = this.startIndex + this.displayCount - 1;
                    this.anchorItem.index = itemIndex;
                    this.anchorItem.offset = this.cachedItemRect[itemIndex].top;
                }
                this.next();
            }
        };
        this.down = () => {
            const scrollTop = this.scrollerDom.scrollTop;
            if (this.anchorItem.index > 3 && scrollTop < this.anchorItem.offset) {
                const startItem = this.cachedItemRect[this.startIndex];
                const itemIndex = this.cachedItemRect.findIndex(item => item ? item.top > scrollTop : false) - 1;
                if (!this.cachedItemRect[itemIndex - 3]) {
                    const delta = this.anchorItem.offset - this.scrollerDom.scrollTop;
                    const guestimatedOutOfProjectorCount = Math.ceil(delta / this.averageHeight);
                    const guestimatedStartIndex = this.startIndex - guestimatedOutOfProjectorCount;
                    this.startIndex = guestimatedStartIndex < 0 ? 0 : guestimatedStartIndex;
                    this.endIndex = this.startIndex + this.displayCount - 1;
                    this.cachedItemRect.length = 0;
                }
                else {
                    this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0;
                    this.endIndex = this.startIndex + this.displayCount - 1;
                    this.anchorItem.index = itemIndex;
                    this.anchorItem.offset = this.cachedItemRect[itemIndex].top;
                }
                this.next();
            }
        };
        this.scrollerDom = scroller.divDom;
        this.guestimatedItemCountPerPage = Math.ceil(this.scrollerDom.clientHeight / averageHeight);
        this.displayCount = this.guestimatedItemCountPerPage + 3;
        this.endIndex = this.startIndex + this.displayCount - 1;
    }
    next(items) {
        if (items)
            this.items = items;
        const projectedItems = this.items.slice(this.startIndex, this.endIndex + 1);
        const startItem = this.cachedItemRect[this.startIndex];
        let upperPlaceholderHeight = 0;
        let needAdjustment = false;
        if (startItem) {
            upperPlaceholderHeight = startItem.top;
        }
        else {
            upperPlaceholderHeight = this.scroller.state.upperPlaceholderHeight;
            needAdjustment = true;
        }
        const cachedItemRectLength = this.cachedItemRect.length;
        const endIndex = cachedItemRectLength === 0 ? this.endIndex : cachedItemRectLength;
        const bottomCountDelta = this.items.length - endIndex;
        const unCachedItemCount = bottomCountDelta < 0 ? 0 : bottomCountDelta;
        const lastCachedItemRect = this.cachedItemRect[cachedItemRectLength - 1];
        const lastCachedItemRectBottom = lastCachedItemRect ? lastCachedItemRect.bottom : 0;
        const lastItemRect = this.endIndex >= cachedItemRectLength ? this.cachedItemRect[cachedItemRectLength - 1] : this.cachedItemRect[this.endIndex];
        const lastItemRectBottom = lastItemRect ? lastItemRect.bottom : 0;
        const underPlaceholderHeight = lastCachedItemRectBottom - lastItemRectBottom + unCachedItemCount * this.averageHeight;
        this.callback(projectedItems, upperPlaceholderHeight, underPlaceholderHeight, needAdjustment);
    }
    subscribe(callback) {
        this.callback = callback;
    }
}
exports.Projector = Projector;

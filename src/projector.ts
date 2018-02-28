/**
 *  Projector.
 *  used for calculate anchor and new items
 */
import { InfiniteScroller } from "./scroller"

export class Projector {
  public startIndex = 0
  public endIndex = 0
  public anchorItem = { index: 0, offset: 0 }

  private callback: Callback
  private guesstimatedItemCountPerPage: number
  private displayCount: number
  private scrollerDom: HTMLDivElement
  private upperHeight = 0

  constructor(
    public scroller: InfiniteScroller,
    public items: any[],
    public averageHeight: number,
    public cachedItemRect = [] as Cache[]
  ) {
    this.scrollerDom = scroller.divDom
    this.guesstimatedItemCountPerPage = Math.ceil(this.scrollerDom.clientHeight / averageHeight)
    this.displayCount = this.guesstimatedItemCountPerPage + 3
    this.endIndex = this.startIndex + this.displayCount - 1
  }

  public next(items?: any[]) {
    if (items) this.items = items

    const projectedItems = this.items.slice(this.startIndex, this.endIndex + 1)
    const startItem = this.cachedItemRect[this.startIndex]
    // there are two case should adjust: 1、resize。2、quickly slipping。
    const needAdjustment = startItem ? false : true
    const upperPlaceholderHeight = startItem ? startItem.top : this.upperHeight

    const cachedItemRectLength = this.cachedItemRect.length
    const endIndex = cachedItemRectLength === 0 ? this.endIndex : cachedItemRectLength
    const bottomCountDelta = this.items.length - endIndex
    const unCachedItemCount = bottomCountDelta < 0 ? 0 : bottomCountDelta
    const lastCachedItemRect = this.cachedItemRect[cachedItemRectLength - 1]
    const lastCachedItemRectBottom = lastCachedItemRect ? lastCachedItemRect.bottom : 0
    const lastItemRect = this.endIndex >= cachedItemRectLength ? this.cachedItemRect[cachedItemRectLength - 1] : this.cachedItemRect[this.endIndex]
    const lastItemRectBottom = lastItemRect ? lastItemRect.bottom : 0
    const underPlaceholderHeight = lastCachedItemRectBottom - lastItemRectBottom + unCachedItemCount * this.averageHeight

    this.callback(projectedItems, upperPlaceholderHeight, underPlaceholderHeight, needAdjustment)
  }

  /**
   * hands up, viewport down.
   */
  public up = () => {
    const scrollTop = this.scrollerDom.scrollTop
    const anchorItemRect = this.cachedItemRect[this.anchorItem.index]
    if (scrollTop > anchorItemRect.bottom) {
      const nextAnchorItem = this.cachedItemRect.find(item => item ? item.bottom > scrollTop : false)
      if (nextAnchorItem) {
        const nextAnchorIndex = nextAnchorItem.index
        this.startIndex = nextAnchorIndex > 2 ? nextAnchorIndex - 3 : 0
        this.endIndex = this.startIndex + this.displayCount - 1
        this.anchorItem.index = nextAnchorIndex
        this.anchorItem.offset = nextAnchorItem.top
      } else {
        const cachedItemLength = this.cachedItemRect.length
        const unCachedDelta = scrollTop - this.cachedItemRect[cachedItemLength - 1].bottom
        const guesstimatedUnCachedCount = Math.ceil(unCachedDelta / this.averageHeight)
        this.startIndex = this.endIndex + guesstimatedUnCachedCount - 3
        this.endIndex = this.startIndex + this.displayCount - 1
        this.cachedItemRect.length = 0
        this.upperHeight = scrollTop
      }
      this.next()
    }
  }

  /**
   * hands down, viewport up.
   */
  public down = () => {
    const scrollTop = this.scrollerDom.scrollTop
    if (scrollTop < this.anchorItem.offset) {
      const startItem = this.cachedItemRect[this.startIndex]
      const nextAnchorItem = this.cachedItemRect.find(item => item ? item.bottom >= scrollTop : false)
      const nextStartIndex = nextAnchorItem.index - 3
      if (this.cachedItemRect[nextStartIndex > 0 ? nextStartIndex : 0]) {
        this.startIndex = nextAnchorItem.index > 2 ? nextAnchorItem.index - 3 : 0
        this.endIndex = this.startIndex + this.displayCount - 1
        this.anchorItem.index = nextAnchorItem.index
        this.anchorItem.offset = nextAnchorItem.top
      } else {
        const guesstimatedAnchorIndex = Math.floor(Math.max(scrollTop, 0) / this.anchorItem.offset * this.anchorItem.index)
        this.startIndex = guesstimatedAnchorIndex > 2 ? guesstimatedAnchorIndex - 3 : guesstimatedAnchorIndex
        this.endIndex = this.startIndex + this.displayCount - 1
        this.cachedItemRect.length = 0
        this.upperHeight = this.scroller.state.upperPlaceholderHeight
      }
      this.next()
    }
  }

  public subscribe(callback: Callback) {
    this.callback = callback
  }
}

export type Callback = (projectedItems: any[], upperPlaceholderHeight: number, underPlaceholderHeight: number, needAdjustment: boolean) => void
export type Cache = { index: number, top: number, bottom: number, height: number }

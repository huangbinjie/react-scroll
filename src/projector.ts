/**
 *  Projector.
 *  used for calculate anchor and new items
 */
export class Projector {
  public startIndex = 0
  public endIndex = 0
  public anchorItem = { index: 0, offset: 0 }
  public upperHeight = 0
  public underHeight = 0

  private callback: Callback = () => { }
  private guesstimatedItemCountPerPage: number
  private displayCount: number

  constructor(
    private scrollerDom: HTMLDivElement,
    private bufferSize = 0,
    private items: any[],
    private averageHeight: number,
    public cachedItemRect = [] as Cache[]
  ) {
    this.guesstimatedItemCountPerPage = Math.ceil(this.scrollerDom.clientHeight / averageHeight)
    this.displayCount = this.guesstimatedItemCountPerPage + this.bufferSize
    this.endIndex = this.startIndex + this.displayCount - 1
  }

  public guesstRestBottomHeight() {
    const cachedItemRectLength = this.cachedItemRect.length
    const endIndex = cachedItemRectLength === 0 ? this.endIndex : cachedItemRectLength
    const bottomCountDelta = this.items.length - endIndex
    const unCachedItemCount = bottomCountDelta < 0 ? 0 : bottomCountDelta
    const lastCachedItemRect = this.cachedItemRect[cachedItemRectLength - 1]
    const lastCachedItemRectBottom = lastCachedItemRect ? lastCachedItemRect.bottom : 0
    const lastItemRect = this.endIndex >= cachedItemRectLength ? this.cachedItemRect[cachedItemRectLength - 1] : this.cachedItemRect[this.endIndex]
    const lastItemRectBottom = lastItemRect ? lastItemRect.bottom : 0
    const underPlaceholderHeight = lastCachedItemRectBottom - lastItemRectBottom + unCachedItemCount * this.averageHeight
    this.underHeight = underPlaceholderHeight
    return underPlaceholderHeight
  }

  public next(items?: any[]) {
    if (items) this.items = items

    const projectedItems = this.items.slice(this.startIndex, this.endIndex + 1)
    const startItem = this.cachedItemRect[this.startIndex]
    // there are two case should adjust: 1、resize。2、quickly slipping。
    const needAdjustment = this.items.length === 0 ? false : startItem ? false : true

    const underHeight = this.underHeight <= 0 ? this.guesstRestBottomHeight() : this.underHeight

    this.callback(projectedItems, this.upperHeight, underHeight, needAdjustment)
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
        const nextAnchorOffset = nextAnchorItem.top
        this.startIndex = nextAnchorIndex >= this.bufferSize ? nextAnchorIndex - this.bufferSize : 0
        this.endIndex = this.startIndex + this.displayCount - 1
        this.upperHeight = this.cachedItemRect[this.startIndex].top
        this.underHeight -= nextAnchorOffset - this.anchorItem.offset
        this.anchorItem.index = nextAnchorIndex
        this.anchorItem.offset = nextAnchorOffset
      } else {
        const cachedItemLength = this.cachedItemRect.length
        const unCachedDelta = scrollTop - this.cachedItemRect[cachedItemLength - 1].bottom
        const guesstimatedUnCachedCount = Math.ceil(unCachedDelta / this.averageHeight)
        this.startIndex = this.endIndex + guesstimatedUnCachedCount - this.bufferSize
        this.endIndex = this.startIndex + this.displayCount - 1
        this.cachedItemRect.length = 0
        this.upperHeight = scrollTop
        this.underHeight -= this.anchorItem.offset - scrollTop
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
      const nextAnchorItem = this.cachedItemRect.find(item => item ? item.bottom >= scrollTop : false)!
      const nextStartIndex = nextAnchorItem.index - this.bufferSize
      if (nextStartIndex < this.anchorItem.index && this.cachedItemRect[nextStartIndex >= 0 ? nextStartIndex : 0]) {
        this.startIndex = nextAnchorItem.index >= this.bufferSize ? nextAnchorItem.index - this.bufferSize : 0
        this.endIndex = this.startIndex + this.displayCount - 1
        this.anchorItem.index = nextAnchorItem.index
        this.anchorItem.offset = nextAnchorItem.top
        this.upperHeight = this.cachedItemRect[this.startIndex].top
        this.underHeight -= nextAnchorItem.top - this.anchorItem.offset
      } else {
        const guesstimatedAnchorIndex = Math.floor(Math.max(scrollTop, 0) / this.anchorItem.offset * this.anchorItem.index)
        this.startIndex = guesstimatedAnchorIndex >= this.bufferSize ? guesstimatedAnchorIndex - this.bufferSize : guesstimatedAnchorIndex
        this.endIndex = this.startIndex + this.displayCount - 1
        this.cachedItemRect.length = 0
        this.upperHeight = this.upperHeight
        this.underHeight -= this.anchorItem.offset - scrollTop
      }
      this.next()
    }
  }

  /**
 * if slide down(eg. slide 52 to 51, scrollThroughItemCount is positive), upperHeight equals to state.upperHeight.
 * if slide up(eg. slide 52 to 53, scrollThroughItemCount is negative), upperHeight equals to current scrollTop.
 * then upperHeight minus scrollThroughItemDistance, we can get the actural height which should be render.
 * @param cache cached anchor position
 * @param height upperHeight
 * 
 */
  public computeVirtualUpperHeight(): number {
    const scrollTop = this.scrollerDom.scrollTop
    const prevStartIndex = this.anchorItem.index >= this.bufferSize ? this.anchorItem.index - this.bufferSize! : 0
    const scrollThroughItemCount = prevStartIndex - this.startIndex
    const prevStartItem = this.cachedItemRect[prevStartIndex]
    const upperHeight = scrollThroughItemCount < 0 ? scrollTop : prevStartItem ? this.upperHeight : scrollTop
    const endIndex = prevStartItem ? prevStartIndex : this.startIndex + this.bufferSize
    const scrollThroughItem = this.cachedItemRect.slice(this.startIndex, endIndex)
    const scrollThroughItemDistance = scrollThroughItem.reduce((acc, item) => acc + item.height, 0)
    return upperHeight - scrollThroughItemDistance
  }

  public computeActualUpperHeight(virtualUpperHeight: number) {
    this.upperHeight = this.startIndex === 0 ? 0 : virtualUpperHeight < 0 ? 0 : virtualUpperHeight
    return this.upperHeight
  }

  public updatePlaceholderHeight(upperHeight: number, underHeight: number) {
    this.upperHeight = upperHeight
    this.underHeight = underHeight
  }

  public measure(itemIndex: number, delta: number) {
    this.cachedItemRect.length = 0
    let shouldUpdateScrollTop = false
    if (itemIndex < this.anchorItem.index) {
      if (this.upperHeight === 0) {
        shouldUpdateScrollTop = true
      } else {
        this.upperHeight -= delta
      }
    } else {
      this.underHeight = this.underHeight - delta
    }
    return {
      upperHeight: this.upperHeight,
      underHeight: this.underHeight,
      shouldUpdateScrollTop: shouldUpdateScrollTop
    }
  }

  public subscribe(callback: Callback) {
    this.callback = callback
  }
}

export type Callback = (projectedItems: any[], upperPlaceholderHeight: number, underPlaceholderHeight: number, needAdjustment: boolean) => void
export type Cache = { index: number, top: number, bottom: number, height: number }

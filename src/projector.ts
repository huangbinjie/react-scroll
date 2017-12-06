export class Projector {
  private _callback: Callback
  private guestimatedItemCountPerPage: number

  public startIndex = 0
  public endIndex = 0
  public anchorItem = { index: 0, offset: 0 }
  public cachedItemRect: { top: number, bottom: number, height: number, text: string }[] = []
  constructor(
    public divDom: HTMLDivElement,
    public items: any[],
    public averageHeight: number
  ) {
    this.guestimatedItemCountPerPage = Math.ceil(this.divDom.clientHeight / averageHeight)
    this.endIndex = this.startIndex + this.guestimatedItemCountPerPage * 2 - 1
  }

  public next(items?: any[]) {
    if (items) this.items = items

    // slice 的第二个参数表示长度，而不是坐标，所以要 + 1
    const projectedItems = items.slice(this.startIndex, this.endIndex + 1)

    // 滑动到顶部超过3个，计算顶部高度, TODO 算法优化
    const uponContentPlaceholderHeight = this.cachedItemRect[this.startIndex].top - this.divDom.offsetTop

    this._callback(projectedItems, uponContentPlaceholderHeight)
  }

  /**
   * 手往上滑， 屏幕往下滑
   */
  public up() {
    const delta = this.divDom.scrollTop - this.anchorItem.offset
    const anchorItemRect = this.cachedItemRect[this.anchorItem.index]
    if (delta > anchorItemRect.height) {
      const currentAnchorItemTop = anchorItemRect.top + delta
      const itemIndex = this.cachedItemRect.findIndex(item => item.bottom > currentAnchorItemTop)
      this.endIndex += itemIndex - this.anchorItem.index
      this.anchorItem.index = itemIndex
      this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0
      this.anchorItem.offset = this.cachedItemRect[itemIndex].top - this.divDom.offsetTop
      this.next()
    }
  }

  /**
   * 手往下滑， 屏幕往上滑
   */
  public down() {
    const delta = this.divDom.scrollTop - this.anchorItem.offset
    const beforeAnchorRect = this.cachedItemRect[this.anchorItem.index - 1]
    if (!beforeAnchorRect) return
    if (delta * -1 > beforeAnchorRect.height) {
      const currentAnchorItemBottom = beforeAnchorRect.bottom + delta
      const itemIndex = this.cachedItemRect.findIndex(item => item.top > currentAnchorItemBottom)
      // itemIndex - this.anchorItem.index 等于滑过了多少个 item， 所以end 也要及时更新
      this.endIndex += itemIndex - this.anchorItem.index
      this.anchorItem.index = itemIndex
      this.anchorItem.offset = this.cachedItemRect[itemIndex].top - this.divDom.offsetTop
      this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0
      this.next()
    }
  }

  public subscribe(callback: Callback) {
    this._callback = callback
  }
}

export type Callback = (projectedItems: any[], uponContentPlaceholderHeight: number) => void
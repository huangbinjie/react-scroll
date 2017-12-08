export class Projector {
  private _callback: Callback
  private guestimatedItemCountPerPage: number
  private displayCount: number
  // 开始坐标
  public startIndex = 0
  // 结束坐标，endIndex 可以超过 items 最大长度
  public endIndex = 0
  // 描点，index 等于 index 或者 startIndex + 3。offset 等于描点到容器顶部的scrollTop
  public anchorItem = { index: 0, offset: 0 }
  public cachedItemRect: { top: number, bottom: number, height: number, text: string }[] = []
  constructor(
    public divDom: HTMLDivElement,
    public items: any[],
    public averageHeight: number
  ) {
    this.guestimatedItemCountPerPage = Math.ceil(this.divDom.clientHeight / averageHeight)
    this.displayCount = this.guestimatedItemCountPerPage
    this.endIndex = this.startIndex + this.displayCount - 1
  }

  public next(items?: any[]) {
    if (items) this.items = items

    // slice 的第二个参数表示长度，而不是坐标，所以要 + 1
    const projectedItems = this.items.slice(this.startIndex, this.endIndex + 1)

    const startItem = this.cachedItemRect[this.startIndex]

    let uponContentPlaceholderHeight = 0
    if (startItem) {
      // 正常
      uponContentPlaceholderHeight = startItem.top
    } else if (this.startIndex > 0) {
      // 滑动幅度太大， startItem 不存在， startIndex 又大于 0
      uponContentPlaceholderHeight = this.anchorItem.offset - 3 * this.averageHeight
    } else {
      // items从空到填满，这个时候是初始化，所以是0
      uponContentPlaceholderHeight = 0
    }

    const cachedItemRectLength = this.cachedItemRect.length
    const unCachedItemCount = this.items.length - cachedItemRectLength
    const lastCachedItemRect = this.cachedItemRect[cachedItemRectLength - 1]
    const lastCachedItemRectBottom = lastCachedItemRect ? lastCachedItemRect.bottom : 0
    const lastItemRect = this.endIndex >= cachedItemRectLength ? this.cachedItemRect[cachedItemRectLength - 1] : this.cachedItemRect[this.endIndex]
    const lastItemRectBottom = lastItemRect ? lastItemRect.bottom : 0
    const underContentPlaceholderHeight = lastCachedItemRectBottom - lastItemRectBottom + unCachedItemCount * this.averageHeight

    this._callback(projectedItems, uponContentPlaceholderHeight, underContentPlaceholderHeight)
  }

  /**
   * 手往上滑， 屏幕往下滑
   */
  public up() {
    const delta = this.divDom.scrollTop - this.anchorItem.offset
    const anchorItemRect = this.cachedItemRect[this.anchorItem.index]
    //滑动范围超过一个元素的高度之后再处理
    if (delta > anchorItemRect.height) {
      const currentAnchorItemTop = anchorItemRect.top + delta
      const itemIndex = this.cachedItemRect.findIndex(item => item ? item.bottom > currentAnchorItemTop : false)
      if (itemIndex === -1) {
        // 滑的太快,读不出坐标,猜一个 itemIndex
        const cachedItemLength = this.cachedItemRect.length
        const unCachedDelta = currentAnchorItemTop - this.cachedItemRect[cachedItemLength - 1].bottom
        // 缓存最后一个到当前anchor位置之间的item数量，暂时是猜测
        const guestimatedUnCachedCount = Math.ceil(unCachedDelta / this.averageHeight)
        this.anchorItem.index = this.endIndex + guestimatedUnCachedCount
        this.startIndex = this.anchorItem.index - 3
        this.endIndex = this.startIndex + this.displayCount - 1
        // 已缓存的高度加上猜测的高度
        this.anchorItem.offset = this.cachedItemRect[cachedItemLength - 1].bottom + guestimatedUnCachedCount * this.averageHeight
      } else {
        // 正常滑动速度
        this.endIndex += itemIndex - this.anchorItem.index
        this.anchorItem.index = itemIndex
        this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0
        this.anchorItem.offset = this.cachedItemRect[itemIndex].top
      }
      this.next()
    }
  }

  /**
   * 手往下滑， 屏幕往上滑
   */
  public down() {
    const delta = (this.divDom.scrollTop - this.anchorItem.offset) * -1
    const beforeAnchorRect = this.cachedItemRect[this.anchorItem.index - 1]
    if (!beforeAnchorRect) return
    if (delta > beforeAnchorRect.height) {
      const currentAnchorItemBottom = beforeAnchorRect.bottom - delta
      const itemIndex = this.cachedItemRect.findIndex(item => item ? item.top > currentAnchorItemBottom : false)
      if (itemIndex === this.anchorItem.index - 3) {
        //假设 [1,2,3,undefined,4] 从4往上滑，如果是3和4之间，那么会拿到4的下标，4的小标恰好是 this.anchorItem.index - 3，
        //其他情况会拿到1-3的下标
        const guestimatedOutOfProjectorDelta = delta - this.cachedItemRect[this.anchorItem.index - 1].height - this.cachedItemRect[this.anchorItem.index - 2].height - this.cachedItemRect[this.anchorItem.index - 3].height
        const guestimatedOutOfProjectorCount = Math.floor(guestimatedOutOfProjectorDelta / this.averageHeight)
        const guestimatedStartIndex = itemIndex - guestimatedOutOfProjectorCount - 3
        this.startIndex = guestimatedStartIndex < 0 ? 0 : guestimatedStartIndex
        this.endIndex = this.startIndex + this.displayCount - 1
        this.anchorItem.index = this.startIndex + 3
        this.anchorItem.offset = currentAnchorItemBottom
      } else {
        // itemIndex - this.anchorItem.index 等于滑过了多少个 item， 所以end 也要及时更新
        this.endIndex += itemIndex - this.anchorItem.index
        this.anchorItem.index = itemIndex
        this.anchorItem.offset = this.cachedItemRect[itemIndex].top
        this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0
      }
      this.next()
    }
  }

  public subscribe(callback: Callback) {
    this._callback = callback
  }
}

export type Callback = (projectedItems: any[], uponContentPlaceholderHeight: number, underContentPlaceholderHeight: number) => void
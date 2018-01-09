import { InfiniteScroll } from "./scroller"

export class Projector {
  // 开始坐标
  public startIndex = 0
  // 结束坐标，endIndex 可以超过 items 最大长度
  public endIndex = 0
  // 描点，index 等于 index 或者 startIndex + 3。offset 等于描点顶部到容器顶部的scrollTop
  public anchorItem = { index: 0, offset: 0 }

  private callback: Callback
  private guestimatedItemCountPerPage: number
  private displayCount: number
  private scrollerDom: HTMLDivElement

  constructor(
    public scroller: InfiniteScroll,
    public items: any[],
    public averageHeight: number,
    public cachedItemRect = [] as Cache[]
  ) {
    this.scrollerDom = scroller.divDom
    this.guestimatedItemCountPerPage = Math.ceil(this.scrollerDom.clientHeight / averageHeight)
    this.displayCount = this.guestimatedItemCountPerPage + 3
    this.endIndex = this.startIndex + this.displayCount - 1
  }

  public next(items?: any[]) {
    if (items) this.items = items
    // slice 的第二个参数不包括在内，为了要算进去，所以要 + 1
    const projectedItems = this.items.slice(this.startIndex, this.endIndex + 1)

    const startItem = this.cachedItemRect[this.startIndex]

    let upperPlaceholderHeight = 0
    let needAdjustment = false
    if (startItem) {
      // 正常
      upperPlaceholderHeight = startItem.top
    } else {
      // 如果起点不存在，则判断是猜测得来的。目前会导致这种情况的场景只有 resize，因为resize会清空缓存
      upperPlaceholderHeight = this.scroller.state.upperPlaceholderHeight
      needAdjustment = true
    }

    const cachedItemRectLength = this.cachedItemRect.length
    // 快速往上滑会清空缓存，没有缓存就有endindex
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
   * 手往上滑， 屏幕往下滑
   */
  public up = () => {
    const scrollTop = this.scrollerDom.scrollTop
    const anchorItemRect = this.cachedItemRect[this.anchorItem.index]
    // 滑动范围超过一个元素的高度之后再处理
    if (scrollTop > anchorItemRect.bottom) {
      const itemIndex = this.cachedItemRect.findIndex(item => item ? item.bottom > scrollTop : false)
      if (itemIndex === -1) {
        // 滑的太快,读不出坐标,猜一个 itemIndex
        const cachedItemLength = this.cachedItemRect.length
        const unCachedDelta = scrollTop - this.cachedItemRect[cachedItemLength - 1].bottom
        // 缓存最后一个到当前anchor位置之间的item数量，暂时是猜测
        const guestimatedUnCachedCount = Math.ceil(unCachedDelta / this.averageHeight)
        // this.anchorItem.index = this.endIndex + guestimatedUnCachedCount
        this.startIndex = this.endIndex + guestimatedUnCachedCount - 3
        this.endIndex = this.startIndex + this.displayCount - 1
        this.cachedItemRect.length = 0
      } else {
        // 正常滑动速度
        this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0
        this.endIndex = this.startIndex + this.displayCount - 1
        this.anchorItem.index = itemIndex
        this.anchorItem.offset = this.cachedItemRect[itemIndex].top
      }
      this.next()
    }
  }

  /**
   * 手往下滑， 屏幕往上滑
   */
  public down = () => {
    const scrollTop = this.scrollerDom.scrollTop
    if (this.anchorItem.index > 3 && scrollTop < this.anchorItem.offset) {
      const startItem = this.cachedItemRect[this.startIndex]
      // const prevItem = this.cachedItemRect[this.startIndex - 1]
      const itemIndex = this.cachedItemRect.findIndex(item => item ? item.top > scrollTop : false) - 1
      if (!this.cachedItemRect[itemIndex - 3]) {
        const delta = this.anchorItem.offset - this.scrollerDom.scrollTop
        // 往上快速滑动，假设 [1,2,3,undefined,4] 从4往上滑，如果是3和4之间，那么会拿到4的下标，4的下标恰好是 this.anchorItem.index - 3，
        // 其他情况会拿到1-3的下标
        const guestimatedOutOfProjectorCount = Math.ceil(delta / this.averageHeight)
        const guestimatedStartIndex = this.startIndex - guestimatedOutOfProjectorCount
        this.startIndex = guestimatedStartIndex < 0 ? 0 : guestimatedStartIndex
        this.endIndex = this.startIndex + this.displayCount - 1
        this.cachedItemRect.length = 0
      } else {
        this.startIndex = itemIndex > 2 ? itemIndex - 3 : 0
        this.endIndex = this.startIndex + this.displayCount - 1
        this.anchorItem.index = itemIndex
        this.anchorItem.offset = this.cachedItemRect[itemIndex].top
      }
      this.next()
    }
  }

  public subscribe(callback: Callback) {
    this.callback = callback
  }
}

export type Callback = (projectedItems: any[], upperPlaceholderHeight: number, underPlaceholderHeight: number, needAdjustment: boolean) => void
export type Cache = { index: number, top: number, bottom: number, height: number, needAdjustment?: boolean }

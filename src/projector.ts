import { InfiniteScroller } from "./scroller"

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
    public scroller: InfiniteScroller,
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
      // 如果起点不存在，则判断是猜测得来的。目前会导致这种情况的场景有 resize 和 快速滑动。他们都会清理缓存。
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
      const nextAnchorItem = this.cachedItemRect.find(item => item ? item.bottom > scrollTop : false)
      if (nextAnchorItem) {
        // 正常滑动速度
        const nextAnchorIndex = nextAnchorItem.index
        this.startIndex = nextAnchorIndex > 2 ? nextAnchorIndex - 3 : 0
        this.endIndex = this.startIndex + this.displayCount - 1
        this.anchorItem.index = nextAnchorIndex
        this.anchorItem.offset = nextAnchorItem.top
      } else {
        // 滑的太快,读不出坐标,猜一个 itemIndex
        const cachedItemLength = this.cachedItemRect.length
        const unCachedDelta = scrollTop - this.cachedItemRect[cachedItemLength - 1].bottom
        // 缓存最后一个到当前anchor位置之间的item数量，暂时是猜测
        const guestimatedUnCachedCount = Math.ceil(unCachedDelta / this.averageHeight)
        this.startIndex = this.endIndex + guestimatedUnCachedCount - 3
        this.endIndex = this.startIndex + this.displayCount - 1
        this.cachedItemRect.length = 0
      }
      this.next()
    }
  }

  /**
   * 手往下滑， 屏幕往上滑
   */
  public down = () => {
    const scrollTop = this.scrollerDom.scrollTop
    if (scrollTop < this.anchorItem.offset) {
      const startItem = this.cachedItemRect[this.startIndex]
      const nextAnchorItem = this.cachedItemRect.find(item => item ? item.bottom > scrollTop : false)
      const nextStartIndex = nextAnchorItem.index - 3
      // 判断起点在不在，在的话是正常滑动，不在是猜测
      if (this.cachedItemRect[nextStartIndex > 0 ? nextStartIndex : 0]) {
        this.startIndex = nextAnchorItem.index > 2 ? nextAnchorItem.index - 3 : 0
        this.endIndex = this.startIndex + this.displayCount - 1
        this.anchorItem.index = nextAnchorItem.index
        this.anchorItem.offset = nextAnchorItem.top
      } else {
        const delta = this.anchorItem.offset - this.scrollerDom.scrollTop
        const guestimatedOutOfProjectorCount = Math.ceil(delta / this.averageHeight)
        const guestimatedStartIndex = this.startIndex - guestimatedOutOfProjectorCount
        this.startIndex = guestimatedStartIndex < 0 ? 0 : guestimatedStartIndex
        this.endIndex = this.startIndex + this.displayCount - 1
        this.cachedItemRect.length = 0
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

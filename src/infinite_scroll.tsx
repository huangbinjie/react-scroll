import * as React from 'react'
import { Projector } from "./projector"

export type Props<T= {}> = {
  averageHeight: number
  className?: string
  items?: T[]
  onRenderCell?: (item?: T, index?: number) => React.ReactNode
}

export type State = {
  sample: any[]
  uponContentPlaceholderHeight: number
  underContentPlaceholderHeight: number
}

export default class InifiteScroll extends React.Component<Props, State> {

  public state: State = { sample: [], underContentPlaceholderHeight: 0, uponContentPlaceholderHeight: 0 }
  private divDom: HTMLDivElement
  private underContentDivDom: HTMLDivElement
  private topAnchorIndex = 0
  private bottomAnchorIndex = 0
  private shouldUpdate = true
  private guestimatedItemCountPerPage = 10
  private cachedItemRect: { top: number, bottom: number, height: number, text: string }[] = []

  private scrollTop = 0
  private anchorScrollTop = 0

  constructor(props: Props) {
    super(props)
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.project(nextProps.items, nextProps.averageHeight)
  }

  public componentDidUpdate() {
    // 因为要获取下一个元素的bottom，只能等渲染之后才能拿到
    const cachedItemRectLength = this.cachedItemRect.length
    const unCachedItemCount = this.props.items.length - cachedItemRectLength
    const underContentPlaceholderHeight = cachedItemRectLength > 0 ? this.cachedItemRect[cachedItemRectLength - 1].bottom - this.cachedItemRect[this.bottomAnchorIndex].bottom + unCachedItemCount * this.props.averageHeight : 0
    this.underContentDivDom.style.height = underContentPlaceholderHeight + "px"
  }

  /**
   * 第一次加载空数组，为了拿到容器的dom：divDom
   * 预估显示数量
   * 根据预估数量计算出下描点位置
   */
  public componentDidMount() {
    this.guestimatedItemCountPerPage = Math.ceil(this.divDom.clientHeight / this.props.averageHeight)
    this.bottomAnchorIndex = this.topAnchorIndex + Math.round(this.guestimatedItemCountPerPage * 1.5) - 1
  }

  public render() {
    return (
      <div id="c" ref={div => this.divDom = div} style={{ overflow: "scroll", boxSizing: "border-box", height: "100%" }} onScroll={this.onScroll}>
        <div style={{ height: this.state.uponContentPlaceholderHeight }}></div>
        {this.state.sample.map((item, index) => React.createElement(this.createChild(item, (this.topAnchorIndex > 3 ? this.topAnchorIndex - 3 : 0) + index), { key: item.id }))}
        <div ref={div => this.underContentDivDom = div}></div>
      </div>
    )
  }

  public createChild = (item: any, index: number) => {
    const parent = this
    return class Child extends React.Component {
      componentDidMount() {
        if (!parent.cachedItemRect[index]) {
          const child = this.refs.child as HTMLDivElement
          const rect = child.getBoundingClientRect()
          const prevItem = parent.cachedItemRect[index - 1]
          const bottom = prevItem ? prevItem.bottom + rect.height : rect.bottom
          const top = prevItem ? prevItem.bottom : rect.top
          parent.cachedItemRect[index] = { top, bottom, height: rect.height, text: item.content }
        }
      }
      render() {
        return <div ref="child">
          {parent.props.onRenderCell(item, index)}
        </div>
      }
    }
  }

  public onScroll = () => {
    const anchorRect = this.cachedItemRect[this.topAnchorIndex]
    const beforeAnchorRect = this.cachedItemRect[this.topAnchorIndex - 1]
    const newScrollTop = this.divDom.scrollTop
    const offsetTop = this.divDom.offsetTop
    const delta = newScrollTop - this.anchorScrollTop

    if (newScrollTop < this.scrollTop) {
      if (!beforeAnchorRect) return
      // 往下滑
      if (delta * -1 > beforeAnchorRect.height) {
        const bottom = beforeAnchorRect.bottom + delta
        const itemIndex = this.cachedItemRect.findIndex(item => item.top > bottom)
        this.bottomAnchorIndex += itemIndex - this.topAnchorIndex
        this.topAnchorIndex = itemIndex
        this.anchorScrollTop = this.cachedItemRect[itemIndex].top - offsetTop
        this.project(this.props.items, this.props.averageHeight)

      }
    } else {
      //往上滑，并且偏移量大于元素高度，则认定可以切换 topAnchorIndex
      if (delta > anchorRect.height) {
        const bottom = anchorRect.top + delta
        const itemIndex = this.cachedItemRect.findIndex(item => item.bottom > bottom)
        this.bottomAnchorIndex += itemIndex - this.topAnchorIndex
        this.topAnchorIndex = itemIndex
        // console.log(this.topAnchorIndex, this.cachedItemRect, bottom, anchorRect, delta)
        this.anchorScrollTop = this.cachedItemRect[itemIndex].top - offsetTop
        this.project(this.props.items, this.props.averageHeight)
      }
    }
    this.scrollTop = newScrollTop
  }


  /**
   * 投影仪
   * 
   */
  public project = (items: any[], averageHeight: number) => {

    const isTopEnoughThree = this.topAnchorIndex > 2
    // const isBottomEnoughThree = this.bottomAnchorIndex + 3 < items.length
    const startIndex = isTopEnoughThree ? this.topAnchorIndex - 3 : 0
    // const endIndex = isBottomEnoughThree ? this.bottomAnchorIndex + 3 : this.bottomAnchorIndex
    const sample = items.slice(startIndex, this.bottomAnchorIndex + 1)

    // 滑动到顶部超过3个，计算顶部高度, TODO 算法优化
    const uponContentPlaceholderHeight = isTopEnoughThree ? this.cachedItemRect[this.topAnchorIndex - 3].top - this.divDom.offsetTop : 0

    this.setState({ sample, uponContentPlaceholderHeight })
  }
}

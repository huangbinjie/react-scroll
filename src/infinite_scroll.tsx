import * as React from 'react'
import { Projector } from "./projector"

export type Props<T= {}> = {
  averageHeight: number
  className?: string
  items?: T[]
  key?: string
  onRenderCell?: (item?: T, index?: number) => React.ReactNode
}

export type State = {
  projectedItems: any[]
  uponContentPlaceholderHeight: number
  underContentPlaceholderHeight: number
}

export default class InifiteScroll extends React.Component<Props, State> {

  public state: State = { projectedItems: [], underContentPlaceholderHeight: 0, uponContentPlaceholderHeight: 0 }
  private divDom: HTMLDivElement
  private underContentDivDom: HTMLDivElement

  private scrollTop = 0
  private projector: Projector

  public componentWillReceiveProps(nextProps: Props) {
    this.projector.next(nextProps.items)
  }

  /**
   * 第一次加载空数组，为了拿到容器的dom：divDom
   * 预估显示数量
   * 根据预估数量计算出下描点位置
   */
  public componentDidMount() {
    this.projector = new Projector(this.divDom, this.props.items, this.props.averageHeight)
    this.projector.subscribe((projectedItems, uponContentPlaceholderHeight, underContentPlaceholderHeight) => {
      this.setState({ projectedItems, uponContentPlaceholderHeight, underContentPlaceholderHeight })
    })
  }

  public render() {
    return (
      <div id="c" ref={div => this.divDom = div} style={{ overflow: "scroll", boxSizing: "border-box", height: "100%" }} onScroll={this.onScroll}>
        <div style={{ height: this.state.uponContentPlaceholderHeight }}></div>
        {this.state.projectedItems.map((item, index) => React.createElement(this.createChild(item, this.projector.startIndex + index), { key: this.props.key ? item[this.props.key] : index }))}
        {/* <div ref={div => this.underContentDivDom = div}></div> */}
        <div style={{ height: this.state.underContentPlaceholderHeight }}></div>
      </div>
    )
  }

  public createChild = (item: any, index: number) => {
    const parent = this
    return class Child extends React.Component {
      componentDidMount() {
        const cachedItemRect = parent.projector.cachedItemRect
        if (!cachedItemRect[index]) {
          const child = this.refs.child as HTMLDivElement
          const rect = child.getBoundingClientRect()
          const prevItem = cachedItemRect[index - 1]
          const bottom = prevItem ? prevItem.bottom + rect.height : rect.bottom
          const top = prevItem ? prevItem.bottom : rect.top
          cachedItemRect[index] = { top, bottom, height: rect.height, text: item.content }
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
    const newScrollTop = this.divDom.scrollTop

    if (newScrollTop < this.scrollTop) {
      //手往下滑,屏幕往上滑
      this.projector.down()
    } else {
      //往上滑,屏幕往下滑
      this.projector.up()
    }
    this.scrollTop = newScrollTop
  }
}

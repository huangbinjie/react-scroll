import * as React from "react"
import { Projector } from "./projector"

export type Props = {
  item: any
  itemIndex: number
  measure: () => void
  needAdjustment: boolean
  onRenderCell: (item: any, index: number, measure: () => void) => React.ReactNode
  upperPlaceholderHeight: number
  projector: Projector
}

export class Item extends React.Component<Props> {
  public dom: HTMLDivElement

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.needAdjustment) {
      this.setCache(nextProps, nextProps.itemIndex)
    }
  }

  public shouldComponentUpdate(nextProps: Props) {
    return this.props.itemIndex !== nextProps.itemIndex ? true : false
  }

  public componentDidMount() {
    this.setCache(this.props, this.props.itemIndex)
  }

  public render() {
    return <div ref={div => this.dom = div!}>
      {this.props.onRenderCell(this.props.item, this.props.itemIndex, this.props.measure)}
    </div>
  }

  public setCache = (props: Props, itemIndex: number) => {
    const { projector, upperPlaceholderHeight, needAdjustment } = props
    const cachedItemRect = projector.cachedItemRect
    const curItem = cachedItemRect[itemIndex]
    const prevItem = cachedItemRect[itemIndex - 1]

    const rect = this.dom.getBoundingClientRect()
    if (prevItem) {
      // if previous item exists, use prevItem.bottom as the upperHeight
      const bottom = prevItem.bottom + rect.height
      const top = prevItem.bottom
      cachedItemRect[itemIndex] = { index: itemIndex, top, bottom, height: rect.height }
    } else {
      // if previous item doesn't exist, it's the first item, so upperHeight equals upperPlaceholderHeight
      const bottom = upperPlaceholderHeight + rect.height
      const top = upperPlaceholderHeight
      cachedItemRect[itemIndex] = { index: itemIndex, top, bottom, height: rect.height }
    }
  }
}
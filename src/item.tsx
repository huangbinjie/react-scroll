import * as React from "react"
import { addListener, removeListener } from "resize-detector"
import { Projector, Cache } from "./projector"

export type Props = {
  item: any
  itemIndex: number
  measure: (itemIndex: number, delta: number) => void
  needAdjustment: boolean
  onRenderCell: (item: any, index: number, measure: () => void) => React.ReactNode
  projector: Projector
}

export class Item extends React.Component<Props> {
  public dom!: HTMLDivElement

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
    addListener(this.dom, this.measure)
  }

  public componentWillUnmount() {
    removeListener(this.dom, this.measure)
  }

  public render() {
    return <div ref={div => this.dom = div!}>
      {this.props.onRenderCell(this.props.item, this.props.itemIndex, this.measure)}
    </div>
  }

  public setCache = (props: Props, itemIndex: number) => {
    const { projector } = props
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
      const bottom = projector.upperHeight + rect.height
      const top = projector.underHeight
      cachedItemRect[itemIndex] = { index: itemIndex, top, bottom, height: rect.height }
    }
  }

  public measure = () => {
    const { itemIndex, projector } = this.props
    const cachedItemRect = projector.cachedItemRect[itemIndex]
    const curItemRect = this.dom.getBoundingClientRect()
    if (cachedItemRect && curItemRect.height !== cachedItemRect.height) {
      const anchorIndex = projector.anchorItem.index
      const delta = curItemRect.height - cachedItemRect.height
      // let upperHeight, underHeight
      // if (itemIndex <= anchorIndex) {
      //   upperHeight = bufferHeight.upperPlaceholderHeight - delta
      //   underHeight = bufferHeight.underPlaceholderHeight
      //   // if (upperHeight <= 0) {
      //   //   upperHeight *= -1
      //   // }
      // } else {
      //   upperHeight = bufferHeight.upperPlaceholderHeight
      //   underHeight = bufferHeight.underPlaceholderHeight - delta
      //   // if (underHeight <= 0) {
      //   //   underHeight *= -1
      //   // }
      // }
      // console.log(anchorIndex, itemIndex, delta, bufferHeight.upperPlaceholderHeight, upperHeight, bufferHeight.underPlaceholderHeight, underHeight)
      this.props.measure(itemIndex, delta)
    }
  }

}
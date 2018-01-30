/**
 * Scroller.
 * a component to render data base on the paramater(upperHeight, newItems, underHeight) that received from Projector.
 * scroller also has an adjustment strategy to adjust upperHeight.
 */
import * as React from "react"
import { Projector, Cache } from "./projector"
import { Item } from "./item"

export type Props<T= {}> = {
  cache?: Cache[],
  containerHeight: number
  itemAverageHeight: number
  className?: string
  items: T[]
  itemKey: string
  initialScrollTop?: number
  onRenderCell: (item?: T, index?: number) => React.ReactNode
  onScroll?: (dom: HTMLDivElement) => void
  onEnd?: () => void
}

export type State = {
  projectedItems: any[]
  upperPlaceholderHeight: number
  underPlaceholderHeight: number
}

export class InfiniteScroller extends React.Component<Props, State> {
  public static defaultProps = {
    initialScrollTop: 0,
    onScroll: () => { },
    onEnd: () => { }
  }
  public state: State = { projectedItems: [], underPlaceholderHeight: 0, upperPlaceholderHeight: 0 }
  public divDom: HTMLDivElement
  public upperContentDom: HTMLDivElement
  public needAdjustment = false
  public isAdjusting = false

  private hasBottomTouched = true
  private scrollTop = 0
  private projector: Projector
  private width: number
  private resizing = false

  /**
   * tell projector to project while got asynchronous data
   * @param nextProps 
   */
  public componentWillReceiveProps(nextProps: Props) {
    this.hasBottomTouched = false
    this.projector.next(nextProps.items)
  }

  public componentDidUpdate() {
    this.adjustUpperPlaceholderHieght()
  }

  /**
   * first mount: get the native dom
   */
  public componentDidMount() {
    this.width = this.divDom.clientWidth
    this.projector = new Projector(this, this.props.items, this.props.itemAverageHeight, this.props.cache)
    this.projector.subscribe((projectedItems, upperPlaceholderHeight, underPlaceholderHeight, needAdjustment) => {
      this.needAdjustment = needAdjustment
      if (underPlaceholderHeight < this.divDom.clientHeight && !this.hasBottomTouched) {
        this.hasBottomTouched = true
        this.props.onEnd!()
      }
      const prevStateItemsLength = this.state.projectedItems.length
      this.setState({ projectedItems, upperPlaceholderHeight, underPlaceholderHeight }, () => {
        if (prevStateItemsLength === 0 && projectedItems.length > 0) {
          this.divDom.scrollTop = this.props.initialScrollTop!
        }
      })
    })

    // tell projector to project for synchronous data
    if (this.props.items.length > 0) {
      this.hasBottomTouched = false
      this.projector.next()
    }

    window.addEventListener("resize", () => {
      if (this.divDom.clientWidth !== this.width) {
        this.width = this.divDom.clientWidth
        this.resizing = true
        this.projector.cachedItemRect.length = 0
        this.needAdjustment = true
        this.isAdjusting = false
        this.setState({})
      }
    })
  }

  public render() {
    const style = { overflow: "scroll" as "scroll", WebkitOverflowScrolling: "touch", overflowAnchor: "none", height: this.props.containerHeight }
    return (
      <div className={this.props.className || ""} ref={div => this.divDom = div!} style={style} onScroll={this.onScroll}>
        <div ref={div => this.upperContentDom = div!} style={{ height: this.state.upperPlaceholderHeight }}></div>
        {this.state.projectedItems.map((item, index) =>
          <Item
            key={this.props.itemKey ? item[this.props.itemKey] : index}
            projector={this.projector}
            item={item}
            needAdjustment={this.needAdjustment}
            itemIndex={this.projector.startIndex + index}
            upperPlaceholderHeight={this.state.upperPlaceholderHeight}
            onRenderCell={this.props.onRenderCell}
          />
        )}
        <div style={{ height: this.state.underPlaceholderHeight }}></div>
      </div>
    )
  }

  /**
   * if upperHeight is guesstimated(needAdjustment = true), we need to adjust upperHeight. this is step:
   * first next. project new sliced items. change needAdjustment to true.
   * first render. tell Item to update cache.
   * first didupdate. adjust upperHeight.
   * second render. update cache upon the correct upperHeight.
   * second didupdate. nothing happeded.
   */
  public adjustUpperPlaceholderHieght() {
    if (this.needAdjustment) {
      if (this.isAdjusting) {
        this.isAdjusting = false
        this.needAdjustment = false
        return
      }
      const cachedItemRect = this.projector.cachedItemRect
      const anchor = this.projector.anchorItem
      const cachedAnchorItem = cachedItemRect[anchor.index]
      const startItem = this.projector.cachedItemRect[this.projector.startIndex]
      const finalHeight = this.computeUpperPlaceholderHeight(cachedAnchorItem, startItem.top)
      const upperPlaceholderHeight = startItem.index === 0 ? 0 : finalHeight < 0 ? 0 : finalHeight
      const prevHeight = this.state.upperPlaceholderHeight
      const scrollTop = this.divDom.scrollTop

      this.setState({ upperPlaceholderHeight }, () => {
        if (startItem.index > 0) {
          if (this.resizing) {
            const currentAnchor = this.projector.cachedItemRect[this.projector.startIndex + 3]
            const anchorDelta = anchor.offset - currentAnchor.top
            const nextScrollTop = this.divDom.scrollTop - anchorDelta
            // keep scrollTop whthin anchor item.
            if (nextScrollTop < currentAnchor.top) {
              this.divDom.scrollTop = currentAnchor.top
            } else if (nextScrollTop > currentAnchor.bottom) {
              this.divDom.scrollTop = currentAnchor.bottom
            } else {
              this.divDom.scrollTop = nextScrollTop
            }

            this.resizing = false
          } else {
            if (finalHeight < 0) this.divDom.scrollTop = scrollTop - finalHeight
          }
        } else {
          // https://popmotion.io/blog/20170704-manually-set-scroll-while-ios-momentum-scroll-bounces/
          (this.divDom.style as any)["-webkit-overflow-scrolling"] = "auto"
          this.divDom.scrollTop = scrollTop - finalHeight;
          (this.divDom.style as any)["-webkit-overflow-scrolling"] = "touch"
        }

        this.projector.anchorItem = { index: this.projector.startIndex + 3, offset: this.projector.cachedItemRect[this.projector.startIndex + 3].top }

      })
    }
  }


  /**
   * if sliding direction is down, before height minus the height you just slipped.
   * if sliding direction is up, scrollTop minus buffer height.
   * @param cache cached anchor position
   * @param height upperHeight
   * 
   */
  public computeUpperPlaceholderHeight(cache: Cache, height: number): number {
    const projector = this.projector
    const scrollTop = this.divDom.scrollTop
    const prevStartIndex = projector.anchorItem.index > 2 ? projector.anchorItem.index - 3 : 0
    const scrollThroughItemCount = prevStartIndex - projector.startIndex
    this.isAdjusting = true
    const prevStartItem = projector.cachedItemRect[prevStartIndex]
    const upperHeight = scrollThroughItemCount < 0 ? scrollTop : prevStartItem ? this.state.upperPlaceholderHeight : scrollTop
    const endIndex = prevStartItem ? prevStartIndex : projector.startIndex + 3
    const scrollThroughItem = projector.cachedItemRect.slice(projector.startIndex, endIndex)
    const scrollThroughItemDistance = scrollThroughItem.reduce((acc, item) => acc + item.height, 0)
    return upperHeight - scrollThroughItemDistance
  }

  public onScroll = () => {
    const newScrollTop = this.divDom.scrollTop
    this.props.onScroll!(this.divDom)
    if (newScrollTop < this.scrollTop) {
      // hands down, viewport up
      this.projector.down()
    } else if (newScrollTop > this.scrollTop) {
      // hands up, viewport down
      this.projector.up()
    }
    this.scrollTop = newScrollTop
  }
}

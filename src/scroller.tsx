/**
 * Scroller.
 * a component to render data base on the paramater(upperHeight, newItems, underHeight) that received from Projector.
 * scroller also has an adjustment strategy to adjust upperHeight.
 */
import * as React from "react"
import { Projector, Cache } from "./projector"
import { Item } from "./item"

export type Props<> = {
  bufferSize?: number
  cache?: Cache[],
  containerHeight: number
  itemAverageHeight: number
  className?: string
  items: object[]
  itemKey: string
  initialScrollTop?: number
  onRenderCell: (item?: object, index?: number, measure?: () => void) => React.ReactNode
  onScroll?: (dom: HTMLDivElement) => void
  onEnd?: () => void
}

export type State = {
  projectedItems: any[]
}

export type BufferHeight = {
  upperPlaceholderHeight: number
  underPlaceholderHeight: number
}

export class InfiniteScroller extends React.Component<Props, State> {
  public static defaultProps = {
    bufferSize: 0,
    initialScrollTop: 0,
    onScroll: () => { },
    onEnd: () => { }
  }
  public state: State = { projectedItems: [] }
  public divDom!: HTMLDivElement
  public upperDom!: HTMLDivElement
  public underDom!: HTMLDivElement
  public needAdjustment = false
  public isAdjusting = false
  public bufferHeight = { upperPlaceholderHeight: 0, underPlaceholderHeight: 0 }

  private hasBottomTouched = true
  private scrollTop = 0
  private projector!: Projector
  private width = 0
  private isMeasuring = false

  /**
   * tell projector to project while got asynchronous data
   * @param nextProps 
   */
  public componentWillReceiveProps(nextProps: Props) {
    this.hasBottomTouched = false
    this.projector.next(nextProps.items)
  }

  public componentDidUpdate() {
    if (this.needAdjustment) {
      if (this.isAdjusting) {
        this.isAdjusting = false
        this.needAdjustment = false
        return
      }
      this.adjustUpperPlaceholderHieght()
    }
  }

  protected resizeHandler = () => {
    if (this.divDom.clientWidth !== this.width) {
      this.width = this.divDom.clientWidth
      this.projector.cachedItemRect.length = 0
      this.isMeasuring = true
      this.needAdjustment = true
      this.isAdjusting = false
      this.setState({})
    }
  }

  /**
   * first mount: get the native dom
   */
  public componentDidMount() {
    this.width = this.divDom.clientWidth
    this.projector = new Projector(this.divDom, this.bufferHeight, this.props.bufferSize!!!, this.props.items, this.props.itemAverageHeight, this.props.cache)
    this.projector.subscribe((projectedItems, upperPlaceholderHeight, underPlaceholderHeight, needAdjustment) => {
      this.needAdjustment = needAdjustment
      if (underPlaceholderHeight < this.divDom.clientHeight && !this.hasBottomTouched) {
        this.hasBottomTouched = true
        this.props.onEnd!()
      }
      const prevStateItemsLength = this.state.projectedItems.length
      this.bufferHeight.upperPlaceholderHeight = upperPlaceholderHeight
      this.bufferHeight.underPlaceholderHeight = underPlaceholderHeight
      this.setState({ projectedItems }, () => {
        if (prevStateItemsLength === 0 && projectedItems.length > 0) {
          this.divDom.scrollTop = this.props.initialScrollTop!
        }
      })
    })

    // tell projector to project synchronous data
    if (this.props.items.length > 0) {
      this.hasBottomTouched = false
      this.projector.next()
    }

    window.addEventListener("resize", this.resizeHandler)
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.resizeHandler)
  }

  public render() {
    const style = {
      overflow: "scroll" as "scroll",
      WebkitOverflowScrolling: "touch",
      overflowAnchor: "none",
      height: this.props.containerHeight
    }
    return (
      <div className={this.props.className || ""} ref={div => this.divDom = div!} style={style} onScroll={this.onScroll}>
        <div ref={div => this.upperDom = div!} style={{ height: this.bufferHeight.upperPlaceholderHeight }}></div>
        {this.state.projectedItems.map((item, index) =>
          <Item
            key={this.props.itemKey ? item[this.props.itemKey] : index}
            projector={this.projector}
            item={item}
            measure={this.measure}
            needAdjustment={this.needAdjustment}
            itemIndex={this.projector.startIndex + index}
            bufferHeight={this.bufferHeight}
            onRenderCell={this.props.onRenderCell}
          />
        )}
        <div ref={div => this.underDom = div!} style={{ height: this.bufferHeight.underPlaceholderHeight }}></div>
      </div>
    )
  }

  public measure = (itemIndex: number, delta: number) => {
    this.projector.cachedItemRect.length = 0
    let upperHeight, underHeight
    if (itemIndex <= this.projector.anchorItem.index) {
      const restUpperHeight = this.bufferHeight.upperPlaceholderHeight - delta
      if (restUpperHeight < 0) {
        upperHeight = 0
        this.upperDom.style.height = upperHeight + "px"
        const nextScrollTop = this.divDom.scrollTop + restUpperHeight
        this.compatibleScrollTo(nextScrollTop)
      } else {
        upperHeight = restUpperHeight
        this.upperDom.style.height = upperHeight + "px"
      }
      underHeight = this.bufferHeight.underPlaceholderHeight
      this.underDom.style.height = underHeight + "px"
    } else {
      const restUnderHeight = this.bufferHeight.underPlaceholderHeight - delta
      upperHeight = this.bufferHeight.upperPlaceholderHeight
      underHeight = restUnderHeight
      this.upperDom.style.height = upperHeight + "px"
      this.underDom.style.height = underHeight + "px"
    }
    this.bufferHeight.upperPlaceholderHeight = upperHeight
    this.bufferHeight.underPlaceholderHeight = underHeight
    this.needAdjustment = true
    this.isAdjusting = false
    // console.log(JSON.parse(JSON.stringify(this.projector.cachedItemRect)))
    this.setState({})
  }

  /**
   * During resizing and remeasuring, items should be minimal flicker,
   * so we need to keep scrollTop within anchor item.
   */
  public keepScrollTopWithinAnchor() {
    const anchorOffset = this.projector.anchorItem.offset
    const currentAnchor = this.projector.cachedItemRect[this.projector.startIndex + this.props.bufferSize!]
    const anchorDelta = anchorOffset - currentAnchor.top
    const nextScrollTop = this.divDom.scrollTop - anchorDelta
    if (nextScrollTop < currentAnchor.top) {
      this.compatibleScrollTo(currentAnchor.top)
    } else if (nextScrollTop > currentAnchor.bottom) {
      this.compatibleScrollTo(currentAnchor.bottom)
    } else {
      this.compatibleScrollTo(nextScrollTop)
    }
  }

  /**
   * https://popmotion.io/blog/20170704-manually-set-scroll-while-ios-momentum-scroll-bounces/
   * In the scroll momentum period, can not modify the scrollTop of the container in ios, it's a bug.
   */
  public compatibleScrollTo(scrollTop: number) {
    (this.divDom.style as any)["-webkit-overflow-scrolling"] = "auto"
    this.divDom.scrollTop = scrollTop > 0 ? scrollTop : 0;
    (this.divDom.style as any)["-webkit-overflow-scrolling"] = "touch"
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
    this.isAdjusting = true
    const cachedItemRect = this.projector.cachedItemRect
    const startIndex = this.projector.startIndex
    const finalHeight = this.computeUpperPlaceholderHeight(this.bufferHeight.upperPlaceholderHeight)
    const scrollTop = this.divDom.scrollTop
    this.bufferHeight.upperPlaceholderHeight = startIndex === 0 ? 0 : finalHeight < 0 ? 0 : finalHeight
    this.setState({}, () => {
      if (startIndex > 0) {
        if (this.isMeasuring) {
          this.keepScrollTopWithinAnchor()
          this.isMeasuring = false
        } else {
          if (finalHeight < 0) {
            this.compatibleScrollTo(scrollTop - finalHeight)
          }
        }
      } else {
        this.compatibleScrollTo(scrollTop - finalHeight)
      }

      this.projector.anchorItem = { index: startIndex + this.props.bufferSize!, offset: cachedItemRect[startIndex + this.props.bufferSize!].top }
      // console.log(startIndex, this.projector.anchorItem)
    })
  }


  /**
   * if slide down(eg. slide 52 to 51, scrollThroughItemCount is positive), upperHeight equals to state.upperHeight.
   * if slide up(eg. slide 52 to 53, scrollThroughItemCount is negative), upperHeight equals to current scrollTop.
   * then upperHeight minus scrollThroughItemDistance, we can get the actural height which should be render.
   * @param cache cached anchor position
   * @param height upperHeight
   * 
   */
  public computeUpperPlaceholderHeight(height: number): number {
    const projector = this.projector
    const scrollTop = this.divDom.scrollTop
    const prevStartIndex = projector.anchorItem.index >= this.props.bufferSize! ? projector.anchorItem.index - this.props.bufferSize! : 0
    const scrollThroughItemCount = prevStartIndex - projector.startIndex
    const prevStartItem = projector.cachedItemRect[prevStartIndex]
    const upperHeight = scrollThroughItemCount < 0 ? scrollTop : prevStartItem ? height : scrollTop
    const endIndex = prevStartItem ? prevStartIndex : projector.startIndex + this.props.bufferSize!
    const scrollThroughItem = projector.cachedItemRect.slice(projector.startIndex, endIndex)
    const scrollThroughItemDistance = scrollThroughItem.reduce((acc, item) => acc + item.height, 0)
    return upperHeight - scrollThroughItemDistance
  }

  public onScroll = () => {
    const newScrollTop = this.divDom.scrollTop
    this.props.onScroll!(this.divDom)
    if (newScrollTop < this.scrollTop) {
      // scroll down, viewport up
      this.projector.down()
    } else if (newScrollTop > this.scrollTop) {
      // scroll up, viewport down
      this.projector.up()
    }
    this.scrollTop = newScrollTop
  }
}

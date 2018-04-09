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
  projectedItems: any[],
  upperPlaceholderHeight: number
  underPlaceholderHeight: number
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
  public state: State = { projectedItems: [], upperPlaceholderHeight: 0, underPlaceholderHeight: 0 }
  public divDom!: HTMLDivElement
  public upperDom!: HTMLDivElement
  public underDom!: HTMLDivElement
  public needAdjustment = false
  public isAdjusting = false
  // public bufferHeight = { upperPlaceholderHeight: 0, underPlaceholderHeight: 0 }

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

  /**
   * first mount: get the native dom
   */
  public componentDidMount() {
    this.width = this.divDom.clientWidth
    const guesstimatedItemCountPerPage = Math.ceil(this.divDom.clientHeight / this.props.itemAverageHeight)
    this.projector = new Projector(guesstimatedItemCountPerPage, this.props.bufferSize!, this.props.items, this.props.itemAverageHeight, this.props.cache)
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

    // tell projector to project synchronous data
    if (this.props.items.length > 0) {
      this.hasBottomTouched = false
      this.projector.next()
    }

  }

  public render() {
    const style = {
      overflow: "scroll" as "scroll",
      WebkitOverflowScrolling: "touch",
      overflowAnchor: "none",
      height: this.props.containerHeight
    }
    return (
      <div id="c" className={this.props.className || ""} ref={div => this.divDom = div!} style={style} onScroll={this.onScroll}>
        <div ref={div => this.upperDom = div!} style={{ height: this.state.upperPlaceholderHeight }}></div>
        {this.state.projectedItems.map((item, index) =>
          <Item
            key={this.props.itemKey ? item[this.props.itemKey] : index}
            projector={this.projector}
            item={item}
            measure={this.measure}
            needAdjustment={this.needAdjustment}
            itemIndex={this.projector.startIndex + index}
            onRenderCell={this.props.onRenderCell}
          />
        )}
        <div ref={div => this.underDom = div!} style={{ height: this.state.underPlaceholderHeight }}></div>
      </div>
    )
  }

  public measure = (itemIndex: number, delta: number) => {
    const { upperHeight, underHeight } = this.projector.measure(itemIndex, delta)
    this.upperDom.style.height = upperHeight + "px"
    this.underDom.style.height = underHeight + "px"
    // if (upperHeight === 0 && this.projector.anchorItem.index !== 0) {
    //   const nextScrollTop = this.divDom.scrollTop + delta
    //   this.compatibleScrollTo(nextScrollTop)
    // }
    // if (itemIndex < this.projector.anchorItem.index && upperHeight === 0) {
    //   const nextScrollTop = this.divDom.scrollTop + delta
    //   this.compatibleScrollTo(nextScrollTop)
    // }
    // this.projector.updateTheLaterItemCaches(itemIndex, delta)
    // this.projector.findAnchorFromCaches(this.divDom.scrollTop)
    // console.log(this.projector.anchorItem)
    this.projector.cachedItemRect.length = 0
    this.needAdjustment = true
    this.isAdjusting = true
    this.setState({ upperPlaceholderHeight: upperHeight, underPlaceholderHeight: underHeight }, () => {
      const { index } = this.projector.anchorItem
      this.projector.anchorItem.offset = this.projector.cachedItemRect[index].top
    })
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
    const scrollTop = this.divDom.scrollTop
    const cachedItemRect = this.projector.cachedItemRect
    const startIndex = this.projector.startIndex
    const finalHeight = this.projector.computeVirtualUpperHeight(scrollTop, this.state.upperPlaceholderHeight)
    const upperPlaceholderHeight = this.projector.computeActualUpperHeight(finalHeight)
    this.setState({ upperPlaceholderHeight }, () => {
      if (startIndex > 0) {
        if (finalHeight < 0) {
          this.compatibleScrollTo(scrollTop - finalHeight)
        }
      } else {
        this.compatibleScrollTo(scrollTop - finalHeight)
      }
      this.setAnchor()
    })
  }

  public setAnchor() {
    const { cachedItemRect, startIndex } = this.projector
    if (cachedItemRect[startIndex + 3]) {
      this.projector.anchorItem = { index: startIndex + 3, offset: cachedItemRect[startIndex + 3].top }
    } else {
      this.projector.findAnchorFromCaches(this.divDom.scrollTop)
    }
  }

  public onScroll = () => {
    const newScrollTop = this.divDom.scrollTop
    this.props.onScroll!(this.divDom)
    if (newScrollTop < this.scrollTop) {
      // scroll down, viewport up
      this.projector.down(newScrollTop)
    } else if (newScrollTop > this.scrollTop) {
      // scroll up, viewport down
      this.projector.up(newScrollTop)
    }
    this.scrollTop = newScrollTop
  }
}

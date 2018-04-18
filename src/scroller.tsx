/**
 * Scroller.
 * a component to render data base on the paramater(upperHeight, newItems, underHeight) that received from Projector.
 * scroller also has an adjustment strategy to adjust upperHeight.
 */
import * as React from "react"
import { Projector, Cache } from "./projector"
import { Item } from "./item"

const isIos = !!navigator.platform.match(/iPhone|iPod|iPad/)

export type Props = {
  cache?: Cache[],
  containerHeight: number
  itemAverageHeight: number
  className?: string
  items: object[]
  itemKey: string
  initialScrollTop?: number
  onRenderCell: (item: object, index: number) => React.ReactNode
  onScroll?: (dom: HTMLDivElement) => void
  onEnd?: () => void
}

export type State = {
  projectedItems: any[],
  upperPlaceholderHeight: number
  underPlaceholderHeight: number
}

export class InfiniteScroller extends React.Component<Props, State> {
  public static defaultProps = {
    bufferSize: 3,
    className: "",
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

  private hasBottomTouched = true
  private scrollTop = 0
  private projector!: Projector
  private width = 0

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
    this.projector = new Projector(this.props.containerHeight, guesstimatedItemCountPerPage, 3, this.props.items, this.props.itemAverageHeight, this.props.cache)
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
      <div className={this.props.className!} ref={div => this.divDom = div!} style={style} onScroll={this.onScroll}>
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

  /**
   * We expect the measure to be triggered after height has changed but before repain.
   * Then we can adjust the upperHeight manually to keep no flicker.
   */
  public measure = (itemIndex: number, delta: number) => {
    const { upperHeight, underHeight } = this.projector.measure(itemIndex, delta)
    this.upperDom.style.height = upperHeight + "px"
    this.underDom.style.height = underHeight + "px"
    if (upperHeight === 0 && this.projector.startIndex !== 0) {
      this.compatibleScrollTo(this.divDom.scrollTop + delta)
    }
    this.projector.updateLaterItem(itemIndex, delta)
    const previousAnchorIndex = this.projector.anchorItem.index
    this.projector.setAnchorFromCaches(this.divDom.scrollTop)
    // const currentAnchorIndex = this.projector.anchorItem.index
    // this.keepScrollTopWithinAnchor(previousAnchorIndex)
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
          if (isIos) {
            // because of the scroll bug in ios, if scroll up, but the upperHeight minus scrolledDistance is nagetive,
            // to adjust scrollTop will cause the motivation to stop. To avoid this problem occurs sequently,
            // we need to remeasure upperHeight if the device is ios.
            const estimateHeight = this.projector.estimateUpperHeight()
            this.upperDom.style.height = this.state.upperPlaceholderHeight + "px"
            this.compatibleScrollTo(scrollTop - finalHeight)
            this.needAdjustment = true
            this.isAdjusting = true
            this.setState({ upperPlaceholderHeight: this.state.upperPlaceholderHeight + estimateHeight }, () => {
              this.projector.resetAnchorFromCaches()
              this.compatibleScrollTo(scrollTop - finalHeight + estimateHeight)
            })
          } else {
            this.compatibleScrollTo(scrollTop - finalHeight)
          }
        } else {

        }
      } else {
        if (finalHeight !== 0) {
          this.compatibleScrollTo(scrollTop - finalHeight)
        }
      }
      this.projector.setAnchorFromCaches(scrollTop)
    })
  }

  /**
   * During resizing and remeasuring, items should be minimal flicker,
   * so we need to keep scrollTop within anchor item.
   */
  public keepScrollTopWithinAnchor(prevAnchorIndex: number) {
    const currentAnchor = this.projector.anchorItem
    if (prevAnchorIndex > currentAnchor.index) {
      this.compatibleScrollTo(this.projector.cachedItemRect[prevAnchorIndex].bottom)
    } else if (prevAnchorIndex < currentAnchor.index) {
      this.compatibleScrollTo(currentAnchor.top)
    } else {

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

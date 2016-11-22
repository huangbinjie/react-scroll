import * as React from 'react'
import { findDOMNode } from 'react-dom'

export interface Props {
  onEnd: Function
  onClick?: () => void
  children?: [React.ReactChildren]
  className?: string
  scrollDOM?: () => Element | HTMLDocument
  animation?: React.ComponentClass<State>
}

export interface State {
  display: 'none' | 'block'
}

export default class InifiteScroll extends React.Component<Props, State> {
  static defaultProps: Props = {
    onEnd: () => { },
    onClick: () => { },
    className: ""
  }
  public state: State = { display: "none" }
  public componentDidMount() {
    this.nativeDOM = findDOMNode(this)
    const scrollDOM = this.props.scrollDOM()

    if (scrollDOM instanceof Element || scrollDOM instanceof HTMLDocument)
      this.parentDOM = scrollDOM
    else
      this.parentDOM = document

    this.parentDOM.addEventListener("scroll", this.scrollHandle)
  }
  public componentWillUnmount() {
    this.parentDOM.removeEventListener("scroll", this.scrollHandle)
  }
  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.children == void 0 || this.props.children == void 0) {
      this.setState({ display: "none" })
      return
    }
    if (nextProps.children.length !== this.props.children.length) {
      this.shouldUpdate = true
    }
    this.setState({ display: "none" })
  }
  public render() {
    const Animation = this.props.animation
    return (
      <ul className={this.props.className} onClick={this.props.onClick}>
        {this.props.children}
        {Animation && <Animation display={this.state.display} />}
      </ul>
    )
  }
  private shouldUpdate = true
  private nativeDOM: Element
  private parentDOM: Element | HTMLElement | HTMLDocument
  private scrollHandle = () => {
    const rectData = this.nativeDOM.getBoundingClientRect()
    if (rectData.bottom < window.innerHeight * 2) {
      if (this.shouldUpdate && this.props.children[0]) {
        this.setState({ display: "block" })
        this.props.onEnd()
        this.shouldUpdate = false
      }
    }
  }
}
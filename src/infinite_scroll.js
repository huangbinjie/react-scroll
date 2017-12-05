"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const DEFAULT_ITEM_HEIGHT = 30;
class InifiteScroll extends React.Component {
    constructor(props) {
        super(props);
        this.state = { sample: [], underContentPlaceholderHeight: 0, uponContentPlaceholderHeight: 0 };
        this.topAnchorIndex = 0;
        this.bottomAnchorIndex = 0;
        this.shouldUpdate = true;
        this.guestimatedItemCountPerPage = 10;
        this.cachedItemRect = [];
        this.scrollTop = 0;
        this.anchorScrollTop = 0;
        this.createChild = (item, index) => {
            const parent = this;
            return class Child extends React.Component {
                componentDidMount() {
                    if (!parent.cachedItemRect[index]) {
                        const child = this.refs.child;
                        const rect = child.getBoundingClientRect();
                        const prevItem = parent.cachedItemRect[index - 1];
                        const bottom = prevItem ? prevItem.bottom + rect.height : rect.bottom;
                        const top = prevItem ? prevItem.bottom : rect.top;
                        parent.cachedItemRect[index] = { top, bottom, height: rect.height, text: item.content };
                    }
                }
                render() {
                    return React.createElement("div", { ref: "child" }, parent.props.onRenderCell(item, index));
                }
            };
        };
        this.onScroll = () => {
            const anchorRect = this.cachedItemRect[this.topAnchorIndex];
            const beforeAnchorRect = this.cachedItemRect[this.topAnchorIndex - 1];
            const newScrollTop = this.divDom.scrollTop;
            const offsetTop = this.divDom.offsetTop;
            const delta = newScrollTop - this.anchorScrollTop;
            if (newScrollTop < this.scrollTop) {
                if (!beforeAnchorRect)
                    return;
                if (delta * -1 > beforeAnchorRect.height) {
                    const bottom = beforeAnchorRect.bottom + delta;
                    const itemIndex = this.cachedItemRect.findIndex(item => item.top > bottom);
                    this.bottomAnchorIndex += itemIndex - this.topAnchorIndex;
                    this.topAnchorIndex = itemIndex;
                    this.anchorScrollTop = this.cachedItemRect[itemIndex].top - offsetTop;
                    this.project(this.props.items, this.props.averageHeight);
                }
            }
            else {
                if (delta > anchorRect.height) {
                    const bottom = anchorRect.top + delta;
                    const itemIndex = this.cachedItemRect.findIndex(item => item.bottom > bottom);
                    this.bottomAnchorIndex += itemIndex - this.topAnchorIndex;
                    this.topAnchorIndex = itemIndex;
                    this.anchorScrollTop = this.cachedItemRect[itemIndex].top - offsetTop;
                    this.project(this.props.items, this.props.averageHeight);
                }
            }
            this.scrollTop = newScrollTop;
        };
        this.project = (items, averageHeight) => {
            const isTopEnoughThree = this.topAnchorIndex > 2;
            const startIndex = isTopEnoughThree ? this.topAnchorIndex - 3 : 0;
            const sample = items.slice(startIndex, this.bottomAnchorIndex + 1);
            const uponContentPlaceholderHeight = isTopEnoughThree ? this.cachedItemRect[this.topAnchorIndex - 3].top - this.divDom.offsetTop : 0;
            this.setState({ sample, uponContentPlaceholderHeight });
        };
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.items.length !== nextProps.items.length) {
            if (nextProps.items.length < this.bottomAnchorIndex) {
                this.bottomAnchorIndex = nextProps.items.length - 1;
            }
        }
        this.project(nextProps.items, nextProps.averageHeight);
    }
    componentDidUpdate() {
        const cachedItemRectLength = this.cachedItemRect.length;
        const unCachedItemCount = this.props.items.length - cachedItemRectLength;
        const underContentPlaceholderHeight = cachedItemRectLength > 0 ? this.cachedItemRect[cachedItemRectLength - 1].bottom - this.cachedItemRect[this.bottomAnchorIndex].bottom + unCachedItemCount * this.props.averageHeight : 0;
        this.underContentDivDom.style.height = underContentPlaceholderHeight + "px";
    }
    componentDidMount() {
        this.guestimatedItemCountPerPage = Math.ceil(this.divDom.clientHeight / this.props.averageHeight);
        this.bottomAnchorIndex = this.topAnchorIndex + Math.round(this.guestimatedItemCountPerPage * 1.5) - 1;
    }
    render() {
        return (React.createElement("div", { id: "c", ref: div => this.divDom = div, style: { overflow: "scroll", boxSizing: "border-box", height: "100%" }, onScroll: this.onScroll },
            React.createElement("div", { style: { height: this.state.uponContentPlaceholderHeight } }),
            this.state.sample.map((item, index) => React.createElement(this.createChild(item, (this.topAnchorIndex > 3 ? this.topAnchorIndex - 3 : 0) + index), { key: item.id })),
            React.createElement("div", { ref: div => this.underContentDivDom = div })));
    }
}
exports.default = InifiteScroll;

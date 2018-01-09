"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const projector_1 = require("./projector");
class InfiniteScroll extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { projectedItems: [], underPlaceholderHeight: 0, upperPlaceholderHeight: 0 };
        this.hasBottomTouched = true;
        this.scrollTop = 0;
        this.resizing = false;
        this.createChild = (item, index) => {
            const parent = this;
            const itemIndex = parent.projector.startIndex + index;
            return class Child extends React.Component {
                constructor() {
                    super(...arguments);
                    this.setCache = () => {
                        const projector = parent.projector;
                        const cachedItemRect = projector.cachedItemRect;
                        const curItem = cachedItemRect[itemIndex];
                        const prevItem = cachedItemRect[itemIndex - 1];
                        if (projector.needAdjustment) {
                            const rect = this.dom.getBoundingClientRect();
                            if (itemIndex === projector.startIndex) {
                                const bottom = parent.state.upperPlaceholderHeight + rect.height;
                                const top = parent.state.upperPlaceholderHeight;
                                cachedItemRect[itemIndex] = { index: itemIndex, top, bottom, height: rect.height, needAdjustment: true };
                            }
                            else {
                                const bottom = prevItem.bottom + rect.height;
                                const top = prevItem.bottom;
                                cachedItemRect[itemIndex] = { index: itemIndex, top, bottom, height: rect.height, needAdjustment: true };
                            }
                            if (projector.isAdjusting && index === parent.state.projectedItems.length - 1) {
                                projector.needAdjustment = false;
                                projector.isAdjusting = false;
                            }
                        }
                        else {
                            if (curItem && curItem.needAdjustment === false)
                                return;
                            const rect = this.dom.getBoundingClientRect();
                            if (prevItem) {
                                const bottom = prevItem.bottom + rect.height;
                                const top = prevItem.bottom;
                                cachedItemRect[itemIndex] = { index: itemIndex, top, bottom, height: rect.height, needAdjustment: false };
                            }
                            else {
                                const bottom = parent.state.upperPlaceholderHeight + rect.height;
                                const top = parent.state.upperPlaceholderHeight;
                                cachedItemRect[itemIndex] = { index: itemIndex, top, bottom, height: rect.height, needAdjustment: false };
                            }
                        }
                    };
                }
                componentDidMount() {
                    this.setCache();
                }
                render() {
                    return React.createElement("div", { ref: div => this.dom = div }, parent.props.onRenderCell(item, itemIndex));
                }
            };
        };
        this.onScroll = () => {
            const newScrollTop = this.divDom.scrollTop;
            this.props.onScroll(this.divDom);
            if (newScrollTop < this.scrollTop) {
                this.projector.down();
            }
            else {
                this.projector.up();
            }
            this.scrollTop = newScrollTop;
        };
    }
    componentWillReceiveProps(nextProps) {
        this.hasBottomTouched = false;
        this.projector.next(nextProps.items);
    }
    componentDidUpdate() {
        this.adjustUpperPlaceholderHieght();
    }
    componentDidMount() {
        this.width = this.divDom.clientWidth;
        this.projector = new projector_1.Projector(this.divDom, this.upperContentDom, this.props.items, this.props.itemAverageHeight, this.props.cache);
        this.projector.subscribe((projectedItems, upperPlaceholderHeight, underPlaceholderHeight) => {
            if (underPlaceholderHeight < this.divDom.clientHeight && !this.hasBottomTouched) {
                this.hasBottomTouched = true;
                this.props.onEnd();
            }
            const prevStateItemsLength = this.state.projectedItems.length;
            this.setState({ projectedItems, upperPlaceholderHeight, underPlaceholderHeight }, () => {
                if (prevStateItemsLength === 0 && projectedItems.length > 0) {
                    this.divDom.scrollTop = this.props.initialScrollTop;
                }
            });
        });
        if (this.props.items.length > 0) {
            this.hasBottomTouched = false;
            this.projector.next();
        }
        window.addEventListener("resize", () => {
            if (this.divDom.clientWidth !== this.width) {
                this.width = this.divDom.clientWidth;
                this.resizing = true;
                this.projector.cachedItemRect.length = 0;
                this.projector.needAdjustment = true;
                this.setState({});
            }
        });
    }
    render() {
        return (React.createElement("div", { id: "c", ref: div => this.divDom = div, style: { overflow: "scroll", WebkitOverflowScrolling: "touch", height: this.props.containerHeight }, onScroll: this.onScroll },
            React.createElement("div", { ref: div => this.upperContentDom = div, style: { height: this.state.upperPlaceholderHeight } }),
            this.state.projectedItems.map((item, index) => React.createElement(this.createChild(item, index), { key: this.props.identity ? item[this.props.identity] : index })),
            React.createElement("div", { style: { height: this.state.underPlaceholderHeight } })));
    }
    adjustUpperPlaceholderHieght() {
        if (this.projector.needAdjustment) {
            const cachedItemRect = this.projector.cachedItemRect;
            const anchor = this.projector.anchorItem;
            const cachedAnchorItem = cachedItemRect[anchor.index];
            const startItem = this.projector.cachedItemRect[this.projector.startIndex];
            const finalHeight = this.projector.computeUpperPlaceholderHeight(cachedAnchorItem, startItem.top);
            const scrollTop = this.divDom.scrollTop;
            const upperPlaceholderHeight = startItem.index === 0 ? 0 : finalHeight < 0 ? 0 : finalHeight;
            this.setState({ upperPlaceholderHeight }, () => {
                if (startItem.index > 0) {
                    if (finalHeight < 0)
                        this.divDom.scrollTop = scrollTop - finalHeight;
                    if (this.resizing) {
                        const currentAnchor = this.projector.cachedItemRect[this.projector.startIndex + 3];
                        const anchorDelta = anchor.offset - currentAnchor.top;
                        const nextScrollTop = this.divDom.scrollTop - anchorDelta;
                        if (nextScrollTop < currentAnchor.top) {
                            this.divDom.scrollTop = currentAnchor.top;
                        }
                        else if (nextScrollTop > currentAnchor.bottom) {
                            this.divDom.scrollTop = currentAnchor.bottom;
                        }
                        else {
                            this.divDom.scrollTop = nextScrollTop;
                        }
                        this.resizing = false;
                    }
                }
                else {
                    this.divDom.scrollTop = scrollTop - finalHeight;
                }
            });
        }
        this.projector.anchorItem = { index: this.projector.startIndex + 3, offset: this.projector.cachedItemRect[this.projector.startIndex + 3].top };
    }
}
InfiniteScroll.defaultProps = {
    initialScrollTop: 0,
    onScroll: () => { },
    onEnd: () => { }
};
exports.InfiniteScroll = InfiniteScroll;

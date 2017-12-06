"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const projector_1 = require("./projector");
class InifiteScroll extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { projectedItems: [], underContentPlaceholderHeight: 0, uponContentPlaceholderHeight: 0 };
        this.scrollTop = 0;
        this.createChild = (item, index) => {
            const parent = this;
            return class Child extends React.Component {
                componentDidMount() {
                    const cachedItemRect = parent.projector.cachedItemRect;
                    if (!cachedItemRect[index]) {
                        const child = this.refs.child;
                        const rect = child.getBoundingClientRect();
                        const prevItem = cachedItemRect[index - 1];
                        const bottom = prevItem ? prevItem.bottom + rect.height : rect.bottom;
                        const top = prevItem ? prevItem.bottom : rect.top;
                        cachedItemRect[index] = { top, bottom, height: rect.height, text: item.content };
                    }
                }
                render() {
                    return React.createElement("div", { ref: "child" }, parent.props.onRenderCell(item, index));
                }
            };
        };
        this.onScroll = () => {
            const newScrollTop = this.divDom.scrollTop;
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
        this.projector.next(nextProps.items);
    }
    componentDidMount() {
        this.projector = new projector_1.Projector(this.divDom, this.props.items, this.props.averageHeight);
        this.projector.subscribe((projectedItems, uponContentPlaceholderHeight, underContentPlaceholderHeight) => {
            this.setState({ projectedItems, uponContentPlaceholderHeight, underContentPlaceholderHeight });
        });
    }
    render() {
        return (React.createElement("div", { id: "c", ref: div => this.divDom = div, style: { overflow: "scroll", boxSizing: "border-box", height: "100%" }, onScroll: this.onScroll },
            React.createElement("div", { style: { height: this.state.uponContentPlaceholderHeight } }),
            this.state.projectedItems.map((item, index) => React.createElement(this.createChild(item, this.projector.startIndex + index), { key: this.props.key ? item[this.props.key] : index })),
            React.createElement("div", { style: { height: this.state.underContentPlaceholderHeight } })));
    }
}
exports.default = InifiteScroll;

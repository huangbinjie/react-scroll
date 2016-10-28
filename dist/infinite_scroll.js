"use strict";
const React = require('react');
const react_dom_1 = require('react-dom');
class InifiteScroll extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { display: "none" };
        this.shouldUpdate = true;
        this.scrollHandle = () => {
            const rectData = this.nativeDOM.getBoundingClientRect();
            if (rectData.bottom < this.props.sizeToLoad) {
                if (this.shouldUpdate && this.props.children[0]) {
                    this.setState({ display: "block" });
                    this.props.onEnd();
                    this.shouldUpdate = false;
                }
            }
        };
    }
    componentDidMount() {
        this.nativeDOM = react_dom_1.findDOMNode(this);
        this.props.bindingDOM.addEventListener("scroll", this.scrollHandle);
    }
    componentWillUnmount() {
        this.props.bindingDOM.removeEventListener("scroll", this.scrollHandle);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.children == void 0 || this.props.children == void 0) {
            this.setState({ display: "none" });
            return;
        }
        if (nextProps.children.length !== this.props.children.length) {
            this.shouldUpdate = true;
        }
        this.setState({ display: "none" });
    }
    render() {
        const Animation = this.props.animation;
        return (React.createElement("ul", {className: this.props.className, onClick: this.props.onClick}, 
            this.props.children, 
            Animation && React.createElement(Animation, {display: this.state.display})));
    }
}
InifiteScroll.defaultProps = {
    onEnd: () => { },
    onClick: () => { },
    className: "",
    sizeToLoad: window.innerHeight * 2,
    bindingDOM: document
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InifiteScroll;
//# sourceMappingURL=infinite_scroll.js.map
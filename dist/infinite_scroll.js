"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_dom_1 = require("react-dom");
var InifiteScroll = (function (_super) {
    __extends(InifiteScroll, _super);
    function InifiteScroll() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { display: "none" };
        _this.shouldUpdate = true;
        _this.scrollHandle = function () {
            var rectData = _this.nativeDOM.getBoundingClientRect();
            if (rectData.bottom < window.innerHeight * 2) {
                if (_this.shouldUpdate && _this.props.children[0]) {
                    _this.setState({ display: "block" });
                    _this.props.onEnd();
                    _this.shouldUpdate = false;
                }
            }
        };
        return _this;
    }
    InifiteScroll.prototype.componentDidMount = function () {
        this.nativeDOM = react_dom_1.findDOMNode(this);
        var scrollDOM = this.props.scrollDOM ? this.props.scrollDOM() : null;
        if (scrollDOM instanceof Element || scrollDOM instanceof HTMLDocument)
            this.parentDOM = scrollDOM;
        else
            this.parentDOM = document;
        this.parentDOM.addEventListener("scroll", this.scrollHandle);
    };
    InifiteScroll.prototype.componentWillUnmount = function () {
        this.parentDOM.removeEventListener("scroll", this.scrollHandle);
    };
    InifiteScroll.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.children == void 0 || this.props.children == void 0) {
            this.setState({ display: "none" });
            return;
        }
        if (nextProps.children.length !== this.props.children.length) {
            this.shouldUpdate = true;
        }
        this.setState({ display: "none" });
    };
    InifiteScroll.prototype.render = function () {
        var Animation = this.props.animation;
        return (React.createElement("ul", { className: this.props.className, onClick: this.props.onClick },
            this.props.children,
            Animation && React.createElement(Animation, { display: this.state.display })));
    };
    InifiteScroll.defaultProps = {
        onEnd: function () { },
        onClick: function () { },
        className: ""
    };
    return InifiteScroll;
}(React.Component));
exports.default = InifiteScroll;
//# sourceMappingURL=infinite_scroll.js.map
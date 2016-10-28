"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var react_dom_1 = require('react-dom');
var InifiteScroll = (function (_super) {
    __extends(InifiteScroll, _super);
    function InifiteScroll() {
        var _this = this;
        _super.apply(this, arguments);
        this.state = { display: "none" };
        this.shouldUpdate = true;
        this.scrollHandle = function () {
            var rectData = _this.nativeDOM.getBoundingClientRect();
            if (rectData.bottom < _this.props.sizeToLoad) {
                if (_this.shouldUpdate && _this.props.children[0]) {
                    _this.setState({ display: "block" });
                    _this.props.onEnd();
                    _this.shouldUpdate = false;
                }
            }
        };
    }
    InifiteScroll.prototype.componentDidMount = function () {
        this.nativeDOM = react_dom_1.findDOMNode(this);
        this.props.bindingDOM.addEventListener("scroll", this.scrollHandle);
    };
    InifiteScroll.prototype.componentWillUnmount = function () {
        this.props.bindingDOM.removeEventListener("scroll", this.scrollHandle);
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
        return (<ul className={this.props.className} onClick={this.props.onClick}>
        {this.props.children}
        {this.props.animation}
      </ul>);
    };
    InifiteScroll.defaultProps = {
        onEnd: function () { },
        onClick: function () { },
        className: "",
        sizeToLoad: window.innerHeight * 2,
        bindingDOM: document
    };
    return InifiteScroll;
}(React.Component));
exports.__esModule = true;
exports["default"] = InifiteScroll;

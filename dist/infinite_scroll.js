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
var DEFAULT_ITEM_HEIGHT = 30;
var InifiteScroll = /** @class */ (function (_super) {
    __extends(InifiteScroll, _super);
    function InifiteScroll(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { sample: [], underContentPlaceholderHeight: 0, uponContentPlaceholderHeight: 0 };
        _this.topAnchorIndex = -1;
        _this.bottomAnchorIndex = 0;
        _this.shouldUpdate = true;
        _this.guestimatedItemCountPerPage = 10;
        _this.cachedItemRect = [];
        _this.scrollTop = 0;
        _this.anchorScrollTop = 0;
        _this.scrollDirection = "down";
        _this.createChild = function (item, index) {
            var parent = _this;
            return /** @class */ (function (_super) {
                __extends(Child, _super);
                function Child() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Child.prototype.componentDidMount = function () {
                    var child = this.refs.child;
                    // if (!parent.cachedItemRect[index])
                    var rect = child.getBoundingClientRect();
                    // rect.top += parent.state.uponContentPlaceholderHeight
                    parent.cachedItemRect[index] = rect;
                    // console.log(index, parent.cachedItemRect[index].top)
                };
                Child.prototype.render = function () {
                    return React.createElement("div", { ref: "child" }, parent.props.onRenderCell(item, index));
                };
                return Child;
            }(React.Component));
        };
        _this.onScroll = function () {
            var anchorRect = _this.cachedItemRect[_this.topAnchorIndex];
            var newScrollTop = _this.divDom.scrollTop;
            // 往下滑
            if (_this.scrollTop > newScrollTop) {
                _this.scrollDirection = "down";
                var anchorItemTop2ContainerTop = anchorRect.top - _this.divDom.offsetTop;
                if (newScrollTop < anchorItemTop2ContainerTop) {
                    _this.topAnchorIndex--;
                    _this.bottomAnchorIndex--;
                    _this.anchorScrollTop = newScrollTop;
                    _this.project(_this.props.items, _this.props.averageHeight);
                }
            }
            else {
                //往上滑
                _this.scrollDirection = "up";
                var anchorItemBottom2ContainerTop = anchorRect.bottom - _this.divDom.clientTop;
                if (newScrollTop > anchorItemBottom2ContainerTop) {
                    _this.topAnchorIndex++;
                    _this.bottomAnchorIndex++;
                    _this.anchorScrollTop = newScrollTop;
                    _this.project(_this.props.items, _this.props.averageHeight);
                }
            }
            _this.scrollTop = newScrollTop;
            // this.sample(this.props.items, this.props.averageHeight)
        };
        // public computeBottomAnchorIndex() {
        //   for (let index in this.cachedItemRect) {
        //     if (this.cachedItemRect[index].top - this.divDom.offsetTop > this.divDom.scrollTop + this.divDom.clientHeight) {
        //       return this.bottomAnchorIndex = +index
        //     }
        //   }
        //   // this.cachedItemRect.forEach((rect, index) => {
        //   //   if (rect.top - this.divDom.offsetTop > this.divDom.scrollTop + this.divDom.clientHeight) {
        //   //     return this.bottomAnchorIndex = index
        //   //   }
        //   // })
        //   // 如果高度达不到容器的 clientHeight，则是最后一个
        //   return this.topAnchorIndex + Math.ceil(this.divDom.clientHeight / this.props.averageHeight) - 1
        // }
        /**
         * 投影仪
         *
         */
        _this.project = function (items, averageHeight) {
            var isTopEnoughThree = _this.topAnchorIndex > 2;
            // const isBottomEnoughThree = this.bottomAnchorIndex + 3 < items.length
            var startIndex = isTopEnoughThree ? _this.topAnchorIndex - 3 : 0;
            // const endIndex = isBottomEnoughThree ? this.bottomAnchorIndex + 3 : this.bottomAnchorIndex
            var sample = items.slice(startIndex, _this.bottomAnchorIndex);
            // 滑动到顶部超过3个，计算顶部高度, TODO 算法优化
            var uponContentPlaceholderHeight = isTopEnoughThree ? _this.cachedItemRect.slice(0, _this.topAnchorIndex - 3).reduce(function (acc, rect) { return acc + rect.height; }, 0) : 0;
            // const unCachedItemCount = items.length - this.cachedItemRect.length
            // const underContentPlaceholderHeight = this.cachedItemRect.slice(endIndex + 4).reduce((acc, rect) => acc + rect.height, 0) + unCachedItemCount * averageHeight
            _this.setState({ sample: sample, uponContentPlaceholderHeight: uponContentPlaceholderHeight });
        };
        return _this;
    }
    InifiteScroll.prototype.componentWillReceiveProps = function (nextProps) {
        if (this.props.items.length !== nextProps.items.length) {
            // this.shouldUpdate = true
            if (nextProps.items.length < this.bottomAnchorIndex) {
                // 如果高度不足一屏
                this.bottomAnchorIndex = nextProps.items.length - 1;
                // this.guestimatedItemCountPerPage = nextProps.items.length
            }
        }
        this.project(nextProps.items, nextProps.averageHeight);
    };
    InifiteScroll.prototype.componentDidUpdate = function () {
        this.divDom.scrollTop = this.state.uponContentPlaceholderHeight + this.anchorScrollTop;
        if (this.topAnchorIndex > 3) {
            // console.log(this.cachedItemRect, this.topAnchorIndex, this.cachedItemRect[this.topAnchorIndex].top, this.divDom.clientTop)
            // this.divDom.scrollTop = this.cachedItemRect[this.topAnchorIndex].top - this.divDom.clientTop + this.state.uponContentPlaceholderHeight
        }
        else {
            // this.divDom.scrollTop =
        }
        // console.log(this.scrollTop,this.state.uponContentPlaceholderHeight)
        // 如果平均数量的高度不够滑动 dom 的高度，则需要重新 estimate 高度
        // const scrollContainerBottom2Top = this.divDom.scrollTop + this.divDom.clientHeight
        // const scrollContainerMiddle2Top = scrollContainerBottom2Top / 2
        // if (this.cachedItemRect[this.bottomAnchorIndex].top < scrollContainerBottom2Top) {
        //   this.guestimatedItemCountPerPage = this.guestimatedItemCountPerPage * 2
        // }
    };
    // public shouldComponentUpdate(nextProps: Props) {
    //   return this.shouldUpdate
    // }
    /**
     * 第一次加载空数组，为了拿到容器的dom：divDom
     * 预估显示数量
     * 根据预估数量计算出下描点位置
     */
    InifiteScroll.prototype.componentDidMount = function () {
        this.guestimatedItemCountPerPage = Math.ceil(this.divDom.clientHeight / this.props.averageHeight);
        this.bottomAnchorIndex = this.topAnchorIndex + this.guestimatedItemCountPerPage * 2;
        // if (this.props.items.length > 0) {
        // this.bottomAnchorIndex = this.computeBottomAnchorIndex()
        // this.project(this.props.items, this.props.averageHeight)
        // const guestimatedItemCountPerPage = Math.ceil(this.divDom.clientHeight / this.props.averageHeight)
        // // 如果少于两屏则数量翻倍，最差1.9屏，最好1屏
        // if (this.divDom.scrollHeight < this.divDom.clientHeight * 2) {
        //   this.guestimatedItemCountPerPage = guestimatedItemCountPerPage * 2
        // } else {
        //   this.guestimatedItemCountPerPage = guestimatedItemCountPerPage
        // }
        // this.shouldUpdate = true
        // this.project(this.props.items, this.props.averageHeight)
        // this.divDom.addEventListener("resize", () => {
        //   console.log(1111)
        // })
        // }
    };
    InifiteScroll.prototype.render = function () {
        var _this = this;
        // this.shouldUpdate = false
        console.log(this.topAnchorIndex);
        return (React.createElement("div", { id: "c", ref: function (div) { return _this.divDom = div; }, style: { overflow: "scroll", boxSizing: "border-box", height: "100%" }, onScroll: this.onScroll },
            React.createElement("div", { ref: function (div) { return _this.uponDivPlaceholderDom = div; }, style: { height: this.state.uponContentPlaceholderHeight } }),
            this.state.sample.map(function (item, index) { return React.createElement(_this.createChild(item, _this.topAnchorIndex + index), { key: index }); })));
    };
    return InifiteScroll;
}(React.Component));
exports.default = InifiteScroll;
// class Projector {
//   constructor(originalData: any[]) {
//   }
//   public replaceData(newData: any[]) {
//   }
//   public next() {
//   }
// } 
//# sourceMappingURL=infinite_scroll.js.map
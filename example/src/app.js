"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_dom_1 = require("react-dom");
const scroller_1 = require("../../src/scroller");
const api_1 = require("./api");
class App extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { messages: api_1.fetchLocalMessage() };
    }
    componentDidMount() {
    }
    render() {
        return (React.createElement(scroller_1.InfiniteScroller, { itemAverageHeight: 22, containerHeight: window.innerHeight, items: this.state.messages, itemKey: "id", onRenderCell: this.renderCell }));
    }
    renderCell(item, index) {
        return React.createElement("li", { key: index },
            item.content,
            React.createElement("span", { style: { color: "red" } }, index));
    }
}
react_dom_1.render(React.createElement(App, null), document.getElementById("root"));

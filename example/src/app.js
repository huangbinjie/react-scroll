"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_dom_1 = require("react-dom");
const infinite_scroll_1 = require("../../src/infinite_scroll");
const api_1 = require("./api");
class App extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { messages: [] };
    }
    componentDidMount() {
        api_1.fetchData().then(messages => this.setState({ messages }));
    }
    render() {
        return (React.createElement(infinite_scroll_1.default, { averageHeight: 23, items: this.state.messages, onRenderCell: this.renderCell }));
    }
    renderCell(item, index) {
        return React.createElement("li", { key: index },
            index,
            ", ",
            item.content);
    }
}
react_dom_1.render(React.createElement(App, null), document.getElementById("root"));

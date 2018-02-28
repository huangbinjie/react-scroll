import * as React from 'react'
import { render } from 'react-dom'

import { InfiniteScroller } from '../../src/scroller'

import { fetchDataWithImageAndText, fetchDataWithText } from './api'

type State = {
  innerHeight: number
  messages: { id: string, content: string }[]
}


class App extends React.Component<{}, State> {
  state: State = { innerHeight: window.innerHeight, messages: [] }
  componentDidMount() {
    // fetchDataWithImageAndText().then(messages => this.setState({ messages }))
    fetchDataWithText().then(messages => this.setState({ messages }))
  }
  render() {
    return (
      <InfiniteScroller
        itemAverageHeight={66}
        containerHeight={this.state.innerHeight}
        items={this.state.messages}
        itemKey="id"
        onRenderCell={this.renderCell}
        onEnd={this.onEnd}
      />
    )
  }

  renderCell(item: any, index: number, measure: () => void) {
    return <li key={index} style={{ listStyle: "none" }}>
      <div><span style={{ color: "red" }}>{index}</span>{item.content}</div>
      {item.image ? <img onLoad={measure} src={item.image} style={{ maxWidth: "100%" }} /> : null}
    </li>
  }

  onEnd = () => {
    fetchDataWithText().then(messages => this.setState({ messages: this.state.messages.concat(messages) }))
  }
}

render(<App />, document.getElementById("root"))
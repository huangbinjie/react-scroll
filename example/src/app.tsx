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
    fetchDataWithImageAndText().then(messages => this.setState({ messages }))
    // fetchDataWithText().then(messages => this.setState({ messages }))
  }
  render() {
    return (
      <InfiniteScroller
        bufferSize={3}
        itemAverageHeight={44}
        containerHeight={this.state.innerHeight}
        items={this.state.messages}
        itemKey="id"
        onRenderCell={this.renderCell}
        onEnd={this.onEnd}
      />
    )
  }

  renderCell = (item: any, index: number, measure: () => void) => {
    return <li key={index} style={{ listStyle: "none" }}>
      <div><span style={{ color: "red" }}>{index}</span>{item.content}</div>
      {item.image ? <img src={item.image} /> : null}
    </li>
  }

  onImageLoad = (item: any, measure: () => void) => (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = "block"
    measure()
    item.shouldRemeasure = false
  }

  onEnd = () => {
    // fetchDataWithImageAndText().then(messages => this.setState({ messages: this.state.messages.concat(messages) }))
  }
}

render(<App />, document.getElementById("root"))
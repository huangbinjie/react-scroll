import * as React from 'react'
import { render } from 'react-dom'

import { InfiniteScroller } from '../../src/scroller'

import { fetchLocalMessage, fetchData, fetchDataSync } from './api'

type State = {
  messages: { id: string, content: string }[]
}


class App extends React.Component<{}, State> {
  state: State = { messages: [] }
  componentDidMount() {
    fetchData().then(messages => this.setState({ messages }))
  }
  render() {
    return (
      <InfiniteScroller
        itemAverageHeight={22}
        containerHeight={window.innerHeight}
        items={this.state.messages}
        itemKey="id"
        onRenderCell={this.renderCell}
        onEnd={this.onEnd}
      />
    )
  }

  renderCell(item: any, index: number) {
    return <li key={index}>{item.content}<span style={{ color: "red" }}>{index}</span></li>
  }

  onEnd = () => {
    fetchData().then(messages => this.setState({ messages: this.state.messages.concat(messages) }))
  }
}

render(<App />, document.getElementById("root"))
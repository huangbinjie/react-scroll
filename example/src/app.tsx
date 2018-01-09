import * as React from 'react'
import { render } from 'react-dom'

import { InfiniteScroll } from '../../src/scroller'

import { fetchLocalMessage, fetchData, fetchDataSync } from './api'

type State = {
  messages: { id: string, content: string }[]
}


class App extends React.Component<{}, State> {
  state: State = { messages: fetchLocalMessage() }
  componentDidMount() {
    // fetchData().then(messages => this.setState({ messages }))
  }
  render() {
    return (
      <InfiniteScroll
        itemAverageHeight={22}
        containerHeight={window.innerHeight}
        items={this.state.messages}
        itemKey="id"
        onRenderCell={this.renderCell}
      />
    )
  }

  renderCell(item: any, index: number) {
    return <li key={index}>{item.content}<span style={{ color: "red" }}>{index}</span></li>
  }
}

render(<App />, document.getElementById("root"))
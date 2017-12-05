import * as React from 'react'
import { render } from 'react-dom'

import Scroll from '../../src/infinite_scroll'

import { fetchData } from './api'

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
      <Scroll averageHeight={23} items={this.state.messages} onRenderCell={this.renderCell} />
    )
  }

  renderCell(item: any, index: number) {
    return <li key={index}>{index}, {item.content}</li>
  }
}

render(<App />, document.getElementById("root"))
import * as React from 'react'
import { render } from 'react-dom'

import Scroll from '../../src/infinite_scroll'

import { fetchData } from './api'

type State = {
  lis: number[]
}

class App extends React.Component<any, State> {
  state: State = { lis: [] }
  componentDidMount() {
    fetchData().then(list => this.setState({ lis: list }))
  }
  render() {
    const lis = this.state.lis.map((n, i) => <li key={i} style={{ height: "20px", lineHeight: "20px" }}>{n}</li>)
    return (
      <div>
        <Scroll onEnd={this.onend}>{lis}</Scroll>
      </div>
    )
  }
  private onend = () => {
    fetchData().then(list => this.setState({ lis: this.state.lis.concat(list) }))
  }
}

render(<App />, document.getElementById("root"))
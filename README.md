# react-scroll
An infinite scroll container for react

## Install

```sh
npm i react-iscroller --save
```

## Example

A simple [online demo](https://huangbinjie.github.io/react-scroll/example/index.html).
check out [source code](https://github.com/huangbinjie/react-scroll/blob/master/src/infinite_scroll.tsx) for detail useage

```js
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

```

## Props

### onEnd: Function

A function that will be call when the container will update

### onClick: Function

Same as react onClick

### className: string

Same as react className

### scrollDOM?: () => Element || Document

A function return native dom then the scroll container will regist `scroll` event to it. default to `document`.

### animation?: React.ComponentClass

A react component that will show after call onEnd handle, and hide after children.length have changed


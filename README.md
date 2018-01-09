# react-iscroller

react 的无限滚动方案

## 安装

```sh
npm i react-iscroller
```

## 使用

```ts
import { InfiniteScroller } from "react-iscroller"

return <InfiniteScroller
  itemAverageHeight={22}
  containerHeight={window.innerHeight}
  items={this.state.messages}
  itemKey="id"
  onRenderCell={this.renderCell}/>
```

## props

### containerHeight(required): number

scroller 的高度

### items(required): any[]

你的数据

### itemKey(required): string

item 的 id。 使用 itemKey 帮助 react 实现 pure component。

### itemAverageHeight(required): number

如果你的 item 高度都相同那这里就填 item 的高度。如果是动态高度，尽量输入最平均的那个高度，如果还是没法确定，直接用 item 的最小高度。平均高度不影响 scroller 运行，只会影响显示数量。

### onRenderCell(required): (item: any, index: number) => ReactNode

当每条 item 渲染的时候会调用这个函数

### cache(optional): Cache[]

如果需要看到哪回到哪的功能，你必须用你的状态管理保存缓存。如果不填，不影响 scroller 正常运行。

### initialScrollTop(optional): number

再组件加载的时候滑动到 `initialScrollTop` 指定的位置。一般配合缓存滑动到上次看到的位置。如果不提供缓存也可以，但是位置是猜测的。

### onScroll(optional): (scrollerDom: HTMLDivElement) => void

滑动的时候会调用此函数，可以从这个函数里拿到 scroller 的原生 dom.

### onEnd?: () => void

滑动到底部的时候会触发此函数，可以在这里更新数据

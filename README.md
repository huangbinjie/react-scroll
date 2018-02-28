# react-iscroller

An effective react infinite scroll container. inspired by twitter's [blog](http://itsze.ro/blog/2017/04/09/infinite-list-and-react.html).

## Motivation

As the pwa(progressive web app) becoming more popular, the performance and user experience are more and more important. And infinite scroll is almost the most important part within a pwa project. But i found the results by searching `react infinite scroller` on github are not my needs. Fortunately, I found this article of [twitter](https://medium.com/@paularmstrong/twitter-lite-and-high-performance-react-progressive-web-apps-at-scale-d28a00e780a3) on medium by chance. That's i want. So I tried to implement one.

## Install

```sh
npm i react-iscroller
```

## Example

It's simple to use as follow:

```ts
import { InfiniteScroller } from "react-iscroller"

return <InfiniteScroller
  itemAverageHeight={22}
  containerHeight={window.innerHeight}
  items={this.state.messages}
  itemKey="id"
  onRenderCell={this.renderCell}/>
```

## Feature

+ hight performance
![performance](https://pic2.zhimg.com/80/v2-492eaef1b72348661339ce5d4fdaf953_hd.jpg)

+ infinite load
+ lazy load
+ dynamic height
+ [pure component](https://pic3.zhimg.com/v2-b373e12909006ba6d79d6ed1a03519f5_b.gif)

![pure_component](https://pic3.zhimg.com/v2-b373e12909006ba6d79d6ed1a03519f5_b.gif)
+ [cache](https://pic3.zhimg.com/v2-284a990951aed1f6ec0fe739e4ad983c_b.gif)

![cache](https://pic3.zhimg.com/v2-284a990951aed1f6ec0fe739e4ad983c_b.gif)
+ [resize](https://pic1.zhimg.com/v2-d7c4e657c267bc5ee99f93f1d503ed66_b.gif)

![resize](https://pic1.zhimg.com/v2-d7c4e657c267bc5ee99f93f1d503ed66_b.gif)

## Online Demo

please visite my [blog](http://www.corol.me/slack) and debug the dom, then you can see the all feature what i claimed:smile:

## Props

### containerHeight(required): number

the height of the wrapper of the infinite scroller

### className(optional): string

className attatched to scroller.

### items(required): object[]

your data

### itemKey(required): string

identity of your data. help scroller implements `pure component`.

### itemAverageHeight(required): number

As the twitter blog mentioned, averageHeight can help scroller to guesstimate the buffer height. Usually your item height.

### onRenderCell(required): (item: any, itemIndex: number, measure: () => void) => ReactNode

called when trying to render an item. if you want to force scroller to update cache(eg. after image loaded), you can call this method.

### cache(optional): Cache[]

cache the position of rendered item. your might need provide this props when you want go back to the last place.

### initialScrollTop(optional): number

set scroller's scrollTop to `initialScrollTop` after first render. if you had provied `cache` and `initialScrollTop`, your can get the last interface before unmount of scroller component.

### onScroll(optional): (scrollerDom: HTMLDivElement) => void

called when scroller is scrolling.

### onEnd?: () => void

called after anchor had arrived bottom.

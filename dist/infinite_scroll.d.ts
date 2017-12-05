/// <reference types="react" />
import * as React from 'react';
export declare type Props<T = {}> = {
    averageHeight: number;
    className?: string;
    items?: T[];
    onRenderCell?: (item?: T, index?: number) => React.ReactNode;
};
export declare type State = {
    sample: React.ReactNode[];
    uponContentPlaceholderHeight: number;
    underContentPlaceholderHeight: number;
};
export default class InifiteScroll extends React.Component<Props, State> {
    state: State;
    private uponDivPlaceholderDom;
    private divDom;
    private underDivPlaceholderDom;
    private topAnchorIndex;
    private bottomAnchorIndex;
    private shouldUpdate;
    private guestimatedItemCountPerPage;
    private cachedItemRect;
    private scrollTop;
    private anchorScrollTop;
    private scrollDirection;
    constructor(props: Props);
    componentWillReceiveProps(nextProps: Props): void;
    componentDidUpdate(): void;
    /**
     * 第一次加载空数组，为了拿到容器的dom：divDom
     * 预估显示数量
     * 根据预估数量计算出下描点位置
     */
    componentDidMount(): void;
    render(): JSX.Element;
    createChild: (item: any, index: number) => {
        new (props: {}, context?: any): {
            componentDidMount(): void;
            render(): JSX.Element;
            setState<K extends never>(f: (prevState: Readonly<{}>, props: {}) => Pick<{}, K>, callback?: () => any): void;
            setState<K extends never>(state: Pick<{}, K>, callback?: () => any): void;
            forceUpdate(callBack?: () => any): void;
            props: Readonly<{
                children?: React.ReactNode;
            }> & Readonly<{}>;
            state: Readonly<{}>;
            context: any;
            refs: {
                [key: string]: React.ReactInstance;
            };
            componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
            shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
            componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, prevContext: any): void;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        };
    };
    onScroll: () => void;
    /**
     * 投影仪
     *
     */
    project: (items: any[], averageHeight: number) => void;
}

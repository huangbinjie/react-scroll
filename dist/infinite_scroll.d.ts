/// <reference types="react" />
import * as React from 'react';
export interface Props {
    onEnd: Function;
    onClick?: () => void;
    children?: [React.ReactChildren];
    className?: string;
    sizeToLoad?: number;
    bindingDOM?: HTMLElement | Document;
    animation?: React.ComponentClass<State>;
}
export interface State {
    display: 'none' | 'block';
}
export default class InifiteScroll extends React.Component<Props, State> {
    static defaultProps: Props;
    state: State;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentWillReceiveProps(nextProps: Props): void;
    render(): JSX.Element;
    private shouldUpdate;
    private nativeDOM;
    private scrollHandle;
}

import {type ChangeEvent, Component} from 'react';
import { createRoot } from 'react-dom/client';

interface ParentProps {
}
interface ParentState {
    text: string
}
interface ChildProps {
    name: string
}
interface ChildState {
    name: string
}

class ChildComponent extends Component<ChildProps, ChildState> {
    constructor(props: ChildProps) {
        super(props);
        console.log('Child: constructor');
        this.state = { name: 'Mark' };
    }

    static getDerivedStateFromProps(props: ChildProps, state: ChildState) {
        console.log('Child: getDerivedStateFromProps', props, state);
        return null;
    }

    componentDidMount() {
        console.log('Child: componentDidMount');
    }

    shouldComponentUpdate(nextProps: ChildProps, nextState: ChildState) {
        console.log('Child: shouldComponentUpdate', nextProps, nextState);
        return true;
    }

    getSnapshotBeforeUpdate(prevProps: ChildProps, prevState: ChildState) {
        console.log('Child: getSnapshotBeforeUpdate', prevProps, prevState);
        return null;
    }

    componentDidUpdate(prevProps: ChildProps, prevState: ChildState) {
        console.log('Child: componentDidUpdate', prevProps, prevState);
    }

    componentWillUnmount() {
        console.log('Child: componentWillUnmount');
    }

    render() {
        console.log('Child: render');
        return <div>Name: {this.props.name}</div>;
    }
}

class ParentComponent extends Component<ParentProps, ParentState> {
    constructor(props: ParentProps) {
        super(props);
        console.log('Parent: constructor');
        this.state = { text: '' };
        this.onInputChange = this.onInputChange.bind(this);
    }

    componentDidMount() {
        console.log('Parent: componentDidMount');
    }

    componentWillUnmount() {
        console.log('Parent: componentWillUnmount');
    }

    onInputChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({ text: e.target.value });
    }

    render() {
        console.log('Parent: render');
        return (
            <div>
                <h2>Lifecycle demo</h2>
                <input value={this.state.text} onChange={this.onInputChange} />
                <ChildComponent name={this.state.text} />
            </div>
        );
    }
}

createRoot(document.getElementById('root')!).render(<ParentComponent />);

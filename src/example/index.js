/**
 * Created by Arnaud on 10/07/2017.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Link, Route} from 'react-router-dom';
import {TweenLite} from 'gsap';

import {TransitionSwitch, TransitionRoute} from '../';

/**
 * Example App to showcase the use of react-router-v4-transition.
 *
 * It uses gsap to animate the elements, but any other library could be used in place.
 */
class ExampleApp extends React.Component {

    render() {
        return(
            <div className="example-app">
                <nav className="example-app__menu">
                    <Link to="/">Home</Link>
                    <Link to="/aTransition">A Transition</Link>
                    <Link to="/useRender">Render</Link>
                    <Link to="/otherPath">Other Path</Link>
                    <Link to="/anotherPath">Another Path</Link>
                </nav>
                <div className="example-app__content">
                    <TransitionSwitch parallel={false}>
                        <Route exact path="/">
                            <Transition>home path</Transition>
                        </Route>
                        <Route path="/aTransition" component={ATransition}/>
                        <Route path="/useRender" render={(props) => {
                            return (
                                <Transition>use render</Transition>
                            );
                        }}/>
                        <Route path="/otherPath">
                            <Transition>other path</Transition>
                        </Route>
                        <Route path="/">
                            <Transition>other home</Transition>
                        </Route>
                        <Route path="/anotherPath">
                            <Transition>another path</Transition>
                        </Route>
                    </TransitionSwitch>
                </div>
            </div>
        );
    }
}

let d = 1;
class Transition extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillAppear(cb) {
        TweenLite.fromTo(ReactDOM.findDOMNode(this), d, {x: -100, opacity: 0}, {x: 0, opacity:1, onComplete: () => cb()});
    }

    // componentDidAppear() {
    //     //do stuff on appear
    // }

    componentWillEnter(cb) {
        TweenLite.fromTo(ReactDOM.findDOMNode(this), d, {x: 100, opacity: 0}, {x: 0, opacity:1, onComplete: () => cb()});
    }

    componentDidEnter() {
        //do stuff on enter
    }

    componentWillLeave(cb) {
        // if(this.mounted)
            TweenLite.to(ReactDOM.findDOMNode(this), d, {x: -100, opacity:0, onComplete: () => cb()});
    }

    componentDidLeave() {
        //do stuff on leave
    }

    render() {
        return (
            <div className="example-app__transition">{this.props.children}</div>
        );
    }

}

class ATransition extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillAppear(cb) {
        TweenLite.fromTo(ReactDOM.findDOMNode(this), d, {x: -100, opacity: 0}, {x: 0, opacity:1, onComplete: () => cb()});
    }

    // componentDidAppear() {
    //     //do stuff on appear
    // }

    componentWillEnter(cb) {
        TweenLite.fromTo(ReactDOM.findDOMNode(this), d, {x: 100, opacity: 0}, {x: 0, opacity:1, onComplete: () => cb()});
    }

    componentDidEnter() {
        //do stuff on enter
    }

    componentWillLeave(cb) {
        // if(this.mounted)
        TweenLite.to(ReactDOM.findDOMNode(this), d, {x: -100, opacity:0, onComplete: () => cb()});
    }

    componentDidLeave() {
        //do stuff on leave
    }

    render() {
        return (
            <div className="example-app__transition">A Transition</div>
        );
    }
}

ReactDOM.render(
    <BrowserRouter>
        <ExampleApp />
    </BrowserRouter>,
    document.getElementById('app')
);

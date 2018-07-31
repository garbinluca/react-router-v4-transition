/**
 * Created by Arnaud on 07/07/2017.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { matchPath, Route } from 'react-router';
import { diff } from 'deep-object-diff';

const routePropType = PropTypes.shape({ type: PropTypes.oneOf([Route]) });

/**
 * @class TransitionSwitch
 *
 * TransitionSwitch offers a way to get easy route transitions with
 * the router v4.
 */
export default class TransitionSwitch extends React.Component {
    static propTypes = {
        parallel: PropTypes.bool,
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(routePropType),
            routePropType,
        ]).isRequired,
    };

    static defaultProps = { parallel: false };

    static contextTypes = { router: PropTypes.shape({ route: PropTypes.object.isRequired }).isRequired };

    constructor(props, context) {
        super(props, context);

        this.enteringRouteChildRef = null;
        this.leavingRouteChildRef = null;

        this.state = {
            enteringRouteKey: null,
            leavingRouteKey: null,
            match: null,
        };
    }

    componentWillMount() {
        // We need to initialize given route properties before we mount it
        this.updateChildren(this.props, this.context);
    }

    componentDidMount() {
        if (this.enteringRouteChildRef && this.enteringRouteChildRef.componentWillAppear) {
            this.enteringRouteChildRef.componentWillAppear(() => this.enteringChildAppeared());
        } else {
            this.enteringChildAppeared();
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.updateChildren(nextProps, nextContext);
    }

    componentWillUpdate() {
        this.prevContext = { ...this.context };
    }

    componentDidUpdate(prevProps, prevState, prevContext = this.prevContext) {
        const prevLocation = this.getLocation(prevProps, prevContext);
        const location = this.getLocation(this.props, this.context);
        const prevMatch = this.getMatch(prevProps, prevContext);
        const match = this.getMatch(this.props, this.context);

        // If it's not parallel, we check if the leaving route has left and call the entering transition
        if (!this.props.parallel && this.enteringRouteChildRef && this.enteringRouteChildRef.componentWillEnter) {
            if (prevState.enteringRouteKey === this.state.enteringRouteKey && this.state.leavingRouteKey === null && prevState.leavingRouteKey != null) { this.enteringRouteChildRef.componentWillEnter(() => this.enteringChildEntered()); }
        }

        if (
            prevState.enteringRouteKey === this.state.enteringRouteKey
            && prevLocation.pathname !== location.pathname
        ) {
            const ref = this.enteringRouteChildRef;
            if (ref.sameComponentWillLeave) {
                ref.sameComponentWillLeave();
            }
            if (ref.sameComponentDidLeave) {
                ref.sameComponentDidLeave();
            }
            if (ref.sameComponentWillEnter) {
                ref.sameComponentWillEnter();
            }
            if (ref.sameComponentDidEnter) {
                ref.sameComponentDidEnter();
            }
        }

        // If the location didn't change we do nothing and let the eventual active transitions run
        if (prevLocation.pathname === location.pathname && prevMatch.isExact === match.isExact) { return; }

        if (this.state.enteringRouteKey && this.enteringRouteChildRef && this.enteringRouteChildRef.componentWillEnter) {
            if (this.props.parallel) {
                this.enteringRouteChildRef.componentWillEnter(() => this.enteringChildEntered());
            }
        } else {
            this.enteringChildEntered();
        }

        // If there's a ref and there wasn't a leaving route in the previous state
        if (this.leavingRouteChildRef && this.leavingRouteChildRef.componentWillLeave) {
            if (this.leavingRouteChildRef && (!prevState.leavingRouteKey || this.props.parallel)) {
                this.leavingRouteChildRef.componentWillLeave(() => this.leavingChildLeaved());
            }
        } else {
            this.leavingChildLeaved();
        }
    }

    /**
     * Update internal state of the children to render
     *
     * props and context must be given, because it may mostly be called before the render method,
     * therefore we need to access props and context before they are applied and can't refer to this.
     *
     * @param props props object to use for the update
     * @param context context object to use for the update ( eg: router info )
     */
    updateChildren(nextProps, nextContext) {
        let found = false;

        React.Children.map(nextProps.children, child => child).forEach((child) => {

            const pathData = {
                path: child.props.path,
                exact: child.props.exact,
                strict: child.props.strict,
            };

            const location = this.getLocation(nextProps, nextContext);

            const match = matchPath(location.pathname, pathData);

            if (!found && match) {
                found = true;

                // In case it's the current child we do nothing
                if (this.state.enteringRouteKey) {

                    const existsParamsDiff = Object.keys(diff(this.state.match.params, match.params)).length > 0;
                    if (this.state.enteringRouteKey === child.key) {
                        if (existsParamsDiff) {
                            this.setState({ match });
                        }
                        return false;
                    }
                }

                // If it's not parallel, it would happen when a route change occurs while transitioning.
                // In that case we keep the original leaving element, and we just replace the entering element
                if (!this.state.leavingRouteKey || this.props.parallel) {

                    this.leavingRouteChildRef = this.enteringRouteChildRef;
                    this.enteringRouteChildRef = null;

                }

                this.setState({
                    leavingRouteKey: this.state.enteringRouteKey, // this.state.leavingRouteKey && !this.props.parallel ? this.state.leavingRouteKey : this.state.enteringRouteKey
                    enteringRouteKey: child.key,
                    match,
                    leaveMatch: this.state.match
                });
            }

            return false;
        });


        // In case we didn't find a match, the enteringChild will leave:
        if (!found && this.state.enteringRouteKey) {

            this.leavingRouteChildRef = this.enteringRouteChildRef;
            this.enteringRouteChildRef = null;

            this.setState({
                leavingRouteKey: this.state.enteringRouteKey,
                enteringRouteKey: null,
                match: null,
            });

        }

    }

    /* eslint-disable */
    getLocation(props, context) {
        return context.router.route.location;
    }

    getMatch(props, context) {
        return context.router.route.match;
    }
    /* eslint-enable */

    enteringChildAppeared() {
        if (this.enteringRouteChildRef && this.enteringRouteChildRef.componentDidAppear) { this.enteringRouteChildRef.componentDidAppear(); }
    }

    enteringChildEntered() {
        if (this.enteringRouteChildRef && this.enteringRouteChildRef.componentDidEnter) { this.enteringRouteChildRef.componentDidEnter(); }
    }

    leavingChildLeaved() {
        if (this.leavingRouteChildRef && this.leavingRouteChildRef.componentDidLeave) { this.leavingRouteChildRef.componentDidLeave(); }

        this.leavingRouteChildRef = null;
        this.setState({ leavingRouteKey: null });
    }

    render() {
        let enteringChild = null;
        let leavingChild = null;

        const props = {
            match: this.state.match,
            location: this.getLocation(this.props, this.context),
            history: this.context.router.history,
            staticContext: this.context.router.staticContext,
        };

        const leaveProps = {
            match: this.state.leaveMatch,
            location: this.getLocation(this.props, this.context),
            history: this.context.router.history,
            staticContext: this.context.router.staticContext,
        };


        React.Children.map(this.props.children, child => child).forEach((child) => {
            if (child.key === this.state.enteringRouteKey) {
                let component = null;

                if (child.props.component) { component = React.createElement(child.props.component); } else if (child.props.render) { component = child.props.render(props); } else { component = child.props.children; }

                enteringChild = React.cloneElement(component, {
                    ref: (ref) => {
                        if (ref) { this.enteringRouteChildRef = ref; }
                    },
                    key: `child-${child.key}`,
                    ...props,
                });

            } else if (child.key === this.state.leavingRouteKey) {

                let component = null;

                if (child.props.component) { component = React.createElement(child.props.component); } else if (child.props.render) { component = child.props.render(leaveProps); } else { component = child.props.children; }

                leavingChild = React.cloneElement(component, {
                    ref: (ref) => {
                        if (ref) { this.leavingRouteChildRef = ref; }
                    },
                    key: `child-${child.key}`,
                    ...leaveProps,
                });
            }
        });

        // If it's not parallel, we only render the enteringRoute when the leavingRoute did leave
        if (!this.props.parallel) {
            if (this.state.leavingRouteKey) { enteringChild = null; }
        }

        return (
            <div>
                {enteringChild}
                {leavingChild}
            </div>
        );
    }
}
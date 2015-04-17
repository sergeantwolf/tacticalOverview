'use strict';

let React = require('react/addons'),
    ReactTransitionGroup = React.addons.CSSTransitionGroup,
    Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;

import RiftMap from './map/RiftMap.js';
import MatchPicker from './ui/MatchPicker.js';

class TacticalOverviewApp extends React.Component {
    render() {
        return (
            <ReactTransitionGroup transitionName='fade'>
                <nav className="teal">
                    <div className="container">
                        <div className="nav-wrapper">
                            <a href="#" className="brand-logo">Tactical Overview</a>
                            <ul id="nav-mobile" className="right hide-on-med-and-down">
                                {/* I'll skip 'active' functionality, it is included in Link element, but Materialize expects 'active' on li level */}
                                <li><Link to="matchPicker">Match Picker</Link></li>
                                <li><Link to="riftMap" params={{matchId: 0}}>Rift Map</Link></li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <div className="container">
                    <RouteHandler {...this.props}></RouteHandler>
                </div>
            </ReactTransitionGroup>
        );
    }
}

export default TacticalOverviewApp;

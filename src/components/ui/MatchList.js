/**
 * Created by sergeant on 4/12/2015.
 */
'use strict';

let React = require('react/addons'),
    ReactTransitionGroup = React.addons.CSSTransitionGroup,
    Bacon = require('baconjs');

import ApiClient from 'classes/ApiClient';
import Match from 'classes/Match';
import MatchLink from 'components/ui/MatchLink';

class MatchList extends React.Component {

    constructor() {
        super();
        this.state = {
            matches: [
                1133869769
            ]
        };
    }

    componentDidMount() {
        this.unsubscribe = this.props.matchBlock
            .flatMap(matchBlock => ApiClient.loadChallengeApiGames(matchBlock).flatMap(Bacon.fromPromise))
            .onValue(matches => this.setState({matches}));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        return <ul className="collection">
                <ReactTransitionGroup transitionName='shift'>
                    {this.state.matches.map(matchId =>
                        <li className="collection-item" key={matchId}>
                            <MatchLink id={matchId}></MatchLink>
                        </li>
                    )}
                </ReactTransitionGroup>
        </ul>;
    }
}
MatchList.propTypes = {
    matchBlock: React.PropTypes.instanceOf(Bacon.Property).isRequired
};

export default MatchList;

/**
 * Created by sergeant on 4/2/2015.
 */
'use strict';

let React = require('react'),
    Bacon = require('baconjs'),
    moment = require('moment'),
    _ = require('lodash'),
    Link = require('react-router').Link;

import ApiClient from 'classes/ApiClient';
import Match from 'classes/Match';
import ChampionIcon from 'components/league/ChampionIcon';

class MatchLink extends React.Component {

    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        ApiClient.loadMatch(this.props.id)
            .flatMap(Bacon.fromPromise)
            .onValue(matchJson => this.setState({match: new Match(matchJson)}));
    }

    clickHandler() {
        this.props.onMatchSelected(this.props.id);
    }

    render() {
        let matchDescription;
        if (this.state.match) {
            matchDescription = <div>
                <div className="row">
                    {moment(this.state.match.creationTimestamp, 'x').format('D MMM hh:mm')} {this.state.match.typeLabel} for {moment.duration(this.state.match.duration, 'seconds').humanize()}
                    <Link className="right" to="riftMap" params={{matchId: this.state.match.id}}>Show Match</Link>
                </div>
                <div className="row">
                    {_.filter(this.state.match.participants, {teamId: 100}).map(participant =>
                        <div key={participant.participantId} className="col s1 blue lighten-4">
                            <ChampionIcon id={participant.championId}></ChampionIcon>
                        </div>)}
                    <div className="col s1">versus</div>
                    {_.filter(this.state.match.participants, {teamId: 200}).map(participant =>
                        <div key={participant.participantId} className="col s1 red lighten-4">
                            <ChampionIcon id={participant.championId}></ChampionIcon>
                        </div>)}
                </div>
            </div>;
        } else {
            matchDescription = <div className="progress">
                <div className="indeterminate"></div>
            </div>;
        }
        return <div>
            {matchDescription}
        </div>;
    }
}
MatchLink.propTypes = {
    id: React.PropTypes.number.isRequired
};


export default MatchLink;

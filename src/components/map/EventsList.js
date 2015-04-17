'use strict';

let React = require('react/addons'),
    ReactTransitionGroup = React.addons.CSSTransitionGroup,
    moment = require('moment'),
    _ = require('lodash');

import Images from 'classes/Images';
import ChampionIcon from 'components/league/ChampionIcon';

const laneTypeNaming = {
    BOT_LANE: 'bot',
    MID_LANE: 'mid',
    TOP_LANE: 'top'
};
const buildingTypeNaming = {
    INHIBITOR_BUILDING: 'inhibitor',
    TOWER_BUILDING: 'tower'
};
const towerTypeNaming = {
    BASE_TURRET: 'base',
    FOUNTAIN_TURRET: 'fountain',
    INNER_TURRET: 'inner',
    NEXUS_TURRET: 'nexus',
    OUTER_TURRET: 'outer',
    UNDEFINED_TURRET: ''
};
const markersShowTimeOffset = 60000;

export default class EventsList extends React.Component {

    constructor() {
        super();
        this.state = {
            events: []
        };
    }

    componentDidMount() {
        this.props.timeStream
            .onValue(this.onTimeChange.bind(this));
    }

    onTimeChange(timestamp) {
        this.props.events.forEach(eventData => eventData.marker.setOpacity(0));
        let filteredEvents = _(this.props.events)
            .takeWhile(eventData => eventData.event.timestamp <= timestamp)
            .sortBy('event.timestamp')
            .reverse()
            .value();
            _.takeWhile(filteredEvents, eventData => eventData.event.timestamp >= timestamp - markersShowTimeOffset)
                .forEach(eventData => eventData.marker.setOpacity(1));
        this.setState({events: filteredEvents});
    }

    onEventClick(eventData) {
        if (!eventData.marker.getPopup()) {
            eventData.marker.bindPopup("This happened here");
        }
        eventData.marker.togglePopup();
    }

    renderEventDescription(event) {
        switch (event.eventType) {
            case 'ELITE_MONSTER_KILL':
                return <span>
                    {(event.assistingParticipantIds || []).map(assistingParticipantId =>
                        <img key={assistingParticipantId} className="assistIcon"
                             src={this.props.mapApi.getParticipantChampionIcon(assistingParticipantId)}/>)}
                    <ChampionIcon id={this.props.mapApi.getParticipantChampionId(event.killerId)}
                                  teamId={this.props.mapApi.getParticipantTeam(event.killerId)}></ChampionIcon>
                    <img className="fightIcon" src={Images.getFightIcon()}/>
                    <img className="killerIcon" src={Images.getMonsterIcon(event.monsterType)}/>
                </span>;
            case 'CHAMPION_KILL':
                let killerId = this.props.mapApi.getParticipantChampionId(event.killerId),
                    killerIcon = killerId>0?
                        <ChampionIcon id={this.props.mapApi.getParticipantChampionId(event.killerId)}
                                      teamId={this.props.mapApi.getParticipantTeam(event.killerId)}></ChampionIcon>:
                        <img className="killerIcon" src={Images.getMinionProfileIcon()}/>,
                    victimIcon = <ChampionIcon id={this.props.mapApi.getParticipantChampionId(event.victimId)}
                                               teamId={this.props.mapApi.getParticipantTeam(event.victimId)}></ChampionIcon>;
                return <span>
                            {(event.assistingParticipantIds || []).map(assistingParticipantId =>
                                <img key={assistingParticipantId} className="assistIcon"
                                     src={this.props.mapApi.getParticipantChampionIcon(assistingParticipantId)}/>)}
                            {killerIcon}
                                <img className="fightIcon" src={Images.getFightIcon()}/>
                            {victimIcon}
                        </span>;
            case 'BUILDING_KILL':
                let destroyerId = this.props.mapApi.getParticipantChampionId(event.killerId),
                    destroyerIcon = destroyerId>0?
                        <ChampionIcon id={this.props.mapApi.getParticipantChampionId(event.killerId)}
                                      teamId={this.props.mapApi.getParticipantTeam(event.killerId)}></ChampionIcon>:
                        <img className="killerIcon" src={Images.getMinionProfileIcon()}/>,
                    victimDescription = EventsList.getBuildingDescription(event);
                return <span>
                            {(event.assistingParticipantIds || []).map(assistingParticipantId =>
                                <img key={assistingParticipantId} width="24"
                                     src={this.props.mapApi.getParticipantChampionIcon(assistingParticipantId)}/>)}
                        {destroyerIcon}
                        <img className="fightIcon" src={Images.getFightIcon()}/>
                        {victimDescription}
                        </span>;
            default:
                return event.eventType;
        }
    }

    static getBuildingDescription(event) {
        return `${laneTypeNaming[event.laneType]} ${towerTypeNaming[event.towerType]} ${buildingTypeNaming[event.buildingType]}`;
    }

    render() {
        /**
         * Originally I had <ReactTransitionGroup transitionName='shift'></ReactTransitionGroup> wrapping the contents
         * of "ul" to add nice sliding out effect, but it proved to add too much lag for the browser for high speed
         * playback, so I removed it
         */
        return <div className="eventsList">
            <ul className="collection">
                    {this.state.events.map((eventData, index) => {
                        let duration = moment.duration(eventData.event.timestamp);
                        //added position to key since timestamp might be not unique
                        return <li className="collection-item row blue-grey darken-1" key={`${eventData.event.timestamp}${eventData.event.position.x}${eventData.event.position.y}`}>
                            <span className="col s2">
                                <a className="btn-floating waves-effect waves-light red" onClick={_.partial(this.onEventClick, eventData).bind(this)}><i className="mdi-action-search"></i></a></span>
                            <span className="col s2 white-text">
                                {Math.floor(duration.asMinutes())}:{_.padLeft(duration.seconds(), 2, '0')}
                            </span>
                            <span className="col s8 white-text">{this.renderEventDescription(eventData.event)}</span>
                        </li>;
                    })}
            </ul>
        </div>;
    }

}

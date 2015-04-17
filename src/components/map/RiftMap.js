'use strict';

const minLatitude = -85.0511;
const minLongtitude = -180;
const maxLatitude = 40;
const maxLongtitude = 88;
//adjusted box of leaflet map loosely matching converted API coordinates box
const minMapX = 1064;
const minMapY = 7177;
const maxMapX = 11614;
const maxMapY = 15953;
//actual box of leaflet map
//const minMapX = 0;
//const minMapY = 6202;
//const maxMapX = 12196;
//const maxMapY = 16383;
//original in-game coordinates box, based on https://developer.riotgames.com/docs/game-constants (Current Summoner's Rift)
const originalMinMapX = 0;
const originalMinMapY = 0;
const originalMaxMapX = 14820;
const originalMaxMapY = 14881;
const minZoom = 2;
const maxZoom = 6;

let React = require('react'),
    Bacon = require('baconjs'),
    _ = require('lodash'),
    moment = require('moment');


require('leaflet/dist/leaflet.css');
require('leaflet/dist/leaflet.js');

import ApiClient from 'classes/ApiClient';
import Images from 'classes/Images';
import Match from 'classes/Match';
import TimeLine from 'components/map/TimeLine';
import EventsList from 'components/map/EventsList';

class RiftMap extends React.Component {
    constructor() {
        super();
        this.timeLineBounds = new Bacon.Bus();
        this.timeBus = new Bacon.Bus();
        /**
         * participantId => {PositionTimeLine timeLine, marker}
         * this 'new Map()' value is here only for the sake of not having a check for undefined in onTimeLineChange
         * original idea was to reuse the instance throughout multiple matches, but later on I decided to use reactRouter
         * thus instantiating map each time for a match view
         * @type {Map}
         */
        this.participantsPositioningMap = new Map();
        /**
         * Sorted by timestamp array of all events with position from match with markers. [{event, marker}...]
         * @type {Array}
         */
        this.state = {
            positionedEvents: []
        };
        this.mapApi = {
            getParticipantTeam: participantId => this.participantsPositioningMap.has(participantId)?
                this.participantsPositioningMap.get(participantId).timeLine.participantTeam:null,
            getParticipantChampionId: participantId => this.participantsPositioningMap.has(participantId)?
                this.participantsPositioningMap.get(participantId).timeLine.champion.id:null,
            getParticipantChampionIcon: participantId => this.participantsPositioningMap.has(participantId)?
                this.participantsPositioningMap.get(participantId).timeLine.champion.squareIcon:''
        };
    }

    componentDidMount() {
        let maxBounds = L.latLngBounds(
            L.latLng(minLatitude, minLongtitude),
            L.latLng(maxLatitude, maxLongtitude)
        );
        let map = this.map = L.map(React.findDOMNode(this).querySelector('.map'), {
            maxBounds: maxBounds,
            minZoom: minZoom,
            maxZoom: maxZoom,
            layers: [
                L.tileLayer('http://promo.na.leagueoflegends.com/sru-map-assets/{z}/{x}/{y}.png', {
                    tms: true,
                    noWrap: true,
                    animate: true,
                    unloadInvisibleTiles: false,
                    bounds: maxBounds
                })
            ],
            attributionControl: false
        });

        map.fitBounds(maxBounds);
        //console.log('map projection SW', map.project(L.latLng(minLatitude, minLongtitude), maxZoom));
        //console.log('map projection NE', map.project(L.latLng(maxLatitude, maxLongtitude), maxZoom));
        if (this.props.params.matchId > 0) {
            ApiClient.loadMatch(this.props.params.matchId, true)
                .flatMap(Bacon.fromPromise)
                .onValue(matchJson => this.drawTimeLine(new Match(matchJson)));
        }
    }

    componentWillUnmount() {
        this.map = null;
        this.timeLineBounds.end();
    }

    /**
     *
     * @param {Match} match
     */
    drawTimeLine(match) {
        //console.log(`drawing timeline for match ${match.id}`);
        let positionedEvents = match.getAllPositionedEvents(),
            skillLvlUpTimelineMap = match.getParticipantSkillLvlUpTimelineMap();
        Bacon.fromArray(match.participants)
        /**
         * using flatMap because getParticipantPositionsTimeLine returns EventStream.
         */
            .flatMap(participant => match.getParticipantPositionsTimeLine(participant.participantId))
            .map(positionTimeLine => this.addChampionMarker(positionTimeLine))
            .fold(new Map(), (map, data) => map.set(data.timeLine.participantId, data))
            .map(dataMap => this.enrichPositionTimeLinesWithEvents(dataMap, positionedEvents, skillLvlUpTimelineMap))
            .onValue(this.bindPositioningDataToMap.bind(this));
        this.timeLineBounds.push(match.timeLineBounds);
        this.bindPositionedEvents(positionedEvents);
    }

    /**
     * called from TimeLine component. Can be swapped with timeBus.onValue, pushing bus in component, no big difference though
     * @param newTime
     */
    onTimeLineChange(newTime) {
        //console.log('timeLine change to', newTime);
        this.timeBus.push(newTime);
        //couldn't combine desctructuring with arrow function, babel fails to parse it.. oh, well..
        Array.from(this.participantsPositioningMap.values()).forEach(function({timeLine, marker}) {
            marker.setLatLng(this.coordinatesToGeo(RiftMap.translateCoordinatesToUIMap(timeLine.getPosition(newTime))));
        }.bind(this));
    }

    /**
     * creates map marker for champion in the timeline and returns combined object {timeLine, marker}
     * @param positionTimeLine
     */
    addChampionMarker(positionTimeLine) {
        //console.log('create position timeline marker', positionTimeLine.champion.name, positionTimeLine, positionTimeLine.positions[0]);
        let marker = L.marker(this.coordinatesToGeo(RiftMap.translateCoordinatesToUIMap(positionTimeLine.positions[0].position)), {
            icon: L.icon({
                iconUrl: positionTimeLine.champion.squareIcon,
                iconSize: [40,40],
                className: `team${positionTimeLine.participantTeam}Border`
            }),
            title: positionTimeLine.champion.name
        });
        return {
            timeLine: positionTimeLine,
            marker: marker
        };
    }

    bindPositionedEvents(positionedEvents) {
        //console.log('bind positioned events', positionedEvents);
        this.setState({positionedEvents : _.sortBy(positionedEvents, 'timestamp')
            .map(event => {
                let marker = L.marker(this.coordinatesToGeo(RiftMap.translateCoordinatesToUIMap(event.position)), {
                    clickable: false,
                    icon: L.icon({
                        iconUrl: Images.getEventIcon(event.eventType),
                        iconSize: event.eventType==='BUILDING_KILL'?[24,24]:[32,32]
                    }),
                    opacity: 0
                });
                marker.addTo(this.map);
                return {event,marker};
        })
        });
    }

    enrichPositionTimeLinesWithEvents(dataMap, positionedEvents, skillLvlUpMap) {
        //console.log('enrichPositionTimeLinesWithEvents');
        positionedEvents.forEach(function({timestamp, position, killerId, victimId, assistingParticipantIds}) {
            (assistingParticipantIds || [])
                .concat(killerId, victimId)
                .filter(participantId => !!participantId) //skipping undefined and special participant #0
                .forEach(participantId => dataMap
                    .get(participantId)
                    .timeLine.positions.push({timestamp, position}));
            //sending victim to his zero position while he is dead
            if (victimId > 0) {
                let timeLine = dataMap.get(victimId).timeLine,
                    deathTimeStart = timestamp + 1,
                    deathTimeEnd = timestamp +
                        RiftMap.calculateTimeDead(skillLvlUpMap.getExpectedLvlOfParticipant(victimId, timestamp), timestamp);
                timeLine.positions.push({timestamp: deathTimeStart, position: timeLine.positions[0].position, deathStart: true});
                timeLine.positions.push({timestamp: deathTimeEnd, position: timeLine.positions[0].position, deathEnd: true});

            }
        }.bind(this));
        /**
         * we need to delete possibly existing positions in between of death markers, they can appear in case someone
         * died and the kill was scored by the person already dead
         * then we sort the resulted positions array by timestamp
         */
        Array.from(dataMap.values())
            .forEach(participantTimeLine => {
                participantTimeLine.timeLine.positions = _.sortBy(participantTimeLine.timeLine.positions, 'timestamp');
                participantTimeLine.timeLine.positions = _.foldl(participantTimeLine.timeLine.positions, (accumulator, position) => {
                    if (accumulator.accept || position.deathStart || position.deathEnd) {
                        accumulator.result.push(position);
                    }
                    if (position.deathStart) {
                        accumulator.accept = false;
                    }
                    if (position.deathEnd) {
                        accumulator.accept = true;
                    }
                    return accumulator;
                }, {result: [], accept: true}).result;
                //console.log('participant timeLine', participantTimeLine.timeLine.participantId, participantTimeLine);
            });
        return dataMap;
    }

    bindPositioningDataToMap(dataMap) {
        this.participantsPositioningMap = dataMap;
        Array.from(dataMap.values())
            .forEach(data => data.marker.addTo(this.map));
    }

    /**
     * using LolWiki formula to calculate approximate time being dead
     * I am not so sure it is absolutely correct, but that should be good enough
     * @param {number} level
     * @param {number} timestamp milliseconds
     * @returns {number} milliseconds
     */
    static calculateTimeDead(level, timestamp) {
        let baseTime = level*2.5 + 5,
            minutesPassed = Math.floor(moment.duration(timestamp).asMinutes());
        return Math.floor(1000*(minutesPassed <= 25?baseTime:(baseTime + (baseTime/50)*(minutesPassed - 25))));
    }

    static turnGameCoordinatesByYAxis(coordinates) {
        return {
            y: originalMaxMapY - coordinates.y,
            x: coordinates.x
        };
    }

    static turnUICoordinatesByYAxis(coordinates) {
        return {
            y: maxMapY - coordinates.y + minMapY,
            x: coordinates.x
        };
    }

    static translateCoordinatesToUIMap(coordinates) {
        coordinates = RiftMap.turnGameCoordinatesByYAxis(coordinates);
        let newCoords = {
            y: minMapY + ((coordinates.y - originalMinMapY)/(originalMaxMapY-originalMinMapY))*(maxMapY - minMapY),
            x: minMapX + ((coordinates.x - originalMinMapX)/(originalMaxMapX-originalMinMapX))*(maxMapX - minMapX)
        };
        //console.log('translate game -> ui', coordinates, newCoords);
        return newCoords;
    }

    static translateUICoordinatesToGameMap(coordinates) {
        let newCoords = {
            y: coordinates.y,//originalMinMapY + ((coordinates.y - minMapY)/(maxMapY-minMapY))*(originalMaxMapY - originalMinMapY),
            x: coordinates.x//originalMinMapX + ((coordinates.x - minMapX)/(maxMapX-minMapX))*(originalMaxMapX - originalMinMapX)
        };
        newCoords = RiftMap.turnUICoordinatesByYAxis(newCoords);
        //console.log('translate ui -> game', coordinates, newCoords);
        return newCoords;
    }

    coordinatesToGeo(coordinates) {
        let geo = this.map.unproject(L.point(coordinates.x,coordinates.y), maxZoom);
        //console.log('coords to geo', coordinates, geo);
        return geo;
    }

    geoToCoordinates(geo) {
        return this.map.project(geo, maxZoom);
    }

    render() {
        return (
            <div>
                <div className="row">
                    <TimeLine onChange={this.onTimeLineChange.bind(this)} timeLineBounds={this.timeLineBounds} ></TimeLine>
                </div>
                <div className="row">
                    <div className="col s4">
                        <EventsList
                            timeStream={this.timeBus.toProperty(0)}
                            events={this.state.positionedEvents}
                            mapApi={this.mapApi}></EventsList>
                    </div>
                    <div className="col s8">
                        <div className='map'></div>
                    </div>
                </div>
            </div>
            );
    }
}

export default RiftMap;

/**
 * Created by sergeant on 4/2/2015.
 */
'use strict';

let _ = require('lodash');

import Champion from './Champion';
import ChampionStorage from './ChampionStorage';
import PositionTimeLine from './PositionTimeLine';
import SkillLvlUpTimelineMap from './SkillLvlUpTimelineMap';

class Match {

    constructor(json) {
        this.json = json;
    }

    get id() {
        return this.json.matchId;
    }

    get timeLineBounds() {
        return {
            create: this.json.matchCreation,
            start: 0,
            end: this.json.matchDuration * 1000
        };
    }

    get participants() {
        return this.json.participants;
    }

    get typeLabel() {
        //TODO elaborate labels if time allows
        return this.json.queueType;
    }

    get creationTimestamp() {
        return this.json.matchCreation;
    }

    get duration() {
        return this.json.matchDuration;
    }

    getParticipantTeam(participantId) {
        return _.find(this.json.participants, {participantId}).teamId;
    }

    getParticipantPositionsTimeLine(index) {
        let participant = _.find(this.json.participants, {participantId :index});
        return ChampionStorage
            .getChampionData(participant.championId)
            .map(championData => new PositionTimeLine(new Champion(championData),
                this.json.timeline.frames
                    .map(frame => {
                        return {
                            timestamp: frame.timestamp,
                            position: frame.participantFrames[index].position
                        };
                    }),
                participant
            ));
    }

    getParticipantSkillLvlUpTimelineMap() {
        let map = _(this.json.timeline.frames)
            .map(frame => _.filter(frame.events, {eventType: 'SKILL_LEVEL_UP'}))
            .flatten()
            .foldl(
                (map, event) => {map.get(event.participantId).push(event); return map;},
                new SkillLvlUpTimelineMap(_.range(1,11).map(index => [index, []]))
            );
        Array.from(map.keys()).forEach(key => map.set(key, _.sortBy(map.get(key), 'timestamp')));
        return map;
    }

    getAllPositionedEvents() {
        return _(this.json.timeline.frames)
            .map(frame => _.filter(frame.events, 'position'))
            .reduce((arr, items) => {arr.push(...items); return arr;}, []);
    }
}

export default Match;

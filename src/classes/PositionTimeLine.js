'use strict';

let _ = require('lodash');

export default class PositionTimeLine {

    constructor(champion, positions, participant) {
        this.champion = champion;
        this.positions = positions;
        this.participant = participant;
    }

    get participantId() {
        return this.participant.participantId;
    }

    get participantTeam() {
        return this.participant.teamId;
    }

    /**
     * returns linearly scaled position based on timeStamp off of 2 closest known points
     * last participant timeFrame does not contain position for some reason (champions do not exist after game is
     * finished?), so in that case summoning platform is taken (position at time 0). Not much I can do here :(
     * @param {Number} timeStamp
     */
    getPosition(timeStamp) {
        let nextPoint = _.find(this.positions, position => position.timestamp > timeStamp),
            previousPoint = _.findLast(this.positions, position => position.timestamp <= timeStamp);
        //console.log('looking for closest points for time', timeStamp, 'found', previousPoint, nextPoint);
        if (previousPoint.timestamp === timeStamp) {
            return previousPoint.position;
        }
        if (nextPoint.position === undefined) {
            nextPoint = this.positions[0];
        }
        let coefficient = (timeStamp - previousPoint.timestamp)/(nextPoint.timestamp - previousPoint.timestamp),
        coordinates = {
            x: previousPoint.position.x + coefficient*(nextPoint.position.x - previousPoint.position.x),
            y: previousPoint.position.y + coefficient*(nextPoint.position.y - previousPoint.position.y)
        };
        //console.log('coordinates are', coordinates);
        return coordinates;
    }
}

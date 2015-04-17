'use strict';

let _ = require('lodash');

/**
 * Used to calculate approximate lvl of participant at a moment of time based on skill lvl ups done
 */
class SkillLvlUpTimelineMap extends Map {

    getExpectedLvlOfParticipant(participantId, timestamp) {
        return _.takeWhile(this.get(participantId), position => position.timestamp <= timestamp).length;
    }

}

export default SkillLvlUpTimelineMap;

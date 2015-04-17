'use strict';

require('babel-core/polyfill');

import Match from 'classes/Match.js';

describe('Match test', function () {
    const singleMatchJson = require('json!json/match.json');

    let someMatch;

    beforeEach(function () {
        someMatch = new Match(singleMatchJson);
    });

    it('should create a match object', function () {
        expect(someMatch).toBeDefined();
    });

    it('should be able to extract timeline for a participant', () => {
        expect(someMatch.getParticipantPositionsTimeLine(1)).toBeDefined();
    });

    it('should be able to extract skill lvl ups timelines', () => {
        let timeLineMap = someMatch.getParticipantSkillLvlUpTimelineMap();
        expect(timeLineMap).toBeDefined();
        expect(timeLineMap instanceof Map).toBeTruthy();
        expect(Array.from(timeLineMap.keys()).length).toBe(10);
        for (let arr of timeLineMap.values()) {
            expect(arr instanceof Array).toBeTruthy();
        }
    });
});

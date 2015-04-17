'use strict';

import ChampionStorage from 'classes/ChampionStorage.js';

describe('ChampionStorage test', function () {

    beforeEach(function () {
    });

    it('should create a ChampionStorage object', function () {
        expect(ChampionStorage).toBeDefined();
    });

    it('should be able to request a champion', () => {
        expect(ChampionStorage.getChampionData(24)).toBeDefined();
        ChampionStorage.getChampionData(24).onValue(data => {
            expect(data).toBeDefined();
        });
    });
});

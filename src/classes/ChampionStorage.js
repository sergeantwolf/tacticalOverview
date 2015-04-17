'use strict';

let Bacon = require('baconjs');

import ApiClient from './ApiClient.js';

class ChampionStorage {

    constructor() {
        this.dataMap = new Map();
    }

    getChampionData(id) {
        if (!this.dataMap.has(id)) {
            this.requestChampionData(id);
        }
        return this.dataMap.get(id);
    }

    requestChampionData(id) {
        /**
         * hardcoding 'image' champData request since it is the only that is needed by this app
         * In case further data is required, ChampionStorage object should be improved to the state of handling
         * cache effectively depending on data requested
         */
        this.dataMap.set(id, Bacon.fromPromise(ApiClient.loadChampionData(id, 'image')).toProperty());
    }

}

export default new ChampionStorage();

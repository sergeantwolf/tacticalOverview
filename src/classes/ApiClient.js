/**
 * Created by sergeant on 4/13/2015.
 */
'use strict';

let Bacon = require('baconjs');

const config = require('json!../../config.json');
const apiUrl = config.apiUrl;
const staticDataPrefix = config.staticDataPrefix;
const matchApiUrl = config.matchApiUrl;
const championApiUrl = config.championApiUrl;
const challengeApiUrl = config.challengeApiUrl;
const serviceThrottling = config.serviceThrottling;

class ApiClient {

    constructor({region, apiKey}) {
        this.region = region;
        this.apiKey = apiKey;
        this.queue = [];
        this.throttlingStream = undefined;
    }

    /**
     * throttling getJSON calls with serviceThrottling interval
     */
    doGetJSON() {
        let observable = Bacon.fromCallback(callBack => this.queue.push({arguments, callBack}));
        if (this.throttlingStream === undefined) {
            this.throttlingStream = Bacon.sequentially(serviceThrottling, this.queue);
            this.throttlingStream.onValue(options => {
                options.callBack($.getJSON.apply(this, options.arguments));
            });
            this.throttlingStream.onEnd(() => {
                this.throttlingStream = undefined;
                this.queue = [];
            });
        }
        return observable;
    }

    static getMatchApiUrl(region, id) {
        return `${apiUrl}${region}${matchApiUrl}${id}`;
    }

    /**
     * @param {number} id
     * @param {boolean} includeTimeline
     * @returns {Bacon.Observable}
     */
    loadMatch(id, includeTimeline = false) {
        return this.doGetJSON(ApiClient.getMatchApiUrl(this.region, id), {includeTimeline, api_key: this.apiKey});
    }

    getChampionDataApiUrl(id) {
        return `${apiUrl}${staticDataPrefix}${this.region}${championApiUrl}${id}`;
    }

    /**
     * @param {number} id
     * @param {string} champData
     * @returns {Bacon.Observable}
     */
    loadChampionData(id, champData) {
        //not throttling this call since it is a static data call
        return $.getJSON(this.getChampionDataApiUrl(id), {api_key: this.apiKey, champData});
    }

    getChallengeApiUrl() {
        return `${apiUrl}${this.region}${challengeApiUrl}`;
    }

    /**
     *
     * @param {number} timestamp
     * @returns {Bacon.Observable}
     */
    loadChallengeApiGames(timestamp) {
        return this.doGetJSON(this.getChallengeApiUrl(), {api_key: this.apiKey, beginDate: timestamp});
    }
}

export default new ApiClient({region: config.apiRegion, apiKey: config.apiKey});

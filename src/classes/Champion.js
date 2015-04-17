'use strict';

import Images from './Images.js';

class Champion {

    constructor(json) {
        this.json = json;
    }

    get id() {
        return this.json.id;
    }

    get key() {
        return this.json.key;
    }

    get name() {
        return this.json.name;
    }

    get title() {
        return this.json.title;
    }

    get fullName() {
        return `${this.name}, ${this.title}`;
    }

    get skins() {
        return this.json.skins;
    }

    get squareIcon() {
        return `${Images.getChampionSquareIconPrefix()}${this.key}.png`;
    }

    getLoadingImageUrl(skin = 0) {
        return `${Images.getChampionLoadingPrefix()}${this.key}_${skin}.jpg`;
    }

    getIconStyle() {
        return {
            backgroundImage    :  `url("${Images.getSpritePrefix()}${this.json.image.sprite}")`,
            backgroundPosition :  `${-(this.json.image.x)}px ${-(this.json.image.y)}px`,
            width                 :  this.json.image.w,
            height                :  this.json.image.h
        };
    }

}

export default Champion;

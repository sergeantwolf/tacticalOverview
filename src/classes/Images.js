'use strict';

const cdnPrefix = 'http://ddragon.leagueoflegends.com/cdn/';
const currentVersionPrefix = '5.4.1/';
const spritePrefix = 'img/sprite/';
const championLoadingPrefix = 'img/champion/loading/';
const championSquareIconPrefix = 'img/champion/';
const scoreIcon = 'img/ui/score.png';
const minionIcon = 'img/ui/minion.png';
const championIcon = 'img/ui/champion.png';
const minionProfileIcon = 'img/profileicon/16.png';
const localImagePrefix = 'images/';
const baronIcon = 'baronNashor.png';
const dragonIcon = 'dragon.png';
const blueGolemIcon = 'blueGolem.png';
const redLizardIcon = 'redLizard.png';
const fightIcon = 'fight.png';

class Images {

    static getSpritePrefix() {
        return `${cdnPrefix}${currentVersionPrefix}${spritePrefix}`;
    }

    static getChampionSquareIconPrefix() {
        return `${cdnPrefix}${currentVersionPrefix}${championSquareIconPrefix}`;
    }

    static getChampionLoadingPrefix() {
        return `${cdnPrefix}${championLoadingPrefix}`;
    }

    static getScoreIcon() {
        return `${cdnPrefix}${currentVersionPrefix}${scoreIcon}`;
    }

    static getChampionScoreIcon() {
        return `${cdnPrefix}${currentVersionPrefix}${championIcon}`;
    }

    static getMinionScoreIcon() {
        return `${cdnPrefix}${currentVersionPrefix}${minionIcon}`;
    }

    static getEventIcon(eventType) {
        switch(eventType) {
            case 'ELITE_MONSTER_KILL':
                return Images.getMinionScoreIcon();
            case 'CHAMPION_KILL':
                return Images.getScoreIcon();
            default:
                return Images.getChampionScoreIcon();
        }
    }

    static getMinionProfileIcon() {
        return `${cdnPrefix}${currentVersionPrefix}${minionProfileIcon}`;
    }

    static getMonsterIcon(monsterType) {
        switch (monsterType) {
            case 'BARON_NASHOR':
                return `${localImagePrefix}${baronIcon}`;
            case 'BLUE_GOLEM':
                return `${localImagePrefix}${blueGolemIcon}`;
            case 'DRAGON':
                return `${localImagePrefix}${dragonIcon}`;
            case 'RED_LIZARD':
                return `${localImagePrefix}${redLizardIcon}`;
            default:
                return Images.getMinionProfileIcon();
        }
    }

    static getFightIcon() {
        return `${localImagePrefix}${fightIcon}`;
    }

}

export default Images;

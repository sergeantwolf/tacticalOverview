'use strict';
let React = require('react/addons'),
    classNames = require('classnames');

import Champion from 'classes/Champion';
import ChampionStorage from 'classes/ChampionStorage';

class ChampionIcon extends React.Component {

    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        ChampionStorage.getChampionData(this.props.id)
            .onValue(championJson => this.setState({imgUrl: new Champion(championJson).squareIcon}));
    }

    render() {
        return (this.state.imgUrl?
            <img className={classNames({
            championIcon: true,
            team100Border: this.props.teamId === 100,
            team200Border: this.props.teamId === 200
            })} src={this.state.imgUrl}></img>
            :<span></span>
        );
    }
}

ChampionIcon.propTypes = {
    id: React.PropTypes.number.isRequired
};

export default ChampionIcon;

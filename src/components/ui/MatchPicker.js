/**
 * Created by sergeant on 4/2/2015.
 */
'use strict';
let React = require('react'),
    classNames = require('classnames'),
    moment = require('moment'),
    _ = require('lodash'),
    Bacon = require('baconjs');

import MatchList from 'components/ui/MatchList.js';

class MatchPicker extends React.Component {
    constructor() {
        super();
        this.selectedMatchBus = new Bacon.Bus();
        this.state = {
            matchBlocks: [
                1428882900,
                1428884700,
                1428886500,
                1428888300,
                1428890100,
                1428891900,
                1428893700,
                1428895500,
                1428897300,
                1428899100
            ]
        };
    }

    componentWillUnmount() {
        this.selectedMatchBus.end();
    }

    selectMatchBlock(id) {
        this.selectedMatchBus.push(id);
        this.setState({selectedMatchBlock: id});
    }

    render() {
        return <div>
            <div className='row'>
                {this.state.matchBlocks.map(
                        matchBlockTimestamp =>
                            <a key={matchBlockTimestamp} className={classNames({
                             'btn-flat': this.state.selectedMatchBlock!==matchBlockTimestamp,
                             btn: this.state.selectedMatchBlock===matchBlockTimestamp
                             })} onClick={_.partial(this.selectMatchBlock, matchBlockTimestamp).bind(this)}
                               href="#">{moment(matchBlockTimestamp, 'X').format('D MMM hh:mm')}</a>)}
            </div>
            <div className='row'>
                <MatchList matchBlock={this.selectedMatchBus.toProperty()}></MatchList>
            </div>
        </div>;
    }
}

export default MatchPicker;

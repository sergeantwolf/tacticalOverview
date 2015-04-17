'use strict';

let React = require('react'),
    moment = require('moment'),
    classNames = require('classnames'),
    _ = require('lodash');

require('ion-rangeslider/js/ion.rangeSlider.js');
require('ion-rangeslider/css/ion.rangeSlider.css');
require('ion-rangeslider/css/ion.rangeSlider.skinFlat.css');

const playInterval = 50;
const minSpeed = 40;

export default class TimeLine extends React.Component {
    constructor() {
        super();
        this.state = {
            isPlaying: false,
            speed: 40
        };
        this.currentValue = 0;
        this.sliderValue = 0;
        this.timeLineStart = 0;
    }

    componentDidMount() {
        let $domNode = $(React.findDOMNode(this).querySelector('.timeLine'));
        $domNode.ionRangeSlider({
            min: 0,
            max: 1000,
            //--this variant converts labels into real date
            //prettify: num => moment(this.timeLineStart + num, 'x').format('D MMM hh:mm:ss'),
            //--this variant is showing game clock time
            prettify: num => {let duration = moment.duration(num); return `${Math.floor(duration.asMinutes())}:${_.padLeft(duration.seconds(), 2, '0')}`;},
            onChange: data => {
                if (this.currentValue !== data.from) {
                    this.currentValue = data.from;
                    this.props.onChange(data.from);
                    this.sliderValue = data.from;
                }
            }
        });
        this.slider = $domNode.data('ionRangeSlider');
        this.timeLineBoundsUnsubscribe = this.props.timeLineBounds.onValue(this.setBounds.bind(this));
    }

    componentWillUnmount() {
        this.slider.destroy();
        this.slider = null;
        this.timeLineBoundsUnsubscribe();
        if (this.state.isPlaying) {
            clearTimeout(this.state.isPlaying);
        }
    }

    setBounds(bounds) {
        this.timeLineStart = bounds.create;
        this.bounds = bounds;
        this.sliderValue = this.currentValue = bounds.start;
        this.slider.update({
            min: bounds.start,
            max: bounds.end
        });
    }

    togglePlay() {
        if (this.state.isPlaying) {
            //console.log('clearInterval command');
            clearInterval(this.state.isPlaying);
            this.setState({isPlaying: false});
        } else {
            this.setState({isPlaying: setInterval(() => {
                let newPosition = Math.max(this.bounds.start, this.currentValue + this.state.speed);
                if (newPosition > this.bounds.end) {
                    newPosition = this.bounds.end;
                    if (this.state.isPlaying) {
                        clearInterval(this.state.isPlaying);
                    }
                    this.setState({isPlaying: false});
                }
                this.currentValue = newPosition;
                this.props.onChange(newPosition);
                //ionrangeslider can't handle frequent updates smoothly (or I'm doing smth completely wrong :) )
                if (Math.abs(this.sliderValue - newPosition) >= 1000) {
                    this.slider.update({
                        from: newPosition
                    });
                }
            }, playInterval)});
        }
    }

    speedUp() {
        this.setState({speed: this.state.speed * 2});
    }

    slowDown() {
        this.setState({speed: Math.max(minSpeed, this.state.speed/2)});
    }

    render() {
        return (
            <div>
                <div className="row timeLine"></div>
                <div className="row">
                    <a className="btn-floating waves-effect waves-light blue"><i className={classNames({
                    'mdi-av-play-arrow': !this.state.isPlaying,
                    'mdi-av-pause': !!this.state.isPlaying
                    })} onClick={this.togglePlay.bind(this)}></i></a>
                    <a className="btn-floating waves-effect waves-light blue"><i className="mdi-av-fast-rewind" onClick={this.slowDown.bind(this)}></i></a>
                    <a className="btn-floating waves-effect waves-light blue"><i className="mdi-av-fast-forward" onClick={this.speedUp.bind(this)}></i></a>
                    {this.state.isPlaying?<span className="container">Playing at x{this.state.speed/minSpeed} speed</span>:''}
                </div>
            </div>
        );
    }
}


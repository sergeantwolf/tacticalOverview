'use strict';


import TacticalOverviewApp from 'components/TacticalOverviewApp.js';

describe('Main', function () {
    let React = require('react/addons');
    var component;

    beforeEach(function () {
        var container = document.createElement('div');
        container.id = 'content';
        document.body.appendChild(container);
        component = React.createElement(TacticalOverviewApp);
    });

    it('should create a new instance of TacticalOverviewApp', function () {
        expect(component).toBeDefined();
    });
});

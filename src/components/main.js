'use strict';

require('babel-core/polyfill');
require('../styles/normalize.css');
require('../styles/main.css');
require('materialize-css/bin/materialize.css');
require('materialize-css/bin/materialize.js');

import TacticalOverviewApp from './TacticalOverviewApp';
import MatchPicker from './ui/MatchPicker';
import RiftMap from './map/RiftMap';

let React = require('react'),
    Router = require('react-router'),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,

    content = document.getElementById('content'),

    Routes = (
      <Route handler={TacticalOverviewApp}>
        <DefaultRoute name="matchPicker" handler={MatchPicker}/>
        <Route name="riftMap" path="/riftMap/:matchId" handler={RiftMap}/>
      </Route>
    );

Router.run(Routes, function (Handler, state) {
  React.render(<Handler params={state.params}/>, content);
});

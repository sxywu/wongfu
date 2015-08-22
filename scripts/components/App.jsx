var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');

var VideoStore = require('../stores/VideoStore');
var YoutuberStore = require('../stores/YoutuberStore');

var ServerActionCreators = require('../actions/ServerActionCreators');

var App = React.createClass({
  componentWillMount() {
    var youtubers = YoutuberStore.getYoutuberNames();
    ServerActionCreators.getYoutubers();
    _.each(youtubers, (youtuber) => {
      ServerActionCreators.getVideoForYoutuber(youtuber);
    });
    
  },

  render() {
    return (
      <div />
    );
  }
});

module.exports = App;
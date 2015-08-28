var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// stores
var VideoStore = require('../stores/VideoStore');
var YoutuberStore = require('../stores/YoutuberStore');
// utils
var GraphUtils = require('../utils/GraphUtils');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');
// components
var LinesComponent = require('./Lines.jsx');
var VideosComponent = require('./Videos.jsx');

var App = React.createClass({
  getInitialState() {
    return {
      lines: [],
      videos: []
    }
  },

  componentWillMount() {
    var youtubers = YoutuberStore.getYoutuberNames();
    ServerActionCreators.getYoutubers(() => {
      _.each(youtubers, (youtuber) => {
        ServerActionCreators.getVideoForYoutuber(youtuber);
      });
    });

    VideoStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    VideoStore.removeChangeListener(this.onChange);
  },
 
  onChange() {
    var youtubers = GraphUtils.calculateYoutubers();
    var lines = GraphUtils.calculateLines(youtubers);
    var videos = GraphUtils.calculateVideos(youtubers);
    this.setState({youtubers, lines, videos});
  },

  render() {
    var lines = (<LinesComponent data={this.state.lines} />);
    var videos = (<VideosComponent data={this.state.videos} />);

    return (
      <svg>
        {lines}
        {videos}
      </svg>
    );
  }
});

module.exports = App;
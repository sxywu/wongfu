var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// stores
var VideoStore = require('../stores/VideoStore');
var YoutuberStore = require('../stores/YoutuberStore');
var GraphStore = require('../stores/GraphStore');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');
// components
var LineComponent = require('./Line.jsx');
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

    GraphStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    GraphStore.removeChangeListener(this.onChange);
  },
 
  onChange() {
    this.setState({
      lines: GraphStore.getLines(),
      videos: GraphStore.getVideos()
    });
  },

  render() {
    var distancePathStyle = {
      fill: 'none',
      stroke: 'none'
    };
    var lines = _.map(this.state.lines, (line) => {
      return <LineComponent data={line} />
    });
    var videos = (<VideosComponent data={this.state.videos} />);

    return (
      <svg>
        <path className="distancePath" style={distancePathStyle} />
        {lines}
        {videos}
      </svg>
    );
  }
});

module.exports = App;
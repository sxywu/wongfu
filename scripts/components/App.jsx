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
var GraphComponent = require('./Graph.jsx');
var VideoSummaryComponent = require('./VideoSummary.jsx');

var vizHeight = 15000;
var xPadding = 75;
var youtuberSVGHeight = 200;

var App = React.createClass({
  getInitialState() {
    return {
      youtubers: {},
      lines: [],
      videos: [],
      miniMap: [],
      hoverVideoId: null,
      hoverYoutuberName: null,
    }
  },

  componentWillMount() {
    ServerActionCreators.getYoutuberNames(() => {
      ServerActionCreators.getYoutubers(() => {
        ServerActionCreators.getYoutuberAffiliates(() => {
          var youtubers = YoutuberStore.getYoutuberNames();
          _.each(youtubers, (youtuber) => {
            ServerActionCreators.getVideoForYoutuber(youtuber);
          });
        });
      });
    })
    
    VideoStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    VideoStore.removeChangeListener(this.onChange);
  },
 
  onChange() {
    var state = {};

    state.youtubers = GraphUtils.calculateYoutubers();
    state.lines = GraphUtils.calculateLines(state.youtubers);
    state.videos = GraphUtils.calculateVideos(state.youtubers);
    state.miniMap = GraphUtils.calculateMiniMap(state.youtubers, state.videos);

    this.setState(state);
  },

  hoverVideo(video) {
    this.setState({hoverVideoId: video.id, hoverYoutuberName: null}); 
  },

  unhoverVideo() {
    this.setState({hoverVideoId: null, hoverYoutuberName: null});
  },

  hoverYoutuber(youtuber) {
    this.setState({hoverVideoId: null, hoverYoutuberName: youtuber.name});
  },

  unhoverYoutuber() {
    this.setState({hoverVideoId: null, hoverYoutuberName: null});
  },

  render() {
    var lineWidth = GraphUtils.getSVGWidth(this.state.lines);
    var timelineHeight = vizHeight + youtuberSVGHeight;
    var summaryDivStyle = {position: 'absolute', top: 0, height: timelineHeight};

    var graph = (<GraphComponent lineWidth={lineWidth} timelineHeight={timelineHeight}
      youtubers={this.state.youtubers} videos={this.state.videos} lines={this.state.lines} miniMap={this.state.miniMap}
      hoverVideoId={this.state.hoverVideoId} hoverYoutuberName={this.state.hoverYoutuberName}
      hoverVideo={this.hoverVideo} unhoverVideo={this.unhoverVideo}
      hoverYoutuber={this.hoverYoutuber} unhoverYoutuber={this.unhoverYoutuber} />);
    var videoSummary = (<VideoSummaryComponent youtubers={this.state.youtubers}
      videos={this.state.videos} videoId={this.state.hoverVideoId} unhoverVideo={this.unhoverVideo} />);

    return (
      <div>
        {graph}
        <div style={summaryDivStyle}>
          {videoSummary}
        </div>
      </div>
    );
  }
});

module.exports = App;
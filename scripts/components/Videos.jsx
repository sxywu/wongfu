var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// stores
var VideoStore = require('../stores/VideoStore');
var YoutuberStore = require('../stores/YoutuberStore');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var Videos = React.createClass({
  render() {
    var size = 4;
    var videos = _.map(this.props.data, (video) => {
      return (
        <circle cx={video.x} cy={video.y} r={size} stroke={video.fill} strokeWidth="2" fill="#fff" />
      );
    });

    return (
      <g>
        {videos}
      </g>
    );
  }
});

module.exports = Videos;
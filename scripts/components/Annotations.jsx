var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var timeFormat = d3.time.format("%a %b %d, %Y");
var Annotations = React.createClass({

  render() {
    var style = {
      position: 'relative',
      left: this.props.lineWidth,
      right: 0,
      padding: '0 20px',
    };
    var collaborations = _.map(this.props.annotations, (annotation, videoId) => {
      var video = this.props.videos[videoId];
      var collaborationStyle = {
        position: 'absolute',
        top: video.y,
      };
      return (
        <div style={collaborationStyle}>
          <div>{timeFormat(video.data.publishedDate)}</div>
          <div>{annotation.collaborators.join(', ')}</div>
          <div>{video.data.title}</div>
        </div>
      );
    });
    return (
      <div style={style}>
        {collaborations}
      </div>
    );
  }
});

module.exports = Annotations;
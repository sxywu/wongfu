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
    var prevVideo = null;
    var heightAllocation = 150;
    var collaborations = _.chain(this.props.annotations)
      .filter((annotation) => {
        var video = annotation.video;
        if (!prevVideo || (prevVideo && prevVideo.y + heightAllocation < video.y)) {
          prevVideo = video;
          return true;
        }
      }).map(annotation => {
        var video = annotation.video;
        var collaborationStyle = {
          position: 'absolute',
          top: video.y,
        };
        return (
          <div style={collaborationStyle}>
            <div>{timeFormat(video.data.publishedDate)}</div>
            <div>{annotation.collaborators.join(', ')}</div>
            <div>{video.data.title}</div>
            <div>{annotation.views}</div>
            <div>{annotation.count ? annotation.count + ' times' : null}</div>
          </div>
        );
      }).value();
    return (
      <div style={style}>
        {collaborations}
      </div>
    );
  }
});

module.exports = Annotations;
var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var duration = 200;
var timeFormat = d3.time.format("%a %b %d, %Y");
var numberFormat = d3.format(',');
var prevVideoId;

function getLabelStyle(color, madeVideo) {
  return {
    'font-family': 'Helvetica',
    'font-size': '12px',
    'font-weight': 'bold',
    display: 'inline-block',
    padding: '0 5px',
    'border-radius': '3px',
    'background-color': (madeVideo ? color : '#fff'),
    border: '2px solid ' + color,
    color: (madeVideo ? '#fff' : color),
    margin: '0 5px 5px 0'
  };
}

var date, videoSpan, videoSVG, videoDot, videoSize, videoIframe, title, views, associations;
function enterSummary(selection, unhoverVideo) {
  var smallTextStyle = {
    'font-family': 'Helvetica',
    'font-size': '14px',
    color: '#3A2F2F',
    'z-index': 10,
    padding: '5px 0',
    position: 'relative',
  };
  var bigTextStyle = {
    'font-family': 'Droid Serif',
    'font-size': '22px',
    'line-height': '24px',
    color: '#3A2F2F',
    'z-index': 10,
    padding: '5px 0',
    position: 'relative',
  };
  var videoSVGStyle = {
    position: 'absolute',
    'z-index': 1,
    cursor: 'pointer',
  };
  var videoSpanStyle = {
    display: 'inline-block',
    width: 8,
    height: 10,
    margin: '0 8px 0 0',
  };
  var summaryStyle = {
    position: 'absolute',
    // width: 400,
    'background-color': 'rgba(255,255,255,.85)',
    padding: '10px 20px',
    border: '1px solid #BEB6B6',
    'box-shadow': '0 0 10px #BEB6B6',
    'border-radius': '3px',
  };

  selection.style(summaryStyle)
    .on('mouseleave', unhoverVideo);

  videoSVG = selection.append('svg')
    .style(videoSVGStyle);

  videoSize = videoSVG.append('circle')
    .attr('opacity', .5);

  videoDot = videoSVG.append('circle')
    .attr('r', 4)
    .attr('stroke-width', 2)
    .attr('stroke', '#fff');

  videoIframe = selection.append('iframe')
    .attr('width', 400)
    .attr('height', 240)
    .attr('frameborder', 0);

  date = selection.append('div')
    .style(smallTextStyle);

  title = selection.append('a')
    .style(bigTextStyle)
    .attr('target', '_new');

  associations = selection.append('div')
    .style(smallTextStyle);

  videoSpan = selection.append('span')
    .style(videoSpanStyle);

  views = selection.append('span')
    .style(smallTextStyle);
}

function updateSummary(selection, video, youtubers) {
  if (!video) {
    selection.style({
      display: 'none',
    });
    videoIframe.attr('src', null);
    prevVideoId = null;

    return;
  } else if (video.id === prevVideoId) {
    return;
  }

  prevVideoId = video.id;

  selection.style({
    display: 'block',
  });

  videoIframe.attr('src', 'https://www.youtube.com/embed/' + video.data.videoId);

  date.text(timeFormat(video.data.publishedDate));

  title
    .attr('href', "http://www.youtube.com/video/" + video.data.videoId)
    .text(video.data.title);

  views.text(numberFormat(video.data.views) + ' views');

  var youtubersData = _.sortBy(video.data.associations, (association) => {
    var youtuber = youtubers[association];
    return youtuber && youtuber.data.joinedDate;
  });
  youtubersData.unshift(video.data.youtuber);

  var allAssociations = associations.selectAll('a')
    .data(youtubersData);

  allAssociations.enter().append('a');
  allAssociations
    .each(function(association, i) {
      var madeVideo = (i === 0);
      var youtuber = youtubers[association];
      var color = youtuber ? youtuber.fill : '#BEB6B6';
      d3.select(this).style(getLabelStyle(color, madeVideo));
    })
    .attr('target', '_new')
    .attr('href', (association) => "http://www.youtube.com/" + association)
    .text((association) => association);
  allAssociations.exit().remove();

  var videoSpanNode = videoSpan.node();
  var videoX = videoSpanNode.offsetLeft + videoSpanNode.offsetWidth / 2;
  var videoY = videoSpanNode.offsetTop + videoSpanNode.offsetHeight / 2;
  var videoPadding = 1;
  videoSVG.attr('width', (video.size + videoPadding) * 2)
    .attr('height', (video.size + videoPadding) * 2)
    .style({
      'top': -video.size - videoPadding + videoY,
      'left': -video.size - videoPadding + videoX,
    });
  videoSize
    .attr('cx', video.size + videoPadding)
    .attr('cy', video.size + videoPadding)
    .attr('fill', video.fill)
    .attr('r', video.size);
  videoDot
    .attr('cx', video.size + videoPadding)
    .attr('cy', video.size + videoPadding)
    .attr('fill', video.fill);

  selection
    .style({
      top: video.y - videoY,
      left: video.x - videoX,
    });
}

var VideoSummary = React.createClass({

  componentDidMount() {
    this.d3Video = d3.select(this.getDOMNode())
      .call(enterSummary, this.props.unhoverVideo);
  },

  shouldComponentUpdate(nextProps) {
    var video = nextProps.videos[nextProps.videoId - 1];
    this.d3Video.call(updateSummary, video, nextProps.youtubers);

    return false;
  },

  render() {
    return (
      <div />
    );
  }
});

module.exports = VideoSummary;
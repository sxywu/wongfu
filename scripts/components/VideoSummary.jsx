var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var duration = 200;
var timeFormat = d3.time.format("%a %b %d, %Y");
var numberFormat = d3.format(',');

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

var date, title, views, associations;
function enterSummary(selection) {
  var smallTextStyle = {
    'font-family': 'Helvetica',
    'font-size': '14px',
    color: '#3A2F2F',
    padding: '5px 0'
  };
  var bigTextStyle = {
    'font-family': 'Droid Serif',
    'font-size': '22px',
    'line-height': '24px',
    color: '#3A2F2F',
  };
  var summaryStyle = {
    position: 'absolute'
  };

  selection.style(summaryStyle);

  date = selection.append('div')
    .style(smallTextStyle);

  title = selection.append('a')
    .style(bigTextStyle)
    .attr('target', '_new');

  views = selection.append('div')
    .style(smallTextStyle);

  associations = selection.append('div');
}

function updateSummary(selection, video, youtubers) {
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

  var top = video.y - selection.node().offsetHeight - 20;
  selection
    .transition().duration(duration)
    .style({top});
}

var VideoSummary = React.createClass({

  componentDidMount() {
    this.d3Video = d3.select(this.refs.videoData.getDOMNode())
      .call(enterSummary);
  },

  shouldComponentUpdate(nextProps) {
    var video = nextProps.videos[nextProps.videoId - 1];

    if (video) {
      this.d3Video.call(updateSummary, video, nextProps.youtubers);
    }

    return false;
  },

  render() {
    var video = this.props.videos[this.props.videoId - 1];

    return (
      <div>
        <div ref="videoData" />
        <div ref="youtuberData" />
      </div>
    );
  }
});

module.exports = VideoSummary;
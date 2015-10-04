var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');

var distancePath;
var gap = 100;
var duration = 200;
function calculateDistance(selection) {
  selection.each((data) => {
    var source;
    var target;
    var totalDistance = 0;
    _.each(data.points, function(target) {
      if (!source) {
        target.d = 'M' + target.x + ',' + target.y;
        target.distance = 0;
        target.totalDistance = 0;
      } else {
        if (source.y > target.y - gap) {
          // if they're sufficiently close to each other
          if (source.x === target.x) {
            target.d = drawLine(target.x, target.y);
            setDistance(source, target);
          } else {
            target.d = drawCurve(source.x, source.y, target.x, target.y);

            setDistance(source, target);
            target.y1 = target.y - source.y;
            target.interpolate1 = d3.interpolate(0, target.distance);
          }
        } else {
          target.d = '';
          if (source.x !== data.categoryX) {
            // if the source repo owner isn't the same as the contributor, move the line back
            target.d += drawCurve(source.x, source.y, data.categoryX, source.y + gap / 3);

            setDistance(source, target);
            target.y1 = gap / 3;
            target.interpolate1 = d3.interpolate(0, target.distance);
          }

          x = target.x;
          y = target.y;
          if (target.x !== data.categoryX) {
            x = data.categoryX;
            y = target.y - gap / 3;
          }
          
          target.d += drawLine(x, y);
          target.y2 = y - (target.y1 || 0);
          setDistance(source, target);

          if (target.x !== data.categoryX) {
            target.d += drawCurve(x, y, target.x, target.y);
            var currentDistance = target.distance;
            setDistance(source, target);
            target.y3 = gap / 3;
            target.interpolate2 = d3.interpolate(0, target.distance - currentDistance);
          }
        }
        target.totalDistance = (totalDistance += target.distance);
        source.target = target;
      }
      source = target;
    });

    data.totalDistance = totalDistance;
    data.pointsById = {};
    _.chain(data.points)
      .groupBy((point) => Math.floor(point.y / 100) * 100)
      .each((points, key) => {
        data.pointsById[key] = _.groupBy(points, (point) => {
          return Math.floor((point.y - parseInt(key)) / 10) * 10;
        });
      }).value();
  });
}

function windowScroll(selection, top, hoverVideo) {
  selection
    .each((data) => {
      var {source, target} = findPoint(top, data);
      data.source = source;
      data.target = target;
    })
    .transition().duration(duration)
    .attr('stroke-opacity', (data) => {
      if (!hoverVideo) return .5;
      var madeVideo = hoverVideo.data.youtuber === data.name;
      var inVideo = _.find(hoverVideo.data.associations, (association) => association === data.name);
      return (madeVideo || inVideo) ? .75 : .15;
    }).attr('stroke-dashoffset', (data) => {
      var source = data.source;
      var target = data.target;
      var distance = 0;
      if (source && target) {
        var distanceFromSource = top - source.y;
        if (!target.interpolate1) {
          // if there's no interpolate1
          if (!target.interpolate2) {
            // and there's no interpolate2, must mean it's a straight line
            distance = distanceFromSource + source.totalDistance;
          } else {
            // if there's a interpolate2, must mean there's a straight line
            // and then a curve at the end, so figure out if we're in straight line or curve part
            if (distanceFromSource <= target.y2) {
              // it's in straight line part
              distance = distanceFromSource + source.totalDistance;
            } else {
              // if it's in last curve part, first interpolate the curve
              // and then add that back to the straight part and the previous total distance
              var partialDistance = (distanceFromSource - target.y2) / target.y3;
              distance = target.interpolate2(partialDistance) + target.y2 + source.totalDistance;
            }
          }
        } else {
          // if there's interpolate1, must mean there's a first curve
          if (distanceFromSource <= target.y1) {
            // so if it's within the first curve, interpolate that and add it to total distance
            var partialDistance = distanceFromSource / target.y1;
            distance = target.interpolate1(partialDistance) + source.totalDistance;
          } else if (distanceFromSource <= (target.y1 + target.y2)) {
            // if we're in line part, add curve to it
            distance = target.interpolate1(1) + (distanceFromSource - target.y1) + source.totalDistance;
          } else if (target.interpolate2) {
            var partialDistance = (distanceFromSource - target.y2 - target.y1) / target.y3;
            distance = target.interpolate1(1) + target.y2 + target.interpolate2(partialDistance);
          }
        }
      } else if (source && !target) {
        distance = data.totalDistance;
      }

      return data.totalDistance - distance;
    });
}

function enterLines(selection) {
  selection.attr('fill-opacity', 0)
    .attr('stroke-width', 3)
    .attr('stroke-linecap', 'round')
    .attr('stroke-opacity', .5)
    .attr('stroke', (data) => data.fill)
    .attr('stroke-dasharray', (data) => data.totalDistance)
    .attr('d', (data) => _.pluck(data.points, 'd').join(' '));
}

function findPoint(top, data) {
  var source, target;
  var floor100 = Math.floor(top / 100) * 100;
  var floor10 = Math.floor((top - floor100) / 10) * 10;

  if (data.pointsById[floor100] && data.pointsById[floor100][floor10]) {
    _.some(data.pointsById[floor100][floor10], function(point) {
      // if there's that entry, then see if it's in that entry
      if (!point.target || (point.y < top && top <= point.target.y)) {
        source = point;
        target = source.target;
        return true;
      }
    });

    if (source) return {source, target};
    // if it wasn't in there, find next lowest
    return findNextLowest(data, floor100, floor10 - 10);
  } else {
    return findNextLowest(data, floor100, floor10);
  }
  return {source, target};
}

function findNextLowest(data, floor100, floor10) {
  var source, target;
  if (data.pointsById[floor100]) {
    // if floor10 is more than 0, can loop it down
    while (floor10 >= 0) {
      if (data.pointsById[floor100][floor10]) {
        source = _.last(data.pointsById[floor100][floor10]);
        target = source.target;
        break;
      } else {
        floor10 -= 10;
      }
    }

    if (source) return {source, target}; 
  }

  if (floor100 <= 0 && floor100 <= 0) {
    target = _.first(data.points);
    return {source, target};
  }

  // if we didn't find a source, means we didn't find it in this 100
  // or if there wasn't this 100 to begin with, then subtract
  return findNextLowest(data, floor100 - 100, 90);
}

function drawLine(x, y) {
  return 'L' + x.toFixed(2) + ',' + y.toFixed(2);
}

function drawCurve(x1, y1, x2, y2) {
  var cy = (y1 + y2) / 2;
  return 'C' + x1.toFixed(2) + ',' + cy.toFixed(2) + ' ' +
    x2.toFixed(2) + ',' + cy.toFixed(2) + ' ' + x2.toFixed(2) + ',' + y2.toFixed(2);
}

function setDistance(source, target) {
  var distancePathD = 'M' + source.x + ',' + source.y + ' ' + target.d;
  distancePath.setAttribute('d', distancePathD);
  target.distance = parseFloat(distancePath.getTotalLength().toFixed(2));
}

var Lines = React.createClass({
  componentWillMount() {
    distancePath = d3.select('path.distancePath').node();
  },

  shouldComponentUpdate(nextProps) {
    if (!this.d3Selection) {
      this.d3Selection = d3.select(this.refs.lines.getDOMNode())
        .selectAll('path').data(nextProps.data);
      this.d3Selection.enter().append('path');
      this.d3Selection
        .call(calculateDistance)
        .call(enterLines);
    }
    
    var video = nextProps.videos[nextProps.videoId - 1];
    var hoverVideo = nextProps.videos[nextProps.hoverVideoId - 1];

    this.d3Selection
      .call(windowScroll, nextProps.top, hoverVideo);
    video && d3.select(this.refs.line.getDOMNode())
      .transition().duration(duration)
      .attr('stroke', video.fill)
      .attr('x1', video.x).attr('x2', window.innerWidth)
      .attr('y1', video.y).attr('y2', video.y);

    return false;
  },

  render() {
    return (
      <g>
        <line ref="line" strokeDasharray={2} />
        <g ref="lines" />
      </g>
    );
  }
});

module.exports = Lines;
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

function updateLines(selection) {
  selection.attr('fill-opacity', 0)
    .attr('stroke', (data) => data.fill)
    .attr('stroke-width', 3)
    .attr('stroke-linecap', 'round')
    .attr('d', (data) => _.pluck(data.points, 'd').join(' '))
    .attr('stroke-dasharray', (data) => data.totalDistance);
}

function windowScroll(selection, top, pointId) {
  selection.transition().duration(duration)
    .attr('stroke-dashoffset', (data) => {
      var {source, target} = findPoint(top, data);
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

  // // if there's no direct match, then keep subtracting down til we find one
  // while (!source) {
  //   if (data.pointsById[floor100]) {
  //     if (data.pointsById[floor100][floor10]) {
  //       _.some(data.pointsById[floor100][floor10], function(point) {
  //         // the source should be less than pointId, and target is more
  //         // or it's the last point
  //         if (!point.target || (point.id < pointId && pointId <= point.target.id)) {
  //           source = point;
  //           return true;
  //         }
  //       });
  //       if (!source && floor10 > 0) {
  //         floor10 -= 10;
  //       }
  //     }
  //     if (source) break;

  //     // if the 100's match, then i should count down the 10's
  //     while (floor10 > 0) {
  //       if (data.pointsById[floor100][floor10]) {
  //         source = _.last(data.pointsById[floor100][floor10]);
  //         break;
  //       } else {
  //         floor10 -= 10;
  //       }
  //     }
  //     // if floor10 is 0, reset floor10 and subtract 100 from floor100
  //     // but only if floor100 isn't 0
  //     if (floor100 > 0) {
  //       floor10 = 90;
  //       floor100 -= 100;
  //     } else {
  //       // else return the first point
  //       source = _.first(data.points);
  //     }
  //   } else if (floor100 > 0) {
  //     floor10 = 90;
  //     floor100 -= 100;
  //   } else {
  //     source = _.first(data.points);
  //   }
  // }
  // target = source && source.target;
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
      this.d3Selection = d3.select(this.getDOMNode())
        .selectAll('path').data(nextProps.data);
      this.d3Selection.enter().append('path');
      this.d3Selection
        .call(calculateDistance)
        .call(updateLines);
    }
    
    this.d3Selection.call(windowScroll, nextProps.top, nextProps.videoId);
    return false;
  },

  render() {
    return (
      <g />
    );
  }
});

module.exports = Lines;
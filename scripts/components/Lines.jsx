var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');

var distancePath;
var gap = 100;
function calculateDistance(selection) {
  selection.each((data) => {
    console.log(data.name, data.points.length)
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
        target.source = source;
      }
      source = target;
    });

    data.totalDistance = totalDistance;
    console.log(data.points.length)
  });
}

function updateLines(selection) {
  selection.attr('fill-opacity', 0)
    .attr('stroke', (data) => data.fill)
    .attr('stroke-width', 4)
    .attr('stroke-linecap', 'round')
    .attr('d', (data) => _.pluck(data.points, 'd').join(' '))
    .attr('stroke-dasharray', (data) => data.totalDistance)
    // .attr('stroke-dashoffset', (data) => data.totalDistance);
}

function windowScroll(selection) {
  var top = scrollY + 400;
  var source;
  var target = _.find(this.state.points, function(point) {
    if (point.y >= top) {
      return true;
    }
    source = point;
    return false;
  });
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
      } else if (interpolate2) {
        var partialDistance = (distanceFromSource - target.y2 - target.y1) / target.y3;
        distance = target.interpolate1(1) + target.y2 + target.interpolate2(partialDistance);
      }
    }
  } else if (source && !target) {
    distance = this.state.totalDistance;
  }

  this.d3Wrapper.transition().duration(duration)
    .attr('stroke-dashoffset', this.state.totalDistance - distance);
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

var duration = 200;
var onWindowScroll;
var Lines = React.createClass({
  componentWillMount() {
    distancePath = d3.select('path.distancePath').node();
  },

  shouldComponentUpdate(nextProps) {
    this.d3Selection = d3.select(this.getDOMNode())
      .selectAll('path').data(nextProps.data);

    this.d3Selection.enter().append('path');
    
    this.d3Selection.call(calculateDistance)
      .call(updateLines);

    if (!onWindowScroll) {
      // onWindowScroll = _.throttle(windowScroll.bind(this, this.d3Selection), duration);
      // window.addEventListener('scroll', onWindowScroll);
    }

    return false;
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', onWindowScroll);
  },

  render() {
    return (
      <g />
    );
  }
});

module.exports = Lines;
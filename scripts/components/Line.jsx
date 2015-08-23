var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');

var distancePath;
var gap = 100;
function calculateDistance(data, distancePath) {
  var source;
  var target;
  var totalDistance = 0;
  var points = _.map(data.points, function(target) {
    target = _.clone(target);
    if (!source) {
      target.d = 'M' + target.x + ',' + target.y;
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
      
    }
    source = target;
    return target;
  });

  return {points, totalDistance};
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

var Line = React.createClass({
  getInitialState() {
    return {
      totalDistance: 0,
      points: []
    };
  },

  componentWillMount() {
    distancePath = d3.select('svg').select('path.distancePath').node();
  },

  componentDidMount() {
    this.d3Wrapper = d3.select(this.getDOMNode());
    this.d3Wrapper
      .attr('d', _.pluck(this.state.points, 'd').join(' '))
      .attr('fill-opacity', 0)
      .attr('stroke', this.props.data.fill)
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', this.state.totalDistance)
      .attr('stroke-dashoffset', this.state.totalDistance);
  },

  componentWillReceiveProps(nextProps) {
    this.setState(calculateDistance(nextProps.data));
  },

  render() {
    var d = _.pluck(this.state.points, 'd').join(' ');
    return (
      <path d={d} />
    );
  }
});

module.exports = Line;
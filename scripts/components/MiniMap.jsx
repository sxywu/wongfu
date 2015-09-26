var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
var GraphUtils = require('../utils/GraphUtils');

var duration = 200;

function enterMiniMap(selection, miniMap, videos) {
  selection.selectAll('div')
    .data(miniMap).enter().append('div')
    .style('background-color', (map) => map.fill)
    .style('opacity', (map) => map.opacity)
    .style('top', (map) => map.sideY1)
    .style('height', (map) => map.sideHeight)
    .style({
      'position': 'absolute',
      'right': 0,
      'width': 75
    });

  selection.selectAll('span')
    .data(videos).enter().append('span')
    .style('background-color', (video) => video.fill)
    .style('top', (video) => video.sideY - 1)
    .style('width', (video) => video.size)
    .style({
      'display': 'inside-block',
      'position': 'absolute',
      'right': 0,
      'height': 2,
      'opacity': .75
    });
};

var top;
var bottom;
function enterOverlay(selection, miniMap) {
  if (top && bottom) return;

  top = selection.append('div')
    .style({
      'position': 'absolute',
      'top': 0,
      'right': 0,
      'width': 75,
      'background-color': 'rgba(255,255,255,.75)',
      // 'border-bottom': '3px double #999'
    });

  bottom = selection.append('div')
    .style({
      'position': 'absolute',
      'bottom': window.innerHeight,
      'right': 0,
      'width': 75,
      'background-color': 'rgba(255,255,255,.75)',
      // 'border-top': '3px double #999'
    });
};

function updateTopBottom() {
  var mapScale = GraphUtils.getMapScale();
  top.transition().duration(duration)
    .style('height', mapScale(window.scrollY));
  bottom.transition().duration(duration)
    .style('top', mapScale(window.scrollY + (window.innerHeight * .6)))
    .style('height', window.innerHeight - mapScale(window.scrollY + (window.innerHeight * .6)));
};

var MiniMap = React.createClass({

  shouldComponentUpdate(nextProps) {
    this.d3MiniMap = d3.select(this.refs.miniMap.getDOMNode())
      .call(enterMiniMap, nextProps.miniMap, nextProps.videos);
    this.d3Overlay = d3.select(this.refs.overlay.getDOMNode())
      .call(enterOverlay, nextProps.miniMap);

    updateTopBottom();
    return false;
  },

  render() {
    var miniMapStyle = {
      position: 'fixed',
      right: 0,
      top: 0
    };

    return (
      <div>
        <div ref="miniMap" style={miniMapStyle} />
        <div ref="overlay" style={miniMapStyle} />
      </div>
    );
  }
});

module.exports = MiniMap;
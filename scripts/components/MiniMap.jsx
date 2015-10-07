var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
var GraphUtils = require('../utils/GraphUtils');

var duration = 200;
var youtuberSVGHeight = 200;

function enterBackground(selection, miniMap) {
  selection.selectAll('div')
    .data(miniMap).enter().append('div')
    .style('background-color', (map) => map.fill)
    .style('opacity', (map) => map.opacity / 3)
    .style('top', (map) => map.y1)
    .style('height', (map) => map.height)
    .style({
      'position': 'absolute',
      'left': 0,
      'width': '100%'
    });
};

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

var overlay;
function enterOverlay(selection, miniMap) {
  if (overlay) return;

  var mapScale = GraphUtils.getMapScale();
  overlay = selection.append('div')
    .style({
      'position': 'absolute',
      'right': 0,
      'width': 75,
      'height': mapScale(window.innerHeight - youtuberSVGHeight),
      'background-color': 'rgba(190,182,182,.25)',
      'border': '1px solid #BEB6B6',
      'border-right': 0
    });
};

function updateOverlay() {
  var mapScale = GraphUtils.getMapScale();
  overlay.transition().duration(duration)
    .style('top', mapScale(window.scrollY));
    
};

var MiniMap = React.createClass({

  shouldComponentUpdate(nextProps) {
    // this.d3Background = d3.select(this.refs.background.getDOMNode())
    //   .call(enterBackground, nextProps.miniMap);
    this.d3MiniMap = d3.select(this.refs.miniMap.getDOMNode())
      .call(enterMiniMap, nextProps.miniMap, nextProps.videos);
    this.d3Overlay = d3.select(this.refs.overlay.getDOMNode())
      .call(enterOverlay, nextProps.miniMap);

    updateOverlay();
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
        <div ref="background" />
        <div ref="miniMap" style={miniMapStyle} />
        <div ref="overlay" style={miniMapStyle} />
      </div>
    );
  }
});

module.exports = MiniMap;
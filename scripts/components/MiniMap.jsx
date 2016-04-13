var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
var GraphUtils = require('../utils/GraphUtils');

var duration = 200;
var youtuberSVGHeight = 200;
var width = 12;

function enterMiniMap(selection, miniMap, videos) {
  selection.selectAll('div')
    .data(miniMap).enter().append('div')
    .style('background-color', (map) => map.fill)
    .style('opacity', (map) => map.opacity)
    .style('top', (map) => map.sideY1)
    .style('height', (map) => map.sideHeight)
    .style({
      'position': 'absolute',
      'left': 0,
      'width': width,
    });
};

var overlay;
function enterOverlay(selection, miniMap) {
  if (overlay) return;

  var mapScale = GraphUtils.getMapScale();
  overlay = selection.append('div')
    .style({
      'position': 'absolute',
      'left': 0,
      'width': width,
      'height': mapScale(window.innerHeight - youtuberSVGHeight),
      'background-color': 'rgba(190,182,182,.25)',
      'border': '1px solid #BEB6B6',
      'border-left': 0
    });
};

function updateOverlay() {
  var mapScale = GraphUtils.getMapScale();
  overlay.transition().duration(duration)
    .style('top', mapScale(window.scrollY));
    
};

module.exports = function() {
  return {
    minimap: null,
    overlay: null,

    enter(selection) {
      var miniMapStyle = {
        position: 'fixed',
        left: 0,
        top: 0
      };
      this.minimap = selection.append('div')
        .style(miniMapStyle);
      this.overlay = selection.append('div')
        .style(miniMapStyle);
    },

    update(selection, nextProps) {
      this.minimap.call(enterMiniMap, nextProps.miniMap, nextProps.videos);
      this.overlay.call(enterOverlay, nextProps.miniMap);

      updateOverlay();
    },
  }
};
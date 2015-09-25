var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');

var duration = 200;

function enterBackground(selection, miniMap) {
  selection.selectAll('div')
    .data(miniMap).enter().append('div')
    .style('background-color', (map) => map.fill)
    .style('opacity', (map) => map.opacity)
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
};

var MiniMap = React.createClass({

  shouldComponentUpdate(nextProps) {
    // this.d3Background = d3.select(this.refs.background.getDOMNode())
    //   .call(enterBackground, nextProps.miniMap);
    this.d3MiniMap = d3.select(this.refs.miniMap.getDOMNode())
      .call(enterMiniMap, nextProps.miniMap, nextProps.videos);
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
      </div>
    );
  }
});

module.exports = MiniMap;
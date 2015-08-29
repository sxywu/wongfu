var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var duration = 350;
var nodeSize = 20;
function enterNodes(selection) {
  selection.append('image')
    .attr('x', -nodeSize)
    .attr('y', -nodeSize)
    .attr('width', nodeSize * 2)
    .attr('height', nodeSize * 2)
    .attr('xlink:href', (data) => data.data.image)
    .attr('clip-path', 'url(#imageClip)');

  selection.append('circle')
    .attr('r', nodeSize - 1)
    .attr('fill', 'none')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  selection.append('circle')
    .attr('r', nodeSize)
    .attr('fill', 'none')
    .attr('stroke', (data) => data.fill)
    .attr('stroke-width', 2);

  selection.attr('transform', (data) => 'translate(' + data.x + ',75)');
}

function updateNodes(selection) {

}

var Youtubers = React.createClass({
  componentDidMount() {
    // create clip path because react doesn't support clipPath ):
    d3.select(this.refs.defs.getDOMNode())
      .append('clipPath')
        .attr('id', 'imageClip')
        .append('circle')
          .attr('r', nodeSize);
  },

  shouldComponentUpdate(nextProps) {
    this.d3Nodes = d3.select(this.refs.nodes.getDOMNode())
      .selectAll('g').data(nextProps.nodes, (node) => node.name);

    this.d3Nodes.enter().append('g').call(enterNodes);
    this.d3Nodes.exit().remove();
    this.d3Nodes.call(updateNodes);
    return false;
  },

  render() {
    return (
      <g>
        <defs ref="defs" />
        <g ref="links" />
        <g ref="nodes" />
      </g>
    );
  }
});

module.exports = Youtubers;
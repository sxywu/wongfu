var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var duration = 350;
var nodeSize = 20;
var linksByVideoId = {};

function calculateLinksByVideoId(youtubers, videos) {
  var prevLinks = [];
  _.each(videos, (video) => {
    var links = linksByVideoId[video.id] = [];
    var source = youtubers[video.data.youtuber];
    _.each(video.data.associations, (association) => {
      // if association not one of the nodes, don't add link
      if (!youtubers[association]) return;

      var target = youtubers[association];
      var prevLink = _.find(prevLinks, (prevLink) =>
        prevLink.source.name === source.name && prevLink.target.name === target.name);
      links.push({
        source, target,
        count: prevLink ? (prevLink.count + 1) : 1
      })
    });

    // now that we've pushed in new links, add the old ones back in
    _.each(prevLinks, (prevLink) => {
      var currentLink = _.find(links, (link) =>
        prevLink.source.name === link.source.name && prevLink.target.name === link.target.name);

      if (currentLink) return;
      // if we haven't taken care of it, push in a clone of it
      links.push(_.clone(prevLink));
    });

    prevLinks = links;
  });
}

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

  selection.attr('transform', (data) => 'translate(' + data.x + ',' + data.y + ')');
}

function enterLinks(selection) {
  selection.attr('d', linkArc)
    .attr('fill', 'none')
    .attr('stroke', (data) => data.source.fill)
    .attr('stroke-width', 2);
}

function updateNodes(selection) {

}

// taken from http://bl.ocks.org/mbostock/1153292
function linkArc(d) {
  console.log(d.target, d.source)
  var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = (Math.sqrt(dx * dx + dy * dy) * 2) / 3;
  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
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
    if (_.isEmpty(linksByVideoId)) {
      calculateLinksByVideoId(nextProps.youtubers, nextProps.videos);
    }

    // for now add y's here
    _.each(nextProps.youtubers, (youtuber) => {
      youtuber.y = 75;
    });
    this.d3Nodes = d3.select(this.refs.nodes.getDOMNode())
      .selectAll('g').data(_.values(nextProps.youtubers), (node) => node.name);
    this.d3Links = d3.select(this.refs.links.getDOMNode())
      .selectAll('path').data(linksByVideoId[nextProps.videoId] || []);

    this.d3Nodes.enter().append('g').call(enterNodes);
    this.d3Nodes.exit().remove();
    this.d3Nodes.call(updateNodes);

    this.d3Links.enter().append('path').call(enterLinks);
    this.d3Links.exit().remove();
    // this.d3Links.call(updateNodes);

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
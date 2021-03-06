var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');
// actions
var ServerActionCreators = require('../actions/ServerActionCreators');

var duration = 125;
var nodeSize = 20;
var nodeY = 50;
var nodePadding = 25;
var linksByVideoId = {};
var widthScale = d3.scale.linear().range([2, 12]);
var opacity = .15;

function calculateLinksByVideoId(youtubers, videos) {
  var prevLinks = [];
  _.each(videos, (video) => {
    var links = linksByVideoId[video.id] = [];
    var target = video.data.youtuber;
    _.each(video.data.associations, (association) => {
      // if association not one of the nodes, don't add link
      if (!youtubers[association]) return;

      var source = association;
      var prevLink = _.find(prevLinks, (prevLink) =>
        (prevLink.source === source && prevLink.target === target) ||
        (prevLink.source === target && prevLink.target === source));
      links.push({
        source: prevLink ? prevLink.source : source,
        target: prevLink ? prevLink.target : target,
        count: prevLink ? (prevLink.count + 1) : 1
      })
    });

    // now that we've pushed in new links, add the old ones back in
    _.each(prevLinks, (prevLink) => {
      var currentLink = _.find(links, (link) =>
        (prevLink.source === link.source && prevLink.target === link.target) ||
        (prevLink.source === link.target && prevLink.target === link.source));

      if (currentLink) return;
      // if we haven't taken care of it, push in a clone of it
      links.push(_.clone(prevLink));
    });

    prevLinks = links;
  });

  var counts = _.chain(linksByVideoId).values().flatten().map('count').value();
  widthScale.domain([_.min(counts), _.max(counts)]);
}

function enterNodes(selection, hoverYoutuber, unhoverYoutuber) {
  selection.append('circle')
    .attr('r', nodeSize - 1)
    .attr('fill', '#fff')
    .attr('stroke', '#fff');

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
    .classed('colorStroke', true)
    .attr('r', nodeSize)
    .attr('fill', 'none')
    .attr('stroke', (data) => data.fill)
    .attr('stroke-width', 2);

  selection
    .attr('transform', (data) => {
      data.y = nodeSize + nodePadding;
      return 'translate(' + data.x + ',' + data.y + ')';
    }).style({cursor: 'pointer'})
    .on('mouseenter', hoverYoutuber)
    .on('mouseleave', unhoverYoutuber);
}

function enterLinks(selection) {
  selection.attr('d', linkArc)
    .attr('fill', 'none')
    .attr('stroke', (data) => data.target.fill)
    .attr('stroke-linecap', 'round')
    .attr('stroke-opacity', .5)
    .attr('stroke-dashoffset', function(data) {
      // if target is to the right of source, then make dashoffset negative
      // so that it will still animate from source to target
      data.totalLength = this.getTotalLength();
      return data.totalLength * (data.target.x > data.source.x ? -1 : 1);
    });
}

function updateNodes(selection, video, links, hoverVideo, hoverYoutuberName) {
  video && selection.filter((data) => video.data.youtuber === data.name)
    .transition().duration(duration)
    .attr('transform', (data) => 'translate(' + data.x + ',' + nodeSize + ')')
    .transition().duration(duration)
      .attr('transform', (data) => 'translate(' + data.x + ',' + data.y + ')');
}

function updateLinks(selection, video, hoverVideo, hoverYoutuberName) {
  selection
    .transition().duration(duration)
    .attr('d', linkArc)
    .attr('opacity', (data) => {
      if (!hoverVideo && !hoverYoutuberName) return .5;

      var sourceMadeVideo = hoverVideo && data.source.name === hoverVideo.data.youtuber;
      var targetMadeVideo = hoverVideo && data.target.name === hoverVideo.data.youtuber;
      var inVideo;
      if (sourceMadeVideo) {
        inVideo = hoverVideo && _.find(hoverVideo.data.associations, (association) => data.target.name === association);
      } else if (targetMadeVideo) {
        inVideo = hoverVideo && _.find(hoverVideo.data.associations, (association) => data.source.name === association);
      }

      var nodeHovered = hoverYoutuberName &&
        (data.source.name === hoverYoutuberName || data.target.name === hoverYoutuberName);

      return (inVideo || nodeHovered) ? 1 : opacity;
    }).attr('stroke-dasharray', function(data) {
      return data.totalLength;
    }).attr('stroke-dashoffset', 0)
    .attr('stroke-width', (data) => widthScale(data.count));
}

function exitLinks(selection) {
  selection.transition().duration(duration)
    .attr('stroke-dashoffset', function(data) {
      // if target is to the right of source, then make dashoffset negative
      // so that it will still animate from source to target
      return data.totalLength * (data.target.x > data.source.x ? -1 : 1);
    }).attr('stroke-width', 0)
    .remove();
}

// modified from http://bl.ocks.org/mbostock/1153292
function linkArc(d) {
  // if target is to left of source, flip them so that the link
  // will still draw an arc below the nodes
  var source = (d.target.x > d.source.x) ? d.target : d.source;
  var target = (d.target.x > d.source.x) ? d.source : d.target;
  var dx = target.x - source.x,
      dy = target.y - source.y,
      dr = (Math.sqrt(dx * dx + dy * dy) * 2) / 3;
  return "M" + source.x + "," + source.y +
    "A" + dr + "," + dr + " 0 0,1 " + target.x + "," + target.y;
}

module.exports = function () {
  return {
    nodes: null,
    links: null,

    enter(svg) {
      // defs
      svg.append('defs')
        .append('clipPath')
          .attr('id', 'imageClip')
          .append('circle')
            .attr('r', nodeSize);

      this.links = svg.append('g');
      this.nodes = svg.append('g');
    },

    update(svg, nextProps) {
      if (_.isEmpty(linksByVideoId)) {
        calculateLinksByVideoId(nextProps.youtubers, nextProps.videos);
      }

      var nodes = this.nodes.selectAll('g')
        .data(_.values(nextProps.youtubers), (node) => node.name);

      var video = nextProps.videos[nextProps.videoId - 1];
      var hoverVideo = nextProps.videos[nextProps.hoverVideoId - 1];
      var linksData = _.map(linksByVideoId[nextProps.videoId] || [], (link) => {
        return {
          source: nextProps.youtubers[link.source],
          target: nextProps.youtubers[link.target],
          count: link.count
        };
      });
      var links = this.links.selectAll('path').data(linksData || [],
          (data) => data.source.name + ',' + data.target.name);

      nodes.enter().append('g')
        .call(enterNodes, nextProps.hoverYoutuber, nextProps.unhoverYoutuber);
      nodes.call(updateNodes, video, linksData, hoverVideo, nextProps.hoverYoutuberName);

      links.enter().append('path').call(enterLinks);
      links.exit().call(exitLinks);
      links.call(updateLinks, video, hoverVideo, nextProps.hoverYoutuberName);
    },

  }
};

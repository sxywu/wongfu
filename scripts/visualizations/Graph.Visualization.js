define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {
    var force; // force graph
    var container, node, link, text;
    var nodes, links; // data
    var nodeScale, linkScale;
    var Graph = function(selection, d) {
        container = selection;

        force = d3.layout.force()
            .size([width, height])
            .charge(-1500).linkDistance(75)
            .on('tick', forceTick);

        container.selectAll("g.node")
            .data(nodes).call(enterNodes);

        container.selectAll("line.link")
            .data(links).call(enterLinks);

        force.nodes(nodes).links(links);
        force.start();

    }

    var enterNodes = function(selection) {
        node = selection.enter()
            .append('g').classed('node', true)
            .call(force.drag)
            .on('mouseover', mouseover)
            .on('mouseleave', mouseleave);

        text = node.append('g').classed('name', true)
            .classed('hidden', true)
            .attr('transform', function(d) {
                return 'translate(' + (nodeScale(parseInt(d.statistics.subscriberCount)) / 2 - 3) + ', 0)';
            });


        text.append('text')
            .attr('x', 8)
            .attr('dy', '.35em')
            .attr('fill', '#ffffff')
            .attr('stroke', 'none')
            .text(function(d) {return d.youtuber})
            .each(function(d) {
                d.width = this.getBBox().width;
            });
        text.insert('rect', 'text')
            .attr('y', -10)
            .attr('width', function(d) {return d.width + 18})
            .attr('height', 20)
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('fill', app.colors.blue)
            .attr('fill-opacity', .5);

        node.append('defs')
            .append('clipPath').attr('id', function(d) {
                return 'clipCircle' + d.index;
            }).append('circle')
            .attr('r', function(d) {return nodeScale(parseInt(d.statistics.subscriberCount)) / 2});
        node.append('image')
            .attr('x', function(d) {return -nodeScale(parseInt(d.statistics.subscriberCount)) / 2})
            .attr('y', function(d) {return -nodeScale(parseInt(d.statistics.subscriberCount)) / 2})
            .attr('height', function(d) {return nodeScale(parseInt(d.statistics.subscriberCount))})
            .attr('width', function(d) {return nodeScale(parseInt(d.statistics.subscriberCount))})
            .attr('clip-path', function(d) {return 'url(#clipCircle' + d.index + ')'})
            .attr('xlink:href', function(d) {return d.image});

        node.append('circle')
            .attr('r', function(d) {return nodeScale(parseInt(d.statistics.subscriberCount)) / 2})
            .attr('fill', 'none')
            .attr('stroke', app.colors.blue)
            .attr('stroke-width', 3);

    }

    var enterLinks = function(selection) {
        link = selection.enter()
            .insert('line', '.node')
            .classed('link', true)
            .attr('stroke-width', function(d) {return linkScale(d.weight)})
            .attr("stroke", app.colors.blue)
            .attr('opacity', .3)
            .attr("fill", "none");
    }


    /**
    force layout
    */

    var initialPositions = function() {

    }

    var forceTick = function() {
        node.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"});
        link.attr("x1", function(d) {return d.source.x})
            .attr("x2", function(d) {return d.target.x})
            .attr("y1", function(d) {return d.source.y})
            .attr("y2", function(d) {return d.target.y});
    }

    /**
    events
    */
    var mouseover = function() {
        d3.select(this).select('.name').classed('active', true);
        d3.select(this).select('.name').classed('hidden', false);
    }

    var mouseleave = function() {
        d3.select(this).select('.name').classed('hidden', true);
        d3.select(this).select('.name').classed('active', false);
    }

    /*
    getter setters
    */

    Graph.nodes = function(value) {
        if (!arguments.length) return nodes;

        var max = _.chain(value).pluck('statistics').pluck('subscriberCount')
            .map(function(d) {return parseInt(d)}).max().value(),
            min = _.chain(value).pluck('statistics').pluck('subscriberCount')
            .map(function(d) {return parseInt(d)}).min().value();
        nodeScale = d3.scale.linear().domain([min, max]).range([40, 80]);
        nodes = value;
        return Graph;
    }

    Graph.links = function(value) {
        if (!arguments.length) return links;

        var max = _.chain(value).pluck('weight').max().value(),
            min = _.chain(value).pluck('weight').min().value();
        linkScale = d3.scale.log().domain([min, max]).range([1, 8]);
        links = value;
        return Graph;
    }

    Graph.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return Graph;
    }

    Graph.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return Graph;
    }

    return function() {
        return Graph;
    }
});
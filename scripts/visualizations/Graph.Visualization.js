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
    var nodes = [], links = []; // data
    var nodeScale, linkScale;
    var Graph = function(selection, d) {
        container = selection;

        force = d3.layout.force()
            .size([width, height])
            .charge(-300).linkDistance(125)
            .on('tick', forceTick);

        Graph.render();

        return Graph;

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
            // .attr('fill-opacity', .5);

        node.append('circle')
            .attr('r', function(d) {return nodeScale(parseInt(d.statistics.subscriberCount)) / 2 + 3})
            .attr('fill', 'white')
            .attr('stroke', app.colors.blue)
            .attr('stroke-width', 3);

        node.append('defs')
            .append('clipPath').attr('id', function(d) {
                return 'clipGraphCircle' + d.index;
            }).append('circle')
            .attr('r', function(d) {return nodeScale(parseInt(d.statistics.subscriberCount)) / 2});
        node.append('image')
            .attr('x', function(d) {return -nodeScale(parseInt(d.statistics.subscriberCount)) / 2})
            .attr('y', function(d) {return -nodeScale(parseInt(d.statistics.subscriberCount)) / 2})
            .attr('height', function(d) {return nodeScale(parseInt(d.statistics.subscriberCount))})
            .attr('width', function(d) {return nodeScale(parseInt(d.statistics.subscriberCount))})
            .attr('clip-path', function(d) {return 'url(#clipGraphCircle' + d.index + ')'})
            .attr('xlink:href', function(d) {return d.image});

        

    }

    var enterLinks = function(selection) {
        selection.enter()
            .insert('line', '.node')
            .classed('link', true)
            .attr("stroke", app.colors.green)
            .attr('opacity', .5)
            .attr("fill", "none");

        updateLinks(selection);
    }

    var updateLinks = function(selection) {
        selection.transition().duration(100)
            .attr('stroke-width', function(d) {return d.weight});
    }

    var exitNodes = function(selection) {
        selection.exit().remove();
    }

    var exitLinks = function(selection) {
        selection.exit().remove();
    }

    Graph.render = function() {

        container.selectAll(".node")
            .call(initialPositions)
            .data(nodes, function(d) {return d.youtuber})
            .call(exitNodes)
            .call(enterNodes);

        container.selectAll(".link")
            .data(links, function(d) {return d.sourceIndex + ',' + d.targetIndex;})
            .call(enterLinks)
            .call(updateLinks)
            .call(exitLinks);

        node = container.selectAll(".node");
        link = container.selectAll(".link");

        force.nodes(nodes).links(links);
        force.start();

        return Graph;
    }


    /**
    force layout
    */

    var initialPositions = function(selection) {
        var old = {};
        _.each(selection.data(), function(d) {
            old[d.youtuber] = d;            
        });
        _.each(nodes, function(d) {
            if (old[d.youtuber]) {
                d.x = old[d.youtuber].x;
                d.y = old[d.youtuber].y;
            }
        });
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
        nodeScale = d3.scale.linear().domain([min, max]).range([30, 80]);
        nodes = value;
        return Graph;
    }

    Graph.links = function(value) {
        if (!arguments.length) return links;

        var max = _.chain(value).pluck('weight').max().value(),
            min = _.chain(value).pluck('weight').min().value(),
            nodeIndex = _.pluck(nodes, 'index');
        linkScale = d3.scale.log().domain([min, max]).range([1, 12]);
        links = _.chain(value).map(function(link) {
            var obj = {};
            obj.sourceIndex = link.source;
            obj.targetIndex = link.target;
            obj.source = _.indexOf(nodeIndex, link.source);
            obj.target = _.indexOf(nodeIndex, link.target);
            obj.weight = linkScale(link.weight);

            return obj;
        }).filter(function(link) {
            return nodes[link.source] && nodes[link.target];
        }).value();
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
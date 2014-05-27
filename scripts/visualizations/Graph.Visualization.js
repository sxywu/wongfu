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
    var color;
    var Graph = function(selection, d) {
        container = selection;
        color = function(youtuber) {
            return _.contains(app.youtubersWithVideo, youtuber) ? app.d3Colors(youtuber) : '#999';
        };

        force = d3.layout.force()
            .size([width, height])
            .charge(function(d) {
                return -Math.pow(nodeScale(d.subscribers), 2) / 4;
            })
            .linkDistance(function(d) {
                return (1 / linkScale(d.weight)) * 300;
            })
            .on('tick', forceTick);

        Graph.render();

        return Graph;

    }

    var enterNodes = function(selection) {
        node = selection.enter()
            .append('g').classed('node', true)
            .classed('fade', function(d) {return d.clicked || app.clicked})
            .classed('solid', function(d) {return d.clicked})
            .attr('id', function(d) {return d.youtuber})
            .call(force.drag)
            .on('mouseover', mouseover)
            .on('mouseleave', mouseleave)
            .on('click', clickNode);

        text = node.append('g').classed('name', true)
            .classed('hidden', true)
            .attr('transform', function(d) {
                return 'translate(' + (nodeScale(d.subscribers) / 2 - 3) + ', 0)';
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
            .attr('fill', function(d) {return color(d.youtuber)});

        node.append('circle')
            .attr('r', function(d) {return nodeScale(d.subscribers) / 2 + 3})
            .attr('fill', 'white')
            .attr('stroke', function(d) {return color(d.youtuber)})
            .attr('stroke-width', 3);

        node.append('defs')
            .append('clipPath').attr('id', function(d) {
                return 'clipGraphCircle' + d.index;
            }).append('circle')
            .attr('r', function(d) {return nodeScale(d.subscribers) / 2});
        node.append('image')
            .attr('x', function(d) {return -nodeScale(d.subscribers) / 2})
            .attr('y', function(d) {return -nodeScale(d.subscribers) / 2})
            .attr('height', function(d) {return nodeScale(d.subscribers)})
            .attr('width', function(d) {return nodeScale(d.subscribers)})
            .attr('clip-path', function(d) {return 'url(#clipGraphCircle' + d.index + ')'})
            .attr('xlink:href', function(d) {return d.image});

    }

    var enterLinks = function(selection) {
        selection.enter()
            .insert('path', '.node')
            .classed('link', true)
            .classed('fade', function(d) {return d.source.clicked || app.clicked})
            // .classed('solid', function(d) {return d.source.clicked})
            .attr("stroke", function(d) {return color(d.source.youtuber)})
            .attr('stroke-linecap', 'round')
            .attr('opacity', .75)
            .attr("fill", "none");

        updateLinks(selection);
    }

    var updateLinks = function(selection) {
        selection.transition().duration(100)
            .attr('stroke-width', function(d) {return linkScale(d.weight)});
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
            .data(links, function(d) {return d.source.youtuber + ',' + d.target.youtuber;})
            .call(enterLinks)
            .call(updateLinks)
            .call(exitLinks);

        node = container.selectAll(".node");
        link = container.selectAll(".link");

        force.nodes(nodes).links(links);
        force.start();

        return Graph;
    }


    Graph.position = function(x, y) {
        container.attr('transform', 'translate(' + x + ',' + y + ')');
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
        link.attr('d', function(d) {
            var x1 = d.source.x,
                x2 = d.target.x,
                y1 = d.source.y,
                y2 = d.target.y,
                dx = x2 - x1,
                dy = y2 - y1,
                dist = Math.sqrt(dx * dx + dy * dy),
                c1x = dist / 4,
                cy = -c1x * (3/4),
                c2x = dist - c1x;

            return 'M0,0C' + c1x + ',' + cy + ' ' + c2x + ',' + cy + ' ' + dist + ',0';
        }).attr('transform', function(d) {
            var x1 = d.source.x,
                x2 = d.target.x,
                y1 = d.source.y,
                y2 = d.target.y,
                dx = x2 - x1,
                dy = y2 - y1,
                angle;
            angle = Math.atan(dy / dx);
            angle = angle * (180 / Math.PI);

            if (x1 > x2) {
                angle = 180 + angle;
            }

            return 'translate(' + x1 + ' ' + y1 + ')rotate(' + angle + ')';
        });;
    }

    /**
    events
    */
    var mouseover = function() {

    }

    var mouseleave = function() {

    }

    var clickNode = function(d) {
        if (app.clicked) {
            d3.select('.node.solid').call(Graph.hideName);
            d3.selectAll('.solid').classed('fade', true)
                .classed('solid', false);
        } else if (!app.clicked) {
            d3.selectAll('.node, .link, .videoLine').classed('fade', true)
                .classed('solid', false);
        }

        if (app.clicked === d) {
            d3.selectAll('.fade').classed('fade', false)
                .classed('solid', false);
            d.youtuber.clicked = false;
            app.clicked = false;
        } else {
            d3.selectAll('#' + d.youtuber).classed('fade', false)
                .classed('solid', true);
            d3.select('.node#' + d.youtuber)
                .call(Graph.showName);

            d.youtuber.clicked = true;
            if (app.clicked) app.clicked.clicked = false;
            app.clicked = d;
        }
    }

    Graph.showName = function(node) {
        node.select('.name')
            .classed('active', true)
            .classed('hidden', false)
            .classed('solid', true);
    }

    Graph.hideName = function(node) {
        node.select('.name')
            .classed('hidden', true)
            .classed('active', false)
            .classed('solid', false);
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
        nodeScale = d3.scale.linear().domain([min, max]).range([25, 60]);
        nodes = value;
        return Graph;
    }

    Graph.links = function(value) {
        if (!arguments.length) return links;

        // var max = _.chain(value).pluck('weight').max().value(),
        //     min = _.chain(value).pluck('weight').min().value();
        // linkScale.domain([min, max]);
        // links = _.chain(value).map(function(link) {
        //     var obj = {};
        //     obj.sourceIndex = link.source;
        //     obj.targetIndex = link.target;
        //     obj.source = _.indexOf(nodeIndex, link.source);
        //     obj.target = _.indexOf(nodeIndex, link.target);
        //     obj.weight = linkScale(link.weight);

        //     return obj;
        // }).filter(function(link) {
        //     return nodes[link.source] && nodes[link.target];
        // }).value();
        links = value;
        return Graph;
    }

   Graph.linkScale = function(value) {
        if (!arguments.length) return linkScale;
        linkScale = value;
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
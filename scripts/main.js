require.config({
    baseUrl: "scripts/contrib/",
    paths: {
        "app": "..",
        "underscore": "underscore",
        "backbone": "backbone",
        "bootstrap": "bootstrap",
        "d3": "d3.v3",
        "d3.tip": "d3.tip"
    },
    shim: {
        "underscore": {
            exports: "_"
        },
        "backbone": {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        bootstrap: {
            deps: ["jquery"]
        },
        "d3": {
            exports: "d3"
        },
        "d3.tip": {
            deps: ["d3"],
            exports: "d3.tip"
        }
    }
});

require([
    "jquery",
    "underscore",
    "backbone",
    "d3",
    "app/visualizations/Graph.Visualization"
], function(
    $,
    _,
    Backbone,
    d3,
    GraphVisualization
) {
    app = {};
    app.colors = {blue: "#3B8686", green: "#E0E4CC", orange: "#F38630"};
    d3.json('data/nodes.json', function(nodes) {
        d3.json('data/links.json', function(links) {
            nodes = _.sortBy(nodes, function(node) {
                return node.index;
            });

            var width = $("svg#graphSVG").width(),
                height = $("svg#graphSVG").height(),
                graph = GraphVisualization()
                    .nodes(nodes).links(links)
                    .width(width).height(height);
            d3.select('svg#graphSVG').append('g').call(graph);

            console.log(width, height);

        });
        
        d3.json('youtubers/wongfuproductions.json', function(videos) {
            console.log(videos);
        });
        
    });
});
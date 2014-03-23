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
    "app/visualizations/Graph.Visualization",
    "app/visualizations/Videos.Visualization"
], function(
    $,
    _,
    Backbone,
    d3,
    GraphVisualization,
    VideosVisualization
) {
    app = {};
    app.colors = {blue: "#3B8686", green: "#E0E4CC", orange: "#F38630"};
    app.d3Colors = d3.scale.category10();
    app.youtubers = ["wongfuproductions", "davidchoimusic", "kevjumba", "pauldateh", "kinagrannis"];
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

        });
        
        var videos = [],
            visualize = _.after(app.youtubers.length, function(v) {
                var vis = VideosVisualization().videos(v);
                d3.select('svg#videoSVG').append('g').call(vis);
            });
        // _.each(app.youtubers, function(youtuber) {
        //     if (youtuber === "last") {
        //         var vis = VideosVisualization().videos(videos);
        //         d3.select('svg#videoSVG').append('g').call(vis);
        //         return;
        //     }
        //     d3.json('youtubers/' + youtuber + '.json', function(video) {
        //         video = _.sortBy(video, function(v) {
        //             return v.published;
        //         });
        //         video.youtuber = youtuber;
        //         videos.push(video);
        //     });
        // });

        _.each(app.youtubers, function(youtuber) {
            d3.json('youtubers/' + youtuber + '.json', function(video) {
                video = _.sortBy(video, function(v) {
                    return v.published;
                });
                videos.push({
                    video: video,
                    youtuber: youtuber
                });
                visualize(videos);

                $('.youtuber').append('<div style="color:' + app.d3Colors(youtuber) + '">' + youtuber + '</div>');
                // var video = VideosVisualization().videos(videos);

                // d3.select('svg#videoSVG').append('g').call(video);
            });
        });
        

        // d3.json('youtubers/davidchoimusic.json', function(videos) {
        //     videos = _.sortBy(videos, function(video) {
        //         return video.published;
        //     });
        //     var video = VideoVisualization().youtuber('davidchoimusic').videos(videos);

        //     d3.select('svg#videoSVG').append('g').call(video);
        // })
        
    });
});
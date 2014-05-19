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
    "app/views/App.View",
    "app/visualizations/Graph.Visualization"
], function(
    $,
    _,
    Backbone,
    d3,
    AppView,
    GraphVisualization
) {
    app = {};
    // http://www.colourlovers.com/palette/3318893/S_i_r_e_n_s_S_o_n_g?widths=1
    app.colors = {blue: "#40738C", green: "#339999", orange: "#F38630"};
    app.d3Colors = d3.scale.category10();
    app.youtubers = ["wongfuproductions", "davidchoimusic", "kevjumba", "pauldateh", "kinagrannis"];
    app.timeFormat = d3.time.format('%B %d, %Y');
    app.padding = {top: 250, left: 250, right: 25, bottom: 0};
    app.videoSize = {min: 10, max: 100};

    var appView = new AppView();

    // for debugging
    window.appView = appView;
    // d3.json('data/nodes.json', function(nodes) {
        // d3.json('data/links.json', function(links) {
        //     nodes = _.sortBy(nodes, function(node) {
        //         return node.index;
        //     });

        //     var width = $("svg#graphSVG").width(),
        //         height = $("svg#graphSVG").height(),
        //         graph = GraphVisualization()
        //             .nodes(nodes).links(links)
        //             .width(width).height(height);
        //     d3.select('svg#graphSVG').append('g').call(graph);

        // });
        
        // var videos = [],
        //     visualize = _.after(app.youtubers.length, function(v) {
        //         var vis = VideosVisualization().videos(v);
        //         d3.select('svg#videoSVG').append('g').call(vis);
        //     });

        // _.each(app.youtubers, function(youtuber) {
        //     var model = new YoutuberModel({
        //         name: youtuber
        //     })
        //     model.fetch();
            // d3.json('youtubers/' + youtuber + '.json', function(video) {
            //     video = _.sortBy(video, function(v) {
            //         return v.published;
            //     });
            //     videos.push({
            //         video: video,
            //         youtuber: youtuber
            //     });
            //     visualize(videos);

            //     $('.youtuber').append('<div style="color:' + app.d3Colors(youtuber) + '">' + youtuber + '</div>');
            // });
    //     });
        
    // });
});
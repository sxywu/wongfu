define([
	"jquery",
	"underscore",
	"backbone",
	"d3",
    "app/collections/Youtubers.Collection",
    "app/collections/Videos.Collection",
    "app/visualizations/Videos.Visualization",
    "app/visualizations/Graph.Visualization"
], function(
	$,
	_,
	Backbone,
	d3,
	YoutubersCollection,
	VideosCollection,
	VideosVisualization,
	GraphVisualization
) {
	return Backbone.View.extend({
		initialize: function() {
			this.youtubers = new YoutubersCollection();
		    this.videos = new VideosCollection([], {youtuber: "wongfuproductions"});
		    
		    var render = _.after(3, _.bind(this.render, this));
		    this.videos.fetch({success: render});
		    this.youtubers.fetch({success: render});
		    var that = this;
		    d3.json('data/links.json', function(response) {
		    	that.links = response;
		    	render();
		    });

			var scroll = _.throttle(_.bind(this.onWindowScroll, this), 200);
		    $(window).scroll(scroll);
		    // this.youtubers.on('reset', calculateTime);
		    // this.videos.on('reset', calculateTime);

		    // this.videos.on('reset', function() {console.log('hi')});

		    
		},
		render: function() {

			var videoWidth = $('#videoSVG').width(),
				videoHeight = $('#videoSVG').height(),
				graphWidth = $('#graphSVG').width(),
				graphHeight = $('#graphSVG').height();
			this.videosVisualization = VideosVisualization()
				.videos([{videos: this.videos.toJSON(), youtuber: "wongfuproductions"}])
				.width(videoWidth).height(videoHeight)
				.yScale(this.videos.minViews(), this.videos.maxViews())
				.timeScale(this.videos.minDate(), this.videos.maxDate());
			d3.select('#videoSVG').append('g').call(this.videosVisualization);

			this.graphVisualization = GraphVisualization()
				.width(graphWidth).height(graphHeight);
			d3.select('#graphSVG').append('g').call(this.graphVisualization);

			this.calculateTime();
			this.onWindowScroll();
			
		},
		calculateTime: function() {
			var scale = this.videosVisualization.timeScale(),
				videos = this.videos.groupBy(function(video) {
					return scale(new Date(video.get('publishedDate').getFullYear(), video.get('publishedDate').getMonth()));
				}),
				youtubers = this.youtubers.groupBy(function(youtuber) {
					return scale(new Date(youtuber.get('joinedDate').getFullYear(), youtuber.get('joinedDate').getMonth()));
				}),
				links = _.chain(this.links)
				// .map(function(link) {
				// 	return _.chain(link.weight).sortBy(function(date) {
				// 			return date;
				// 		}).map(function(date, i) {
				// 			if (link.source < 0 || _.isObject(link.target)) {

				// 			console.log(link, i, date);
				// 			}
				// 			return {source: link.source, target: link.target, weight: i + 1, date: new Date(date)};
				// 		}).value();
				// 	}).flatten()
				.groupBy(function(link) {
						var date = new Date(link.date);
						return scale(new Date(date.getFullYear(), date.getMonth()));
					}).value();

			this.youtubersByTime = youtubers;
			this.videosByTime = videos;
			this.linksByTime = links;
			console.log(links);
		},
		onWindowScroll: function() {
			var left = $('.videos .border').offset().left,
				scale = this.videosVisualization.timeScale(),
				timeFormat = d3.time.format('%B %Y'),
				date = scale.invert(left),
				that = this,
				youtubers = _.chain(this.youtubersByTime).filter(function(youtuber, time) {
					time = parseInt(time);
					return time < left;
				}).flatten().map(function(youtuber) {
					return youtuber.toJSON();
				}).value(),
				links = _.chain(this.linksByTime).filter(function(link, time) {
					time = parseInt(time);
					return time < left;
				}).flatten().clone().value();

			console.log(timeFormat(date));
			$('.date').text(timeFormat(date));
			this.graphVisualization.nodes(youtubers).links(links).render();

		}
	});
})
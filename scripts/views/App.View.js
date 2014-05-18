define([
	"jquery",
	"underscore",
	"backbone",
	"d3",
    "app/collections/Youtubers.Collection",
    "app/collections/Videos.Collection",
    "app/visualizations/Timeline.Visualization",
    "app/visualizations/Graph.Visualization",
    "app/visualizations/Video.Visualization",
    "app/visualizations/Youtuber.Visualization"
], function(
	$,
	_,
	Backbone,
	d3,
	YoutubersCollection,
	VideosCollection,
	TimelineVisualization,
	GraphVisualization,
	VideoVisualization,
	YoutuberVisualization
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

		    this.prevTop = 0;
			var scroll = _.throttle(_.bind(this.onWindowScroll, this), 200);
		    $(window).scroll(scroll);
		    // this.youtubers.on('reset', calculateTime);
		    // this.videos.on('reset', calculateTime);

		    // this.videos.on('reset', function() {console.log('hi')});

		    
		},
		render: function() {

			var width = $('svg').width(),
				height = $('svg').height(),
				graphWidth = width / 3 * 2,
				graphHeight = $(window).height() / 3 * 2;
			this.timelineVisualization = TimelineVisualization()
				// .videos([{videos: this.videos.toJSON(), youtuber: "wongfuproductions"}])
				.width(width).height(height)
				
				.timeScale(this.youtubers.minJoined(), this.youtubers.maxJoined());
			this.timeline = d3.select('svg').append('g')
				.classed('timeline', true)
				.call(this.timelineVisualization);


			this.videoVisualization = VideoVisualization()
				.timeScale(this.timelineVisualization.timeScale())
				.sizeScale(this.videos.minViews(), this.videos.maxViews());
			this.timeline.selectAll('.video')
				.data(this.videos.filterByAssociations())
				.enter().append('g').classed('video', true)
				.call(this.videoVisualization);

			this.youtuberVisualization = YoutuberVisualization()
				.timeScale(this.timelineVisualization.timeScale())
				.radiusScale(this.youtubers.minSubscribers(), this.youtubers.maxSubscribers());
			this.timeline.selectAll('.youtuber')
				.data(this.youtubers.toJSON())
				.enter().append('g').classed('youtuber', true)
				.call(this.youtuberVisualization);

			this.graphVisualization = GraphVisualization()
				.width(graphWidth).height(graphHeight);
			d3.select('svg').append('g')
				.classed('graph', true)
				.call(this.graphVisualization);

			this.calculateTime();
			this.onWindowScroll();

			var that = this;
		    $(window).scroll(this.timelineVisualization.update);
		    $(window).scroll(function() {
		    	var left = width - graphWidth,
		    		top = top = $(window).scrollTop() + that.timelineVisualization.padding().top;
		    	that.graphVisualization.position(left, top);
		    });
			
		},
		calculateTime: function() {
			var scale = this.timelineVisualization.timeScale(),
				videos = this.videos.groupBy(function(video) {
					return scale(new Date(video.get('publishedDate').getFullYear(), video.get('publishedDate').getMonth(),
						video.get('publishedDate').getDate()));
				}),
				youtubers = this.youtubers.groupBy(function(youtuber) {
					return scale(new Date(youtuber.get('joinedDate').getFullYear(), youtuber.get('joinedDate').getMonth(),
						youtuber.get('joinedDate').getDate()));
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
						return scale(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
					}).value();

			this.youtubersByTime = youtubers;
			this.videosByTime = videos;
			this.linksByTime = links;
			console.log(links);
		},
		onWindowScroll: function() {
			// $('.content').empty();  // TODO: refactor

			var top = $(window).scrollTop() + this.timelineVisualization.padding().top,
				scale = this.timelineVisualization.timeScale(),
				date = scale.invert(top),
				that = this,
				youtubers = _.chain(this.youtubersByTime).filter(function(youtubers, time) {
					time = parseInt(time);
					// if (time < top) {
					// 	content = '';
					// 	_.each(youtubers, function(youtuber) {
					// 		content += youtuber.get('joinedDate').toDateString() + ': ' + youtuber.get('author') + ' joined<br>';
					// 	});
					// 	$('.youtuberContent').html(content);
					// }
					return time < top;
				}).flatten().map(function(youtuber) {
					return youtuber.toJSON();
				}).value(),
				links = _.chain(this.linksByTime).filter(function(link, time) {
					time = parseInt(time);
					return time < top;
				}).flatten().clone().value();

			this.timelineVisualization.update(top, app.timeFormat(date));
			// $('.date').text(timeFormat(date));
			// _.each(this.videosByTime, function(videos, time) {
			// 	time = parseInt(time);
			// 	if (time < top) {
			// 		content = '';
			// 		_.each(videos, function(video) {
			// 			content += video.get('publishedDate').toDateString() + ': ' + video.get('title') + '<br>';
			// 			if (!_.isEmpty(video.get('associations'))) {
			// 				content += '<div class="associations">';
			// 				_.chain(video.get('associations'))
			// 					.filter(function(association) {
			// 						return association !== "wongfuproductions";
			// 					})
			// 					.each(function(association, i, list) {
			// 						content += association;
			// 						if (i < list.length - 1) {
			// 							content += ', ';
			// 						}
			// 					}).value();
			// 				content += '</div>';
			// 			}
			// 		});
			// 		$('.videoContent').html(content);
			// 	}
			// });

			this.graphVisualization
				.nodes(youtubers).links(links).render();

			this.prevTop = top;

		}
	});
})
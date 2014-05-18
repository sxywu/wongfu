define([
	"jquery",
	"underscore",
	"backbone",
	"d3",
    // "app/collections/Youtubers.Collection",
    // "app/collections/Videos.Collection",
    "app/visualizations/Timeline.Visualization",
    "app/visualizations/Graph.Visualization",
    "app/visualizations/Video.Visualization",
    "app/visualizations/Youtuber.Visualization"
], function(
	$,
	_,
	Backbone,
	d3,
	// YoutubersCollection,
	// VideosCollection,
	TimelineVisualization,
	GraphVisualization,
	VideoVisualization,
	YoutuberVisualization
) {
	return Backbone.View.extend({
		initialize: function() {
			// this.youtubers = new YoutubersCollection();
		 //    this.videos = new VideosCollection([], {youtuber: "wongfuproductions"});
		    
		    // var processData = _.after(2, _.bind(this.processData, this));
		    // this.videos.fetch({success: render});
		    // this.youtubers.fetch({success: render});
		    
		    // d3.json('data/links.json', function(response) {
		    // 	that.links = response;
		    // 	render();
		    // });

			this.youtubers = [];
			this.videos = [];
			this.fetchData();
		    this.prevTop = 0;
			var scroll = _.throttle(_.bind(this.onWindowScroll, this), 200);
		    $(window).scroll(scroll);
		    // this.youtubers.on('reset', calculateTime);
		    // this.videos.on('reset', calculateTime);

		    // this.videos.on('reset', function() {console.log('hi')});

		    
		},
		fetchData: function() {
			// this nested shiz gone get uglyyyyyy
			var that = this;
			// first get all youtubers
		    d3.json('data/nodes.json', function(response) {
		    	
		    	that.youtubers = response;
		    	that.youtubersByName = {};
		    	_.each(that.youtubers, function(youtuber) {
		    		youtuber.joinedDate = new Date(youtuber.joined);
		    		that.youtubersByName[youtuber.youtuber] = youtuber;
		    	});

		    	console.log(that.youtubersByName)

		    	// get list of youtubers with video data
		    	d3.json('youtubers/youtubers.json', function(response) {
		    		// now get all the videos by that youtuber
		    		var calculateTime = _.after(response.length, _.bind(that.calculateTime, that));
		    		_.each(response, function(youtuber) {
		    			d3.json('youtubers/' + youtuber + '.json', function(videos) {
		    				var videosByAssociation = {};
		    				videos = _.chain(videos)
			    				.filter(function(video) {
			    					video.associations = _.without(video.associations, youtuber);
			    					return video.associations.length;
			    				}).sortBy(function(video) {
			    					_.each(video.associations, function(association) {
			    						if (videosByAssociation[association]) {
			    							videosByAssociation[association].push(video);
			    						} else {
			    							videosByAssociation[association] = [video];
			    						}
			    					});

			    					video.publishedDate = new Date(video.published);
			    					return video.publishedDate;
			    				}).value();


			    			that.youtubersByName[youtuber].videos = videosByAssociation;
			    			that.videos.push(videos);

			    			calculateTime();
		    			});
		    		});
		    	});
		    });
		},
		calculateTime: function() {
			this.videos = _.flatten(this.videos);
			console.log(this.videos);
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
		// calculateTime: function() {
		// 	var scale = this.timelineVisualization.timeScale(),
		// 		videos = this.videos.groupBy(function(video) {
		// 			return scale(new Date(video.get('publishedDate').getFullYear(), video.get('publishedDate').getMonth(),
		// 				video.get('publishedDate').getDate()));
		// 		}),
		// 		youtubers = this.youtubers.groupBy(function(youtuber) {
		// 			return scale(new Date(youtuber.get('joinedDate').getFullYear(), youtuber.get('joinedDate').getMonth(),
		// 				youtuber.get('joinedDate').getDate()));
		// 		}),
		// 		links = _.chain(this.links)
		// 		// .map(function(link) {
		// 		// 	return _.chain(link.weight).sortBy(function(date) {
		// 		// 			return date;
		// 		// 		}).map(function(date, i) {
		// 		// 			if (link.source < 0 || _.isObject(link.target)) {

		// 		// 			console.log(link, i, date);
		// 		// 			}
		// 		// 			return {source: link.source, target: link.target, weight: i + 1, date: new Date(date)};
		// 		// 		}).value();
		// 		// 	}).flatten()
		// 		.groupBy(function(link) {
		// 				var date = new Date(link.date);
		// 				return scale(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
		// 			}).value();

		// 	this.youtubersByTime = youtubers;
		// 	this.videosByTime = videos;
		// 	this.linksByTime = links;
		// 	console.log(links);
		// },
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
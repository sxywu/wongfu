define([
	"jquery",
	"underscore",
	"backbone",
	"d3",
    // "app/collections/Youtubers.Collection",
    // "app/collections/Videos.Collection",
    "app/visualizations/Timeline.Visualization",
    "app/visualizations/Graph.Visualization",
    "app/visualizations/Line.Visualization",
    "app/visualizations/Youtuber.Visualization",
    "app/visualizations/Video.Visualization"
], function(
	$,
	_,
	Backbone,
	d3,
	// YoutubersCollection,
	// VideosCollection,
	TimelineVisualization,
	GraphVisualization,
	LineVisualization,
	YoutuberVisualization,
	VideoVisualization
) {
	var videoVisualization = VideoVisualization(),
		lineVisualization = LineVisualization();
	return Backbone.View.extend({
		initialize: function() {

			this.youtubers = [];
			this.videos = [];

			this.last = 0;
			this.graphYoutubers = [];
			this.graphLinks = {};
			this.graphLast = -1;

			this.fetchData();
		  
		},
		fetchData: function() {
			// this nested shiz gone get uglyyyyyy
			var that = this;
			// first get all youtubers
		    d3.json('data/nodes.json', function(response) {
		    	
		    	that.youtubersByName = {};
		    	that.youtubers = _.sortBy(response, function(youtuber) {
		    		that.youtubersByName[youtuber.youtuber] = youtuber;

		    		youtuber.joinedDate = new Date(youtuber.joined);
		    		youtuber.subscribers = parseInt(youtuber.statistics.subscriberCount);
		    		return youtuber.joinedDate;
		    	});

		    	// _.each(that.youtubers, function(youtuber) {
		    	// 	that.youtubersByName[youtuber.youtuber] = youtuber;
		    	// });

		    	// get list of youtubers with video data
		    	d3.json('youtubers/youtubers.json', function(response) {
		    		// now get all the videos by that youtuber
		    		var calculateTime = _.after(response.length, _.bind(that.calculateTime, that));

		    		app.youtubersWithVideo = response;
		    		_.each(app.youtubersWithVideo, function(youtuber) {
		    			d3.json('youtubers/' + youtuber + '.json', function(videos) {
		    				var videosByAssociation = {};
		    				videos = _.chain(videos)
			    				.filter(function(video) {
			    					video.associations = _.without(video.associations, youtuber);
			    					return video.associations.length;
			    				}).sortBy(function(video) {
			    					_.each(video.associations, function(association) {
			    						if (!_.contains(_.keys(that.youtubersByName), association)) return;

			    						if (videosByAssociation[association]) {
			    							videosByAssociation[association].push(video);
			    						} else {
			    							videosByAssociation[association] = [video];
			    						}
			    					});

			    					video.youtuber = youtuber;
			    					video.youtuberObj = that.youtubersByName[youtuber];
			    					video.publishedDate = new Date(video.published);
						    		video.views = parseInt(video.views);
			    					return video.publishedDate;
			    				}).value();


			    			that.youtubersByName[youtuber].videos = videosByAssociation;

			    			videos = _.chain(videosByAssociation)
			    				.values().flatten().uniq().value();
			    			that.videos.push(videos);

			    			calculateTime();
		    			});
		    		});
		    	});
		    });
		},
		calculateTime: function() {
			this.videos = _.chain(this.videos).flatten()
				.sortBy(function(video) {
					return video.publishedDate;
				}).value();

			// var earliestTime = _.first(this.youtubers).joinedDate,
			// 	latestTime = _.last(this.videos).publishedDate,
			var earliestTime = new Date(2005, 10, 1),
				latestTime = new Date(),
				minViews = _.chain(this.videos).pluck('views').min().value(),
				maxViews = _.chain(this.videos).pluck('views').max().value(),
				minSubscribers = _.chain(this.youtubers).pluck('subscribers').min().value(),
				maxSubscribers = _.chain(this.youtubers).pluck('subscribers').max().value(),
				maxAssociations = _.chain(this.youtubers)
					.filter(function(youtuber) {
						return youtuber.videos;
					}).map(function(associations) {
						return _.chain(associations.videos).map(function(association) {return association.length})
							.max().value();
					}).max().value();
				height = $('svg').height(),
				that = this;
			this.timeScale = d3.time.scale().domain([earliestTime, latestTime]).range([app.padding.top, height + app.padding.top]);
			this.viewScale = d3.scale.linear().domain([minViews, maxViews]).range([app.padding.top, height + app.padding.top]);
			this.videoScale = d3.scale.linear().domain([minViews, maxViews]).range([app.videoScaleSize.min, app.videoScaleSize.max]);
			this.youtuberScale = d3.scale.linear().domain([minSubscribers, maxSubscribers]).range([app.youtuberScaleSize.min, app.youtuberScaleSize.max]);
			this.linkScale = d3.scale.log().domain([1, maxAssociations]).range([1, 16]);

			this.nodes = _.chain(this.videos)
				.union(this.youtubers)
				.sortBy(function(node) {
					return node.publishedDate || node.joinedDate;
				}).value();

			this.youtuberVideos = {};
			this.youtubersWithVideo = _.chain(app.youtubersWithVideo)
				.sortBy(function(youtuber) {
					return that.youtubersByName[youtuber].joinedDate;
				}).map(function(youtuber, i) {
					that.youtuberVideos[youtuber] = [];

					youtuber = that.youtubersByName[youtuber];
					youtuber.x = i * app.nodePadding.left;
					youtuber.y = that.timeScale(youtuber.joinedDate);
					return youtuber;
				}).value();

			_.each(this.videos, function(video) {
				video.y = that.timeScale(video.publishedDate);
				if (that.youtuberVideos[video.youtuber]) {
					that.youtuberVideos[video.youtuber].push(video);
				}
				_.each(video.associations, function(association) {
					if (that.youtuberVideos[association]) {
						that.youtuberVideos[association].push(video);	
					}
				});
			});

			this.youtuberVideos = _.map(this.youtuberVideos, function(videos, youtuber) {
				return {
					youtuber: that.youtubersByName[youtuber],
					videos: _.sortBy(videos, function(video) {return video.y})
				}
			});
			// _.each(this.youtuberVideos, function(d) {console.log(JSON.stringify(_.pluck(d.videos, 'y')))})
			// console.log(this.youtuberVideos);

			this.render();
		},
		render: function() {

			var width = $('svg').width(),
				height = $('svg').height(),
				graphWidth = width / 2,
				graphHeight = $(window).height() / 3 * 2,
				that = this;

			this.timelineVisualization = TimelineVisualization()
				.width(width).height(height)
				.timeScale(this.timeScale);
			this.timeline = d3.select('svg').append('g')
				.classed('timeline', true)
				.call(this.timelineVisualization);

			this.lineVisualization = LineVisualization()
				.timeScale(this.timeScale);
				// .sizeScale(this.videoScale);
			this.timeline.selectAll('.videoLine')
				.data(this.youtuberVideos)
				.enter().insert('path', '.marker')
					.classed('videoLine', true)
					.call(this.lineVisualization);

			this.youtuberVisualization = YoutuberVisualization()
				.timeScale(this.timeScale);
			this.timeline.selectAll('.youtuber')
				.data(this.youtubersWithVideo)
				.enter().insert('circle', '.marker')
					.classed('youtuber', true)
					.call(this.youtuberVisualization);

			this.videoVisualization = VideoVisualization();
			this.timeline.selectAll('.video')
                .data(this.videos)
                .enter().insert('rect', '.marker')
                    .classed('video', true)
                    .call(this.videoVisualization);

            var timelineWidth = (this.youtubersWithVideo.length - 1) * app.nodePadding.left
            	+ app.padding.left + app.padding.right;
            $('.timelineBG').css('width', timelineWidth);

			this.scrollEvents();
			
		},
		scrollEvents: function() {
			this.prevTop = 0;
		    $(window).scroll(_.bind(this.onWindowScroll, this));
		    $(window).scroll(this.timelineVisualization.update);
		    $(window).scroll(function() {
		    	var left = 0,
		    		top = top = $(window).scrollTop();
		    	// that.graphVisualization.position(left, top);
		    });
		},
		onWindowScroll: function() {
			// $('.content').empty();  // TODO: refactor

			var top = $(window).scrollTop() + app.padding.top,
				scale = this.timeScale,
				date = scale.invert(top),
				that = this;

			// if our current scrolltop is greater than our last
			// we're going down so we should be adding nodes
			// if (top >= this.last) {
			// 	while (this.graphLast < this.nodes.length) {
			// 		var node = this.nodes[this.graphLast + 1],
			// 			time = this.timeScale(node.joinedDate || node.publishedDate);

			// 		if (time >= top) break;

			// 		if (node.subscribers) {
			// 			// if it's a youtuber
			// 			this.graphYoutubers.push(node);
			// 		} else if (node.views) {
			// 			// else it's a video
			// 			var youtuber = this.youtubersByName[node.youtuber];
			// 			_.each(node.associations, function(association) {
			// 				if (that.youtubersByName[association]) {
			// 					var name = node.youtuber + ',' + association,
			// 						link = that.graphLinks[name];
			// 					if (link) {
			// 						link.weight += 1;
			// 					} else {
			// 						that.graphLinks[name] = {
			// 							source: youtuber,
			// 							target: that.youtubersByName[association],
			// 							weight: 1
			// 						}
			// 					}
			// 				}
			// 			});
			// 		}
			// 		this.graphLast += 1;
			// 	}

			// 	if (node && node.id) {
			// 		d3.select('.video#' + node.id).call(videoVisualization.click, 'timeline');
			// 	}

			// } else {
			// 	// otherwise it's scrolling back up so we should remove nodes
			// 	while (this.graphLast >= 0) {

			// 		var node = this.nodes[this.graphLast],
			// 			time = this.timeScale(node.joinedDate || node.publishedDate);

			// 		if (time <= top) break;

			// 		if (node.subscribers) {
			// 			this.graphYoutubers.pop();
			// 		} else if (node.views) {
			// 			var youtuber = this.youtubersByName[node.youtuber];
			// 			_.each(node.associations, function(association) {
			// 				if (that.youtubersByName[association]) {
			// 					var name = node.youtuber + ',' + association,
			// 						link = that.graphLinks[name];
			// 					if (link && (link.weight >= 1)) {
			// 						delete that.graphLinks[name];
			// 					} else if (link) {
			// 						link.weight -= 1;
			// 					}
			// 				}
			// 			});
			// 		}

			// 		this.graphLast -= 1;
			// 	}

				
			// }

			// this.last = top;
			// var node = this.nodes[this.graphLast];
			// if (node && node.id) {
			// 	d3.select('.video#' + node.id).call(videoVisualization.click, 'timeline');
			// }
			
			var links = _.values(this.graphLinks);
				// = _.chain(this.linksByTime).filter(function(link, time) {
				// 	time = parseInt(time);
				// 	return time < top;
				// }).flatten().clone().value();
			this.timelineVisualization.update(top, app.timeFormat(date));

			this.prevTop = top;

		}
	});
})
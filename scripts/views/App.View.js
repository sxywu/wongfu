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
		    
		    // this.youtubers.on('reset', calculateTime);
		    // this.videos.on('reset', calculateTime);

		    // this.videos.on('reset', function() {console.log('hi')});

		    
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
			this.videoScale = d3.scale.linear().domain([minViews, maxViews]).range([app.videoScaleSize.min, app.videoScaleSize.max]);
			this.youtuberScale = d3.scale.linear().domain([minSubscribers, maxSubscribers]).range([app.youtuberScaleSize.min, app.youtuberScaleSize.max]);
			this.linkScale = d3.scale.log().domain([1, maxAssociations]).range([1, 16]);

			this.nodesByTime = _.chain(_.union(this.videos, this.youtubers))
				.sortBy(function(node) {
					return node.publishedDate || node.joinedDate;
				}).groupBy(function(node) {
					var date = node.publishedDate || node.joinedDate;
					return that.timeScale(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
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
				graphHeight = $(window).height(),
				that = this;
			this.timelineVisualization = TimelineVisualization()
				// .videos([{videos: this.videos.toJSON(), youtuber: "wongfuproductions"}])
				.width(width).height(height)
				.timeScale(this.timeScale);
			this.timeline = d3.select('svg').append('g')
				.classed('timeline', true)
				.call(this.timelineVisualization);


			this.videoVisualization = VideoVisualization()
				.timeScale(this.timeScale)
				.sizeScale(this.videoScale);
			this.timeline.selectAll('.videoLine')
				.data(this.youtuberVideos)
				.enter().insert('g', '.marker')
					.classed('videoLine', true)
					.call(this.videoVisualization);

			this.youtuberVisualization = YoutuberVisualization()
				.timeScale(this.timeScale)
				.radiusScale(this.youtuberScale);
			this.timeline.selectAll('.youtuber')
				.data(this.youtubersWithVideo)
				.enter().insert('g', '.marker')
					.classed('youtuber', true)
					.call(this.youtuberVisualization);

			this.timeline.selectAll('.video')
				.data(this.videos)
				.enter().insert('circle', '.marker')
					.classed('.video', true)
					.attr('cx', function(d) {return d.youtuberObj.x})
					.attr('cy', function(d) {return d.y})
					.attr('r', 6)
					.attr('fill', function(d) {return app.d3Colors(d.youtuber)});

			this.graphVisualization = GraphVisualization()
				.linkScale(this.linkScale)
				.width(graphWidth).height(graphHeight);
			d3.select('svg').append('g')
				.classed('graph', true)
				.call(this.graphVisualization);

			// this.calculateTime();
			this.onWindowScroll();

			this.prevTop = 0;
			var scroll = _.throttle(_.bind(this.onWindowScroll, this), 200);
		    $(window).scroll(scroll);
		    $(window).scroll(this.timelineVisualization.update);
		    $(window).scroll(function() {
		    	var left = 0,
		    		top = top = $(window).scrollTop();
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

			var top = $(window).scrollTop() + app.padding.top,
				scale = this.timeScale,
				date = scale.invert(top),
				that = this,
				youtubers = [],
				links = {},
				that = this;
			_.some(this.nodesByTime, function(nodes, time) {
				time = parseInt(time);
				if (time < top) {
					_.each(nodes, function(node) {
						if (node.subscribers) {
							youtubers.push(node);
						} else if (node.views) {
							var youtuber = that.youtubersByName[node.youtuber];
							_.each(node.associations, function(association) {
								if (that.youtubersByName[association]) {
									var name = node.youtuber + ',' + association,
										link = links[name];
									if (link) {
										link.weight += 1;
									} else {
										links[name] = {
											source: youtuber,
											target: that.youtubersByName[association],
											weight: 1
										}
									}
								}
							});
						}
					});
				}
				// if (time < top) {
				// 	content = '';
				// 	_.each(youtubers, function(youtuber) {
				// 		content += youtuber.get('joinedDate').toDateString() + ': ' + youtuber.get('author') + ' joined<br>';
				// 	});
				// 	$('.youtuberContent').html(content);
				// }
				return time > top;
			});
			links = _.values(links);
				// = _.chain(this.linksByTime).filter(function(link, time) {
				// 	time = parseInt(time);
				// 	return time < top;
				// }).flatten().clone().value();
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
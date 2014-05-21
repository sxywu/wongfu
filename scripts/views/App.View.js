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
			    						if (!_.contains(_.keys(that.youtubersByName), association)) return;

			    						if (videosByAssociation[association]) {
			    							videosByAssociation[association].push(video);
			    						} else {
			    							videosByAssociation[association] = [video];
			    						}
			    					});

			    					video.youtuber = youtuber;
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
				height = $('svg').height(),
				that = this;
			this.timeScale = d3.time.scale().domain([earliestTime, latestTime]).range([app.padding.top, height + app.padding.top]);
			this.videoScale = d3.scale.linear().domain([minViews, maxViews]).range([app.videoScaleSize.min, app.videoScaleSize.max]);
			this.youtuberScale = d3.scale.linear().domain([minSubscribers, maxSubscribers]).range([app.youtuberScaleSize.min, app.youtuberScaleSize.max]);

			this.nodesByTime = _.chain(_.union(this.videos, this.youtubers))
				.sortBy(function(node) {
					return node.publishedDate || node.joinedDate;
				}).groupBy(function(node) {
					var date = node.publishedDate || node.joinedDate;
					return that.timeScale(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
				}).value();

			var groupedByTime = {},
				last,
				i = 0;
			_.each(this.nodesByTime, function(nodes, time) {
				time = parseInt(time);
				var height = _.reduce(nodes, function(memo, node) {
					node.y = time;
					return memo + (node.views ? app.videoSize : app.youtuberSize) + app.nodePadding.top + app.nodePadding.bottom;
				}, 0),
					top = time - (height / 2),
					bottom = time + (height / 2);

				if (!last || top > last.bottom) {
					var group = {
						top: top,
						bottom: bottom,
						last: last,
						nodes: nodes,
						height: height,
						min: time,
						max: time
					};
					groupedByTime[i] = group;
					last = group;
					i += 1;
				} else if (top < last.bottom) {
					var stop = false;
					while (!stop) {
						height = last.height + height;
						var middle = (last.min + time) / 2;
						top = middle - (height / 2);
						bottom = middle + (height / 2);
						nodes = _.union(last.nodes, nodes);

						last.top = top;
						last.bottom = bottom;
						last.nodes = nodes;
						last.height = height;
						last.max = time;

						// i -= 1;
						if (last.top < last.last.bottom) {
							last = last.last;
							i -= 1;
						} else {
							stop = true;
						}
					}
					
				}
				// before += height / 2;

				// if (nodes.length > 1) {
				// 	_.each(nodes, function(node, i) {
				// 		node.x = 0;
				// 		node.y = time;
				// 		node.imageY = (height / nodes.length) * (i - (nodes.length - 1) / 2);
				// 	});
				// } else {
				// 	nodes[0].x = 0;
				// 	nodes[0].y = time;
				// 	nodes[0].imageY = 0;
				// }
			});

			_.each(groupedByTime, function(group) {
				var length = group.nodes.length,
					middle = (group.top + group.bottom) / 2;
				_.each(group.nodes, function(node, i) {
					var height = (node.views ? app.videoSize : app.youtuberSize) + app.nodePadding.top + app.nodePadding.bottom;
					node.x = 0;
					node.imageY = middle + height * (i - (length - 1) / 2);
					console.log(node.imageY, node.y, node.imageY - node.y);
					node.imageY = node.imageY - node.y;
				});
			});
			this.render();
		},
		render: function() {

			var width = $('svg').width(),
				height = $('svg').height(),
				graphWidth = width / 3 * 2,
				graphHeight = $(window).height() / 3 * 2;
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
			this.timeline.selectAll('.video')
				.data(this.videos)
				.enter().insert('g', '.marker')
					.classed('video', true)
					.call(this.videoVisualization);

			this.youtuberVisualization = YoutuberVisualization()
				.timeScale(this.timeScale)
				.radiusScale(this.youtuberScale);
			this.timeline.selectAll('.youtuber')
				.data(this.youtubers)
				.enter().insert('g', '.marker')
					.classed('youtuber', true)
					.call(this.youtuberVisualization);

			this.graphVisualization = GraphVisualization()
				.width(graphWidth).height(graphHeight);
			// d3.select('svg').append('g')
			// 	.classed('graph', true)
			// 	.call(this.graphVisualization);

			// this.calculateTime();
			// this.onWindowScroll();

			// this.prevTop = 0;
			// var scroll = _.throttle(_.bind(this.onWindowScroll, this), 200);
		 //    $(window).scroll(scroll);
			var that = this;
		    $(window).scroll(this.timelineVisualization.update);
		    $(window).scroll(function() {
		    	var left = width - graphWidth,
		    		top = top = $(window).scrollTop() + app.padding.top;
		    	that.graphVisualization.position(left, top);
		    });
			
		},
		timelineForce: function() {
			var width = $('svg').width(),
				height = $('svg').height(),
				nodes = _.union(this.youtubers, this.videos),
				that = this,
				force = d3.layout.force()
					.nodes(nodes)
					.size([200, height])
					.charge(function(d) {
						var radius = (d.views ? that.videoScale(d.views) / 2 : that.youtuberScale(d.subscribers));
						console.log(radius);
						return -Math.pow(radius, 2.0) / 4;
					}).on('tick', function(e) {
						var k = e.alpha;

						_.each(nodes, function(node) {
							node.x += (node.ideal.x - node.x) * k;
							node.y += (node.ideal.y - node.y) * k;
						});
						// console.log(nodes);
					});

			// set initial position
			_.each(nodes, function(node) {
				node.ideal = {};
				node.x = node.ideal.x = 0;
				node.y = node.ideal.y = that.timeScale(node.publishedDate || node.joinedDate);
			});

			force.start();
			for (var i = 100; i > 0; --i) force.tick();
			force.stop();


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
				scale = this.timeScale,
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
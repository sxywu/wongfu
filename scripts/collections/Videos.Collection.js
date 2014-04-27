define([
	'jquery',
	'underscore',
	'backbone',
	'app/models/Video.Model'
], function(
	$,
	_,
	Backbone,
	VideoModel
) {
	return Backbone.Collection.extend({
		model: VideoModel,
		initialize: function(models, options) {
			this.youtuber = options.youtuber;
		},
		url: function() {
			return 'youtubers/' + this.youtuber + '.json';
		},
		comparator: 'published',
		minDate: function() {
			return this.first().get('publishedDate');
		},
		maxDate: function() {
			return this.last().get('publishedDate');
		},
		minViews: function() {
			return this.min(function(video) {return video.get('views')}).get('views');
		},
		maxViews: function() {
			return this.max(function(video) {return video.get('views')}).get('views');
		},
		filterByAssociations: function() {
			return _.filter(this.toJSON(), function(video) {return !_.isEmpty(video.associations)});
		}
	});
});
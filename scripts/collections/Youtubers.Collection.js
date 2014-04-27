define([
	'jquery',
	'underscore',
	'backbone',
	'app/models/Youtuber.Model'
], function(
	$,
	_,
	Backbone,
	YoutuberModel
) {
	return Backbone.Collection.extend({
		model: YoutuberModel,
		url: 'data/nodes.json',
		comparator: 'joined',
		minJoined: function() {
			return this.first().get('joinedDate');
		},
		maxJoined: function() {
			return this.last().get('joinedDate');
		},
		minSubscribers: function() {
			return this.min(function(model) {return model.get('statistics').subscriberCount; }).get('statistics').subscriberCount;
		},
		maxSubscribers: function() {
			return this.max(function(model) {return model.get('statistics').subscriberCount; }).get('statistics').subscriberCount;	
		}
	});
});
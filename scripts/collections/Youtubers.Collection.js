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
		comparator: 'joined'
	});
});
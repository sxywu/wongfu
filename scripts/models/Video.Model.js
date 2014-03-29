define([
	'jquery',
	'underscore',
	'backbone',
], function(
	$,
	_,
	Backbone
) {
	return Backbone.Model.extend({
		initialize: function() {
			this.attributes.views = parseInt(this.attributes.views);
			this.attributes.publishedDate = new Date(this.attributes.published);
		}
	});
})
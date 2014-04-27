define([
	"jquery",
	"underscore",
	"backbone"
], function(
	$,
	_,
	Backbone
) {
	return Backbone.Model.extend({
		initialize: function() {
			this.attributes.joinedDate = new Date(this.attributes.joined);
			this.attributes.statistics.subscriberCount = parseInt(this.attributes.statistics.subscriberCount);
			this.attributes.statistics.totalUploadViews = parseInt(this.attributes.statistics.totalUploadViews);
		}
	});
})
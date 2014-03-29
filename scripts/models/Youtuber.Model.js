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
		}
	});
})
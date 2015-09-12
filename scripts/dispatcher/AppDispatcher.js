var Dispatcher = require('flux').Dispatcher;
var _ = require('lodash');

module.exports = _.extend(new Dispatcher(), {

  handleServerAction(action) {
    var payload = {
      source: 'SERVER_ACTION',
      action: action
    };
    this.dispatch(payload);
  },

  handleViewAction(action) {
    var payload = {
      source: 'VIEW_ACTION',
      action: action
    };
    this.dispatch(payload);
  }

});

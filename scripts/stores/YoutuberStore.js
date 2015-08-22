var React = require('react');
var _ = require('lodash');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var youtuberNames = ["wongfuproductions", "davidchoimusic", "kevjumba", "pauldateh", "kinagrannis", "lilcdawg", "funemployed", "frmheadtotoe", "lanamckissack", "victorvictorkim", "nigahiga"];
var youtubers = {};

function setYoutubers(rawYoutubers) {
  _.each(rawYoutubers, (youtuberObj) => {
    if (!_.contains(youtuberNames, youtuberObj.youtuber)) return;
    youtubers[youtuberObj.youtuber] = youtuberObj;
  });
  console.log(youtubers)
}

// store information about the graph
// such as pan/zoom level or position of nodes
var YoutuberStore = assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  getYoutuberNames() {
    return youtuberNames;
  }
});

YoutuberStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.actionType) {
    case Constants.GET_YOUTUBERS_SUCCESS:
      setYoutubers(action.data.response);
      break;

    default:
      return true;
  };

  YoutuberStore.emitChange();
});

module.exports = YoutuberStore; 
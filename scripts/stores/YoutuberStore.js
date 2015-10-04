var React = require('react');
var _ = require('lodash');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var youtuberNames = [];
var youtubers = {};

function setYoutuberNames(rawNames) {
  youtuberNames = _.map(rawNames, (tuple) => tuple[0]);
  youtuberNames.push("wongfuproductions");
}

function setYoutubers(rawYoutubers) {
  _.each(rawYoutubers, (youtuberObj, name) => {
    if (!_.contains(youtuberNames, name)) return;
    var youtuber = youtuberObj.snippet;
    youtuber.youtuber = name.toLowerCase();
    youtuber.joinedDate = new Date(youtuberObj.snippet.publishedAt);
    youtuber.image = youtuber.thumbnails.default.url;
    youtubers[name] = youtuber;
  });
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
  },
  getYoutubers() {
    return _.values(youtubers);
  }
});

YoutuberStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.actionType) {
    case Constants.GET_YOUTUBERS_SUCCESS:
      setYoutubers(action.data.response);
      break;

    case Constants.GET_YOUTUBER_NAMES_SUCCESS:
      setYoutuberNames(action.data.response);
      break;

    default:
      return true;
  };

  YoutuberStore.emitChange();
});

module.exports = YoutuberStore; 
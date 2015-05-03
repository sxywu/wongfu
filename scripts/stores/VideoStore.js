var React = require('react');
var _ = require('lodash');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var videos = [];

// store information about the graph
// such as pan/zoom level or position of nodes
var VideoStore = assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  getVideos() {
    return positions;
  }
});

VideoStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.actionType) {

    default:
      return true;
  };

  VideoStore.emitChange();
});

module.exports = VideoStore; 
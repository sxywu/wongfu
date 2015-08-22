var React = require('react');
var _ = require('lodash');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var YoutuberStore = require('./YoutuberStore');
var VideoStore = require('./VideoStore');

var CHANGE_EVENT = 'change';
var youtubers = {};
var lines = [];

var xPadding = 50;
var earliestTime = new Date(2005, 10, 1);
var latestTime = new Date();
var yScale = d3.time.scale().domain([earliestTime, latestTime]).range([500, 10000]);
function calculateLines() {
  // first set x-positions for each youtuber
  _.each(YoutuberStore.getYoutuberNames(), (youtuberName, i) => {
    youtubers[youtuberName] = {
      name: youtuberName,
      x: (i + 1) * xPadding
    };
  });

  // set x and y on each video
  lines = _.map(youtubers, (youtuberObj) => {
    var videos = _.map(VideoStore.getVideosByAssociation(youtuberObj.name), (video) => {
      return {
        x: youtubers[video.youtuber].x,
        y: yScale(video.publishedDate)
      };
    });

    return {
      name: youtuberObj.name,
      categoryX: youtuberObj.x,
      points: videos
    }
  });
};

// store information about the graph
// such as pan/zoom level or position of nodes
var GraphStore = assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  getLines() {
    return lines;
  }
});

GraphStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.actionType) {
    case Constants.GET_VIDEO_SUCCESS:
      AppDispatcher.waitFor([VideoStore.dispatchToken]);
      calculateLines();
      break;

    default:
      return true;
  };

  GraphStore.emitChange();
});

module.exports = GraphStore; 
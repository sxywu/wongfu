var React = require('react');
var _ = require('lodash');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var YoutuberStore = require('./YoutuberStore');

var CHANGE_EVENT = 'change';

var allYoutubers = YoutuberStore.getYoutuberNames();
var allVideos = [];
var videosByYoutuber = {};
var videosByAssociation = {};

function setVideosByYoutuber(youtuber, rawVideos) {
  videosByYoutuber[youtuber] = _.chain(rawVideos)
    .filter(function(video) {
      // only keep those videos that have at least one other youtuber
      video.associations = _.without(video.associations, youtuber);
      return video.associations.length;
    }).sortBy(function(video) {
      // first push this video into allVideos
      allVideos.push(video);
      // then keep track of it by association
      var allAssociations = _.union(video.associations, [youtuber]);
      _.each(allAssociations, function(association) {
        if (!_.contains(allYoutubers, association)) return;
        if (videosByAssociation[association]) {
          videosByAssociation[association].push(video);
        } else {
          videosByAssociation[association] = [video];
        }
      });

      video.youtuber = youtuber;
      video.publishedDate = new Date(video.published);
      video.views = parseInt(video.views);

      return video.publishedDate;
    }).value();
}

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
    return allVideos;
  },
  getVideosByYoutuber(youtuber) {
    return videosByYoutuber[youtuber];
  },
  getVideosByAssociation(association) {
    return videosByAssociation[association];
  }
});

VideoStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.actionType) {
    case Constants.GET_VIDEO_SUCCESS:
      setVideosByYoutuber(action.data.youtuber, action.data.response);
      break;

    default:
      return true;
  };

  VideoStore.emitChange();
});

module.exports = VideoStore; 
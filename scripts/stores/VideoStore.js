var React = require('react');
var _ = require('lodash');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var YoutuberStore = require('./YoutuberStore');

var CHANGE_EVENT = 'change';

var allYoutubers = [];
var allYoutubersBack = [];
var youtuberAffliates = {};
var allVideos = [];
var videosByYoutuber = {};
var videosByAssociation = {};

var minViews = 500000;

function setYoutuberAffiliates(rawAffiliates) {
  _.each(rawAffiliates, (affiliates, youtuber) => {
    youtuberAffliates[youtuber] = _.map(affiliates, (affiliate) => affiliate.toLowerCase());
  });
}

function setVideosByYoutuber(youtuber, rawVideos) {
  videosByYoutuber[youtuber] = _.chain(rawVideos.videos)
    .filter(function(video) {
      // only keep those videos that have at least one other
      // youtube channel it's not affliated with
      video.associations = _.chain(video.associations)
        .map((association) => association.toLowerCase())
        .filter((association) => {
          return association !== youtuber &&
            !_.includes(youtuberAffliates[youtuber], association);
        }).uniq().value();
      video.views = parseInt(video.statistics.viewCount);
      return video.associations.length && video.views >= minViews;
    }).sortBy(function(video) {
      // first push this video into allVideos
      allVideos.push(video);
      // then keep track of it by association
      var allAssociations = _.union(video.associations, [youtuber]);
      _.each(allAssociations, function(association) {
        if (!_.includes(allYoutubers, association)) return;
        if (videosByAssociation[association]) {
          videosByAssociation[association].push(video);
        } else {
          videosByAssociation[association] = [video];
        }
      });

      video.videoId = video.id.videoId;
      video.title = video.snippet.title;
      video.youtuber = youtuber;
      video.publishedDate = new Date(video.snippet.publishedAt);
      video.image = video.snippet.thumbnails.medium;

      return video.publishedDate;
    }).value();
}

function setVideoIds() {
  allVideos = _.chain(allVideos)
    .sortBy((video) => video.publishedDate)
    .map((video, id) => {
      video.id = id + 1;
      return video;
    }).value();
    console.log(allVideos.length)
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
      allYoutubersBack.push(action.data.youtuber);
      setVideosByYoutuber(action.data.youtuber, action.data.response);
      break;

    case Constants.GET_YOUTUBER_NAMES_SUCCESS:
      AppDispatcher.waitFor([YoutuberStore.dispatchToken]);
      allYoutubers = YoutuberStore.getYoutuberNames();
      break;

    case Constants.GET_YOUTUBER_AFFILIATES_SUCCESS:
      setYoutuberAffiliates(action.data.response);
      break;

    default:
      return true;
  };

  // only emit change if all videos are back
  if (allYoutubers.length === allYoutubersBack.length) {
    setVideoIds();
    VideoStore.emitChange();
  }
});

module.exports = VideoStore;

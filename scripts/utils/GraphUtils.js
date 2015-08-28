var React = require('react');
var _ = require('lodash');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var YoutuberStore = require('../stores/YoutuberStore');
var VideoStore = require('../stores/VideoStore');

// var youtubers = {};
// var lines = [];
// var videos = [];

var xPadding = 50;
var earliestTime = new Date(2005, 10, 1);
var latestTime = new Date();
var colorScale = d3.scale.category10();
var yScale = d3.time.scale().domain([earliestTime, latestTime]).range([0, 19500]);

var GraphUtils = {};

GraphUtils.calculateYoutubers = () => {
  var youtubers = {};
  // set x-positions for each youtuber
  _.chain(YoutuberStore.getYoutubers())
    .sortBy((youtuberObj) => {
      return youtuberObj.joinedDate;
    }).each((youtuberObj, i) => {
      youtubers[youtuberObj.youtuber] = {
        name: youtuberObj.youtuber,
        x: (i + 1) * xPadding,
        fill: colorScale(youtuberObj.youtuber),
        data: youtuberObj
      };
    }).value();

  return youtubers;
}

GraphUtils.calculateLines = (youtubers) => {
  // set x and y on each video
  return _.map(youtubers, (youtuberObj) => {
    var videos = [{
      id: 0,
      x: youtubers[youtuberObj.name].x,
      y: yScale(youtuberObj.data.joinedDate)
    }];

    _.chain(VideoStore.getVideosByAssociation(youtuberObj.name))
      .sortBy((video) => video.publishedDate)
      .each((video) => {
        videos.push({
          id: video.id,
          x: youtubers[video.youtuber].x,
          y: yScale(video.publishedDate)
        });
      }).value();

    return {
      fill: youtuberObj.fill,
      name: youtuberObj.name,
      categoryX: youtuberObj.x,
      points: videos
    }
  });
};

GraphUtils.calculateVideos = (youtubers) => {
  return _.map(VideoStore.getVideos(), (video) => {
    var youtuberObj = youtubers[video.youtuber];
    return {
      id: video.id,
      x: youtuberObj.x,
      y: yScale(video.publishedDate),
      fill: youtuberObj.fill
    };
  });
}

module.exports = GraphUtils; 
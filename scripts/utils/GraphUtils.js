var React = require('react');
var _ = require('lodash');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var YoutuberStore = require('../stores/YoutuberStore');
var VideoStore = require('../stores/VideoStore');

var xPadding = 75;
var earliestTime = new Date(2005, 10, 1);
var latestTime = new Date();
var colorScale = d3.scale.category10();
var vizHeight = 9500;
var yScale = d3.time.scale().domain([earliestTime, latestTime]).range([0, vizHeight]);

var GraphUtils = {};

GraphUtils.calculateYoutubers = () => {
  var youtubers = {};
  // set x-positions for each youtuber
  _.chain(YoutuberStore.getYoutubers())
    .sortBy((youtuberObj) => {
      return youtuberObj.joinedDate;
    }).each((youtuberObj, i) => {
      youtubers[youtuberObj.youtuber] = {
        order: i,
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

var videoScale = d3.scale.linear().range([8, 75]);
var volumeScale = d3.scale.linear().range([.15, 1]);
var mapScale = d3.scale.linear().domain([0, vizHeight]).range([0, window.innerHeight]);
GraphUtils.calculateVideos = (youtubers) => {
  var minViews = _.min(VideoStore.getVideos(), (video) => video.views).views;
  var maxViews = _.max(VideoStore.getVideos(), (video) => video.views).views;
  videoScale.domain([minViews, maxViews]);
  volumeScale.domain([minViews, maxViews]);

  return _.map(VideoStore.getVideos(), (video) => {
    var youtuberObj = youtubers[video.youtuber];
    var y = yScale(video.publishedDate);
    return {
      id: video.id,
      x: youtuberObj.x,
      y,
      sideY: mapScale(y),
      fill: youtuberObj.fill,
      size: videoScale(video.views),
      volume: volumeScale(video.views),
      data: video
    };
  });
};

var mapHeight = 300;
var opacityScale = d3.scale.linear().range([.01, .35]);
GraphUtils.calculateMiniMap = (youtubers, videos) => {
  var videosGrouped = _.groupBy(videos, (video) => mapHeight * Math.round(video.y / mapHeight));
  var minVideos = _.min(videosGrouped, (videos) => videos.length).length;
  var maxVideos = _.max(videosGrouped, (videos) => videos.length).length;
  opacityScale.domain([minVideos, maxVideos]);

  return _.map(videosGrouped, (videos, y1) => {
    var youtuberOfTheMonth = _.chain(videos)
      .groupBy((video) => video.data.youtuber)
      .sortBy((videos) => -videos.length).value();
    var y1 = parseInt(y1, 10);

    return {
      opacity: opacityScale(videos.length),
      fill: youtuberOfTheMonth[0][0].fill,
      y1,
      height: mapHeight,
      sideY1: mapScale(y1),
      sideHeight: mapScale(mapHeight),
      videos
    };
  });
};

GraphUtils.getSVGWidth = (lines) => {
  return (lines.length + 1) * xPadding;
};

GraphUtils.getMapScale = () => {
  return mapScale;
};

module.exports = GraphUtils; 
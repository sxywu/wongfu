var React = require('react');
var _ = require('lodash');
var d3 = require('d3/d3');
var ss = require('simple-statistics');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var YoutuberStore = require('../stores/YoutuberStore');
var VideoStore = require('../stores/VideoStore');

var xPadding = 75;
var earliestTime = new Date(2005, 10, 1);
var latestTime = new Date();
var colorScale = d3.scale.ordinal()
  // lighter colors
  .range(['#BD3939', '#E7A0B5', '#EBC06F', '#6FA874', '#8191C6', '#95619F', '#E8CAC3', '#D79C94']);
  // darker colors
  // .range(['#B21E1E', '#E683A6', '#F1C538', '#3A923C', '#4466BE', '#6E3380', '#E9C9C0', '#D37B6B']);
var vizHeight = 15000;
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
var opacityScale = d3.scale.linear().range([.15, .75]);
GraphUtils.calculateMiniMap = (youtubers, videos) => {
  var videoByDates = {};
  _.each(videos, (video) => {
    videoByDates[video.data.publishedDate.getTime()] = video;
  });
  var videoDates = _.chain(videoByDates).keys().map((date) => parseInt(date)).value();
  var groupByCkmeans = ss.ckmeans(videoDates, 30);
  var videosGrouped = _.map(groupByCkmeans, (group) => {
    return _.map(group, (videoTime) => videoByDates[videoTime]);
  });
  var minVideos = _.min(videosGrouped, (videos) => videos.length).length;
  var maxVideos = _.max(videosGrouped, (videos) => videos.length).length;
  opacityScale.domain([minVideos, maxVideos]);

  var prevVideo;
  return _.map(videosGrouped, (videos, i) => {
    var youtuberOfTheMonth = _.chain(videos)
      .groupBy((video) => video.data.youtuber)
      .sortBy((videos) => -videos.length).value();
    var y1, y2, height;

    if (!prevVideo) {
      // first video so just subtract 50 from the top video
      y1 = _.first(videos).y - 50;
      y2 = _.last(videos).y;
    } else {
      // all the middle videos groups
      y1 = (prevVideo.y2 - _.first(videos).y) / 2 + prevVideo.y2;
      y2 = _.last(videos).y;
      prevVideo.y2 = y1;
      prevVideo.height = prevVideo.y2 - prevVideo.y1;
      prevVideo.sideHeight = mapScale(prevVideo.height);

      if (videosGrouped.length - 1 === i) {
        // last video, so add 50 to the last video
        y2 = _.last(videos).y + 50;
        height = y2 - y1;
      }
    }

    prevVideo = {
      opacity: opacityScale(videos.length),
      fill: youtuberOfTheMonth[0][0].fill,
      y1, y2, height,
      sideY1: mapScale(y1),
      sideHeight: mapScale(height),
      videos
    };

    return prevVideo;    
  });
};

GraphUtils.calculateAnnotations = (youtubers, videos) => {
  var annotations = {};
  var collaborations = {};

  _.each(videos, video => {
    var youtuber = video.data.youtuber;
    if (!collaborations[youtuber]) {
      collaborations[youtuber] = {};
    }

    var collaborators = [youtuber];
    _.each(video.data.associations, association => {
      if (youtubers[association]) {
        // if association is one of the youtubers
        // see if it's the first time they collaborated
        if (!collaborations[youtuber][association]) {
          collaborations[youtuber][association] = 0;
          collaborators.push(association);
        }
        collaborations[youtuber][association] += 1;
      }
    });

    if (collaborators.length > 1) {
      annotations[video.id] = {
        type: 'collaboration',
        count: 1,
        collaborators,
      }
    }
  });

  console.log(videos, annotations)
  return annotations;
};

GraphUtils.getSVGWidth = (lines) => {
  return (lines.length + 1) * xPadding;
};

GraphUtils.getMapScale = () => {
  return mapScale;
};

module.exports = GraphUtils; 
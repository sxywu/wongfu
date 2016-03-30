var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');
var d3 = require('d3/d3');

module.exports = {

  getVideoForYoutuber(youtuber, callback) {
    d3.json('raw/' + youtuber + '.json', (response) => {
      AppDispatcher.dispatch({
        actionType: Constants.GET_VIDEO_SUCCESS,
        data: {youtuber, response}
      });

      callback && callback(response);
    });
  },

  getYoutubers(callback) {
    d3.json('raw/youtubers.json', (response) => {
      AppDispatcher.dispatch({
        actionType: Constants.GET_YOUTUBERS_SUCCESS,
        data: {response}
      });

      callback && callback(response);
    });
  },

  getYoutuberNames(callback) {
    d3.json('raw/associations.json', (response) => {
      AppDispatcher.dispatch({
        actionType: Constants.GET_YOUTUBER_NAMES_SUCCESS,
        data: {response}
      });

      callback && callback(response);
    });
  },

  getYoutuberAffiliates(callback) {
    d3.json('raw/affiliates.json', (response) => {
      AppDispatcher.dispatch({
        actionType: Constants.GET_YOUTUBER_AFFILIATES_SUCCESS,
        data: {response}
      });

      callback && callback(response);
    });
  },

};

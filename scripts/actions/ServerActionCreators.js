var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');

module.exports = {

  getVideoForYoutuber(youtuber, callback) {
    d3.json('youtubers/' + youtuber + '.json', (response) => {
      AppDispatcher.dispatch({
        actionType: Constants.GET_VIDEO_SUCCESS,
        data: {youtuber, response}
      });

      callback && callback(response);
    });
  },

  getYoutubers(callback) {
    d3.json('data/nodes.json', (response) => {
      AppDispatcher.dispatch({
        actionType: Constants.GET_YOUTUBERS_SUCCESS,
        data: {response}
      });

      callback && callback(response);
    });
  }

};

var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');

module.exports = {

  getVideos() {
    d3.json('youtubers/wongfuproductions.json', (response) => {
      console.log(response);
      
    });
  },

  getYoutubers() {

  }

};

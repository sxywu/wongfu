var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');

var ServerActionCreators = require('../actions/ServerActionCreators');

var App = React.createClass({
  componentWillMount() {
    ServerActionCreators.getVideos();
  },

  render() {
    return (
      <div />
    );
  }
});

module.exports = App;
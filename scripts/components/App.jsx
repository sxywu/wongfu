var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');
var d3 = require('d3/d3');

var VideoStore = require('../stores/VideoStore');
var YoutuberStore = require('../stores/YoutuberStore');
var GraphStore = require('../stores/GraphStore');

var ServerActionCreators = require('../actions/ServerActionCreators');

var App = React.createClass({
  getInitialState() {
    return {
      lines: []
    }
  },

  componentWillMount() {
    var youtubers = YoutuberStore.getYoutuberNames();
    ServerActionCreators.getYoutubers();
    _.each(youtubers, (youtuber) => {
      ServerActionCreators.getVideoForYoutuber(youtuber);
    });
    
    GraphStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    GraphStore.removeChangeListener(this.onChange);
  },
 
  onChange() {
    this.setState({
      lines: GraphStore.getLines()
    });
  },

  render() {
    return (
      <div />
    );
  }
});

module.exports = App;
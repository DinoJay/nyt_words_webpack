import React from "react";
import d3BubbleCloud from "../lib/d3BubbleCloud";

var BubbleCloud = React.createClass({
  getDefaultProps: function() {
    return {
      data: [],
      history: []
    };
  },

  componentDidMount: function() {
    var el = this.getDOMNode();
    d3BubbleCloud.create(el, this.props, this.props.callback);
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    console.log("this props history", this.props.history);
    d3BubbleCloud.update(el, this.props);
  },

  // componentWillUnmount: function() {
  //   var el = this.getDOMNode();
  //   //d3BubbleCloud.destroy(el);
  // },

  render: function() {
    return (
      <div id="bc-cont"></div>
    );
  }
});

export default BubbleCloud;

import React from "react";

import WordCloud from "./components/WordCloud";
import BubbleCloud from "./components/BubbleCloud";
import MyForm from "./components/MyForm";
import Breadcrumbs from "./components/Breadcrumbs";
import ArticleTable from "./components/ArticleTable";
import nyt_fetch_data from "./lib/nyt_api";
import d3 from "d3";

require("./style.less");

var fill = d3.scale.category20();

Array.prototype.last = function() {
  return this[this.length - 1];
};

var App = React.createClass({

  getInitialState: function() {
    return {
      cloud_data: [[]],
      history: [],
      articles: [[]],
      active: this.props.active
    };
  },

  getDefaultProps: function() {
    return {
      pageLimit: 100,
      year: 2016,
      month: 1,
      newsDesk: "National",
      active: "WordCloud"
    };
  },

  loadCloud: function(interval) {
    var counter = 0;
    var init_data = [];
    var t = setInterval(() => {
      if (counter / 1000 <= 20) init_data = ["Please", "Wait!"];
      else if (counter / 1000 <= 40) init_data = ["It", "Takes", "Time..."];
      else if (counter / 1000 <= 80) init_data = ["Don\"t", "Worry!"];
      else init_data = ["Almost", "Done", "Promised", ":-)"];

      init_data = init_data.map(function(d, i) {
        return {
          key: d,
          size: 100 + Math.random(),
          radius: 100 + Math.random(),
          color: fill(i)
        };
      });

      counter += 1000;
      console.log("INIT DATA");
      console.log(init_data);

      this.setState({
        cloud_data: [init_data]
      });
    }, interval);

    return t;
  },

  fetchData: function(year, month, newsDesk, timer) {

    nyt_fetch_data(year, month, newsDesk, this.props.pageLimit,
                   (articles, words) => {
      clearInterval(timer);

      this.setState( {
        cloud_data: [words],
        articles: [articles]
      }
      );
    });
  },

  componentDidMount: function() {
    var timer = this.loadCloud(1000);

    this.fetchData(this.props.year, this.props.month,
                   this.props.newsDesk, timer);
  },

  componentDidUpdate: function(prevProps, prevState) {
    // TODO
    if (this.state.year !== prevState.year ||
      this.state.month !== prevState.month ||
      this.state.newsDesk !== prevState.newsDesk) {

      // var t = this.loadCloud(1000);
    }
  },

  word_click_handler: function(d) {
    if (d.clicked) {
      console.log("clicked word", d);
      console.log("cloud data", this.state.cloud_data);
      var cur_cloud_data = this.state.cloud_data.last();

      // get all associated words to word d
      var context_cloud_data = d.context_words.map((key) => {
        return cur_cloud_data.find((word_obj) => {
          return (word_obj.key === key);
        });
      }).filter((word_obj) => {
        return word_obj;
      });

      var cloud_data = context_cloud_data.concat([d]);

      // TODO:
      // var cloud_data = context_cloud_data;
      // cloud_data.forEach((e) => {
      //   e.size = myScale(cloud_data, e.values.length, 40);
      // });

      this.setState(function(prevState) {
        return {
          cloud_data: prevState.cloud_data.concat([cloud_data]),
          history: prevState.history.concat([d.key]),
          articles: prevState.articles.concat([d.values])
        };
      });
    } else {

      this.setState(function(prevState) {
        var prev_data_index = prevState.history.indexOf(d.key);
        console.log("prev data index", prev_data_index);
        var old_cloud_data = prevState.cloud_data.slice(0,
                                                  prev_data_index + 1);
        var old_history = prevState.history.slice(0, prev_data_index);

        var old_articles = prevState.articles.slice(0,
                                                    prev_data_index + 1);

        return {
          cloud_data: old_cloud_data,
          history: old_history,
          articles: old_articles
        };
      });
    }
  },

  formChangeHandler: function(formState) {
    console.log("formState", formState);
    event.preventDefault();
    var timer = this.loadCloud(1000);
    this.fetchData(formState.year, formState.month,
                   formState.newsDesk, timer);
  },

  activeVisChangeHandler: function(activeVis) {
    this.setState(activeVis);
  },

  bcClickHandler: function(key) {
    this.setState(function(prevState) {
      var prev_data_index = prevState.history.indexOf(key);

      var old_cloud_data = prevState.cloud_data.slice(0,
                                           prev_data_index + 1);

      var old_history = prevState.history.slice(0, prev_data_index);

      return {
        cloud_data: old_cloud_data,
        history: old_history
      };
    });
  },

  render: function() {
    console.log("this.state.cloud_data", this.state.cloud_data);
    console.log("history", this.state.history);
    console.log("articles", this.state.articles.last());

    var Vis;
    if (this.state.active === "BubbleCloud") {
      Vis = <BubbleCloud data={this.state.cloud_data.last()}
        history={this.state.history}
        callback={this.word_click_handler}
        />;
    } else {
      Vis = <WordCloud data={this.state.cloud_data.last()}
        history={this.state.history}
        callback={this.word_click_handler}
        />;
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-5 gallery-info">
            <a href="/"><img src="/logo.png"></img></a>
          </div>
      </div>
        <div className="col-md-12">
          <MyForm
            changeHandler={this.formChangeHandler}
            activeVisChangeHandler={this.activeVisChangeHandler}
          />
        </div>

        <div className="col-md-12">
          <Breadcrumbs history={this.state.history}
            clickHandler={this.bcClickHandler}/>
        </div>

        <div className="col-md-12">
          {Vis}
        </div>

        <div className="col-md-12">
          <ArticleTable data={this.state.articles.last()}/>
        </div>
      </div>
    );
  }
});

export default App;

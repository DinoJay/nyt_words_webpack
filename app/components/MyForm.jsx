import React from "react";

// Store month names in array
var MyForm = React.createClass({

  getDefaultProps: function() {
    var today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      newsDesk: "National",
      active: "WordCloud",
      changeHandler: () => { return this.state; },
      activeChangeHandler: () => { return this.state; },
      activeVisChangeHandler: () => { return this.state; }
    };
  },

  getInitialState: function() {
    return {
      year: this.props.year,
      month: this.props.month,
      newsDesk: this.props.newsDesk,
      active: this.props.active
    };
  },

  activeChangeHandler: function(btnGroupState) {
    this.setState(btnGroupState);
    this.props.activeVisChangeHandler(btnGroupState);
  },

  handleSubmit: function(event) {
    event.preventDefault();
    this.props.changeHandler(this.state);
  },

  render: function() {
    return (
    <form onSubmit={this.handleSubmit} className="search-form">
      <fieldset>
        <legend>Search Articles</legend>
        <div className="row">
            <div className="form-group col-md-2">
                <label className="control-label">Year </label>
                <input type="number" className="form-control"
                  ref="start_year" defaultValue={this.props.year}
                  onChange = {(event) => {
                      this.setState({ year: event.target.value });
                    }
                  }
                  />
            </div>
            <div className="form-group col-md-2">
                <label className="control-label">Month </label>
                <select className="form-control"
                  defaultValue={this.props.month} ref="month"
                  onChange={ (event) => {
                      this.setState({ month: event.target.value });
                    }
                  }
                  >
                  <option value="1">Jan</option>
                  <option value="2">Feb</option>
                  <option value="3">Mar</option>
                  <option value="4">Apr</option>
                  <option value="5">May</option>
                  <option value="6">Jun</option>
                  <option value="7">Jul</option>
                  <option value="8">Aug</option>
                  <option value="9">Sep</option>
                  <option value="10">Oct</option>
                  <option value="11">Nov</option>
                  <option value="12">Dec</option>
                </select>
            </div>

            <div className="form-group col-lg-2 col-md-2">
                  <label className="control-label">Category </label>
                  <select className="form-control"
                    defaultValue={this.props.newsDesk}
                    onChange={ (event) => {
                      this.setState({
                        newsDesk: event.target.value });
                      }
                    }>
                     <option value="National">National</option>
                     <option value="Sports">Sports</option>
                     <option value="Foreign">Foreign</option>
                     <option value="Culture">Culture</option>
                     <option value="Society">Society</option>
                  </select>
              </div>

            <div className="form-group col-lg-2 col-md-2 push-down">
              <button type="submit"
                className="form-control btn btn-primary buttonSearch"
                bsStyle="primary">
                 Load Data <i className="glyphicon glyphicon-ok"></i>
              </button>
            </div>
          </div>
        </fieldset>
    </form>
      );
    }
});

var BtnGroup = React.createClass({

  getDefaultProps: () => {
    return {
      changeHandler: () => { return this.state; },
      active: null
    };
  },

  getInitialState: function() {
    return {
      active: this.props.active
    };
  },

  wordClickHandler: function() {
    this.setState({active: "WordCloud"});
    this.props.changeHandler({active: "WordCloud"});
  },

  bubbleClickHandler: function() {
    this.setState({active: "BubbleCloud"});
    this.props.changeHandler({active: "BubbleCloud"});
  },

  render: function() {
    var WordCloudBtnClass = "btn btn-default";
    var BubbleCloudClass = "btn btn-default";

    if (this.state.active === "WordCloud")
      WordCloudBtnClass = "btn btn-default active";
    else BubbleCloudClass = "btn btn-default active";

    return(
      <div className="form-group col-lg-2 col-md-2" >
        <label className="control-label">Type </label>
        <div className="btn-group" role="group"
          aria-label="..." >
          <button onClick={this.wordClickHandler} type="button"
            className={WordCloudBtnClass}>
            Words
          </button>
          <button onClick={this.bubbleClickHandler} type="button"
            className={BubbleCloudClass}>Bubbles</button>
        </div>
      </div>
    );
  }
});

export default MyForm;

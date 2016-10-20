import React from 'react';
import ContentRender from './ContentRender.jsx!';

class Dashboard extends React.Component{

  render() {

      let sticky_menu_style = {
          width:     "100%",
          minHeight: "1813px", 
          left:      "0px", 
          top:       "0px"
      };

      let brand_url_style = {
          marginLeft: "1.2rem"
      };

      let Home = React.createClass({
          render() {
              return (
                  <h5>Dashboard Content</h5>
              );
          }
      });

      return (
          <div className="ui grid full height">
              <div className="three wide column">
                  <div className="ui vertical inverted sticky menu" style={sticky_menu_style}>
                      {/**
                        * Menu starts here
                        **/}
                      <div className="item">
                        <a className="ui logo icon image teal header" href="/">
                          <i className="universal access icon"></i>
                        </a>
                        <a className="ui teal header" href="/" style={brand_url_style}>
                          <b>Workout CMS</b>
                        </a>
                      </div>
                  </div>
              </div>
              <div className="thirdteen wide column">
                  <ContentRender />
              </div>
          </div>
      );
  }

} //Dashboard

export default Dashboard
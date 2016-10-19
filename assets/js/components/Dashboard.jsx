define(['require', 'react', 'app/components/ContentRender'], function(require, React, ContentRender) {

  var Dashboard = React.createClass({

    render: function() {

        var sticky_menu_style = {
            width:  "100%",
            height: "1813px !important", 
            left:   "0px", 
            top:    "0px"
        };

        var brand_url_style = {
            marginLeft: "1.2rem"
        };

        var Home = React.createClass({
            render: function(){
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

  }); //Dashboard

  return Dashboard;

}); //define
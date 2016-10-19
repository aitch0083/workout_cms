define(['require', 'react', 'react-router', 'app/components/MainTable'], function(require, React, ReactRouter, MainTable) {

    var Router         = ReactRouter.Router;
    var Route          = ReactRouter.Route;
    var DefaultRoute   = ReactRouter.DefaultRoute;
    var browserHistory = ReactRouter.browserHistory;

    var App = React.createClass({
        render: function(){
            return (
                <MainTable actionModel="Article"></MainTable>
            );
        }
    });

    var ContentRender = React.createClass({

        render: function() {
            return (
                <Router history={browserHistory}>
                    <Route path="/dashboard" component={App} />
                </Router>
            );
        }

    }); //ContentRender

    return ContentRender;

}); //define
define(['require', 'react', 'superagent'], function(require, React, request) {

    var action_model_columns = [];

    var MainTable = React.createClass({

        getDefaultProps: function(){
            return {};
        },

        componentWillMount: function(){
            request.get('/articles/').end(function(err, res){
                console.info('/articles/', err, res);
            });
        },

        render: function() {

            return (
                <table className="ui green selectable celled table"></table>
            );
        }

    }); //MainTable

    return MainTable;

}); //define
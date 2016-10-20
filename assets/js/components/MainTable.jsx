import React from 'react';
import request from 'superagent';

let action_model_columns = [];

class MainTable extends React.Component {

    componentWillMount (){
        request.get('/articles/').end(function(err, res){
            console.info('/articles/', err, res);
        });
    }

    render () {
        return (
            <table className="ui green selectable celled table"></table>
        );
    }

};

export default MainTable;
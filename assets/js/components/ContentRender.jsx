import React from 'react';
import {Router, Route, DefaultRoute, browserHistory} from 'react-router';
import MainTable from './MainTable.jsx!';

const App = (props) => (
    <MainTable actionModel="Article">Main</MainTable>
);

class ContentRender extends React.Component{

    render () {
        return (
            <Router history={browserHistory}>
                <Route path="/dashboard" component={App} />
            </Router>
        );
    }

}; //ContentRender

export default ContentRender;
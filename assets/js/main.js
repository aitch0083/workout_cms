import React from 'react';
import ReactDom from 'react-dom';
import {Router, Route} from 'react-router';
import Dashboard from './components/Dashboard.jsx!';

const Main = (props) => (
	<Dashboard/>
);

ReactDom.render(<Main/>, document.getElementById('app-container'));
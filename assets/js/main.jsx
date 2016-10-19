requirejs.config({
    paths: {
        'react':             '/bower_components/react/react-with-addons',
        'reactdom':          '/bower_components/react/react-dom',
        'react-redux':       '/bower_components/react-redux/react-redux.min',
        'react-router':      '/bower_components/react-router/ReactRouter.min',
        'react-router-shim': '/js/react-router-shim',
        'jquery':            '/bower_components/jquery/dist/jquery',
        'jquery.timeago':    '/bower_components/jquery-timeago/jquery.timeago',  
        'showdown':          '/bower_components/showdown/compressed/Showdown',
        'superagent':        '/bower_components/superagent/superagent',
        'app':               '/js'
    },

    shim: {
        'jquery.timeago': ["jquery"],
        'react-router-shim': {
            exports: 'React'
        },
        'react-router': {
            deps:    ['react-router-shim'],
            exports: 'ReactRouter'
        }
    }
});

require(['jquery', 'react', 'reactdom', 'app/components/Dashboard'], 
  function ($, React, ReactDOM, Dashboard) {

  $(function whenDomIsReady() {

      var container = 'app-container';

      if($('#' + container).length){
        ReactDOM.render(
            <Dashboard></Dashboard>,
            document.getElementById(container)
        );
      }

      // as soon as this file is loaded, connect automatically, 
      // var socket = io.sails.connect();
      
      // console.log('Connecting to Sails.js...');

      // Subscribe to updates (a sails get or post will auto subscribe to updates)
      // socket.get('/comment', function (message) {
      //   console.log('Listening...' + message);

      //   // initialize the view with the data property
      //   ReactDOM.render(
      //     <CommentList url='/comment' data={message} />,
      //     document.getElementById('commentList')
      //   );

      // });

      // Expose connected `socket` instance globally so that it's easy
      // to experiment with from the browser console while prototyping.
      // /window.socket = socket;

  });
  

});
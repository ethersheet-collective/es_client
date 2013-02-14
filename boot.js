require.config({
  baseUrl: '/es_client/vendor',
  paths: {
    es_client: '..',
    test: '../test/unit'
  },
  shim:{
    'underscore':{
      exports: '_'
    },
    'backbone':{
      deps: ['underscore','jquery'],
      exports: 'Backbone'
    },
    'socket.io-client':{
      exports: 'io'
    },
    'sinon':{
      exports: 'sinon'
    },
    'validator':{
      exports: 'sanitize'
    },
    'es_expression':{
      exports: 'es_expression'
    },
    'sockjs-client':{
      exports: 'SockJS'
    }
  }
});

var express = require('express');
var _ = require('lodash');

var server = express();
server.use(express.urlencoded());

var redirects = [
    {req: '/lib/jquery.js', url: 'http://code.jquery.com/jquery-2.1.0.min.js'},
    {req: '/lib/handlebars.js', url: 'http://builds.handlebarsjs.com.s3.amazonaws.com/handlebars-v1.3.0.js'}
];

_(redirects).each(function(redirect) {
    server.get(redirect.req, function(req, res){
        res.redirect(redirect.url);
    });
});

// serve randomly changing data
server.get('/now', function(req, res){
    res.send(JSON.stringify({}));
});

server.set('port', process.env.PORT || 3000);

require('./app').load( server );

var server = server.listen(server.get('port'), function() {
    console.info('Express server listening on port ' + server.address().port);
    console.info(JSON.stringify(server.routes));
});

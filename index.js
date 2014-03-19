var express = require('express');

var server = express();
server.use(express.urlencoded());

server.get('/lib/jquery.js', function(req, res){
    res.redirect('http://code.jquery.com/jquery-2.1.0.min.js');
});
server.get('/lib/handlebars.js', function(req, res){
    res.redirect('http://builds.handlebarsjs.com.s3.amazonaws.com/handlebars-v1.3.0.js');
});

// serve randomly changing data
server.get('/now', function(req, res){
    res.send(JSON.stringify({}));
});

server.set('port', process.env.PORT || 3000);

require('./app').load( server )

var server = server.listen(server.get('port'), function() {
    console.info('Express server listening on port ' + server.address().port);
    console.info(JSON.stringify(server.routes));
});

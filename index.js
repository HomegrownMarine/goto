var express = require('express');

var server = express();
server.use(express.urlencoded());

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

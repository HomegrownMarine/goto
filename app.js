var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');

var debug = require('debug')('my-application');
var console = require('console');

var app = express();
app.use(express.urlencoded());
app.use(express.static('www'));
app.use(require('less-middleware')({ src: path.join(__dirname, 'www/css') }));

// serve randomly changing data
app.get('/now', function(req, res){
  	res.send(JSON.stringify({}));
});

//TODO: save history for myself
//TODO: set waypoint with global module
//TODO: 

function coordinate(str) {
//     m = re.search('(-?)(\d{,3}) (\d{,2}\.\d+)', string)
//     if m:
//         return (-1 if m.group(1) == '-' else 1) * (Decimal(m.group(2)) + Decimal(m.group(3))/Decimal('60'))
//     else:
//         return Decimal(string)
	return str;
}

app.get('/goto/history', function(req, res){
// var fileContents = fs.readFileSync(path,'utf8'); 
// var schema = JSON.parse(fileContents);

  	var dat = [{
        'name': 'B',
        'lat': 47.234534,
        'lon': -122.4235674,
    },{
        'name': 'C',
        'lat': 48.123434,
        'lon': -122.3456734,
    }];

  	res.send(JSON.stringify(dat));
});

var current = {
    'name': 'B',
    'lat': 47.234534,
    'lon': -122.4235674,
};

app.get('/goto/current', function(req, res){
  	res.send(JSON.stringify(current));
});

app.post('/goto/current', function(req, res){
	//add to history and save

	var dat = {
        'name': req.query.name,
        'lat': coordinate(req.query.lat),
        'lon': coordinate(req.query.long),
    };
    console.info('saveing', dat);

    current = dat;

  	res.send(JSON.stringify(current));
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.info('Express server listening on port ' + server.address().port);
    console.info(JSON.stringify(app.routes));
});


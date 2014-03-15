var express = require('express');
var path = require('path');
var fs = require('fs');


var console = require('console');

var current_waypoint_location = "/Users/grady/Projects/BoatComputer/goto/current.json";
var history_location = "/Users/grady/Projects/BoatComputer/goto/history.json";


var current = null;
var history = null;


//TODO: save history for myself
//TODO: set waypoint with global module
//TODO: 

//parse coordinate string in either decimal degrees or decimal 
//minutes.  Returns float
function coordinate(str) {
    var m = /(-?)(\d{0,3}) (\d{0,2}\.\d+)/.exec(str);
    var r;

    if (m)
        return (m[1]=='-'?-1:1)*parseInt(m[2])*parseFloat(m[3]/60);
    else
        return parseFloat(str);
}

function getCurrentWaypoint() {
    if ( current === null ) {
        //TODO:
        current = {
            'name': 'B',
            'lat': 47.234534,
            'lon': -122.4235674,
        };
        try {
            var fileContents = fs.readFileSync(current_waypoint_location,'utf8'); 
            current = JSON.parse(fileContents);
        }
        catch(e) {
            //no problem
        }
    }
    return current;
}

function setCurrentWaypoint(waypoint) {
    current = waypoint;
    addToHistory(waypoint);

    var jsonStr = JSON.stringify(waypoint);
    fs.writeFile(current_waypoint_location, jsonStr, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

function addToHistory(waypoint) {
    if( history === null) loadHistory();

    for (var i=0; i < history.length; i++) {
        if ( history[i].name === waypoint.name ) {
            history.splice(i,1);
        }
    }

    history.unshift(waypoint);

    //limit to 10
    history = history.slice(0,10);
    saveHistory();
}

function loadHistory() {
    history = [];
    try {
        var fileContents = fs.readFileSync(history_location,'utf8'); 
        history = JSON.parse(fileContents);
    }
    catch(e) {
        //no problem
    }
}

function saveHistory() {
    var jsonStr = JSON.stringify(history);
    fs.writeFile(history_location, jsonStr, function(err) {
        if (err) {
            console.log(err);
        }
    }); 
}

function getHistory() {
    if ( history === null ) {
        loadHistory();
    }

    return history;
}

exports.load = function(server) {
    console.info('dirname', __dirname);

    // server.use('/goto', require('less-middleware')(path.join(__dirname, 'www')));
    server.use('/goto', express.static(path.join(__dirname, 'www')));

    server.get('/goto/history', function(req, res){
        res.send(JSON.stringify(getHistory()));
    });

    server.get('/goto/current', function(req, res){
        res.send(JSON.stringify(getCurrentWaypoint()));
    });

    server.post('/goto/current', function(req, res){
        //add to history and save

        var dat = {
            'name': req.body.name,
            'lat': coordinate(req.body.lat),
            'lon': coordinate(req.body.lon),
        };

        setCurrentWaypoint(dat);
        res.send(JSON.stringify(current));
    });

    server.on('new:gprmc', function(msg) {
        // calculate waypoiny stuff and post it?
    });
};





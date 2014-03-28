var express = require('express');
var path = require('path');
var fs = require('fs');

var console = require('console');

var current = null;
var history = null;
var settings = null;

//TODO: calculate navigation data, and repost

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
    return current;
}

function setCurrentWaypoint(waypoint) {
    current = waypoint;
    addToHistory(waypoint);

    settings.set('goto:current-waypoint', waypoint);
}

function addToHistory(waypoint) {
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

function saveHistory() {
    settings.set('goto:waypoint-history', history); 
}

function getHistory() {
    return history;
}

exports.load = function(server, boat_data, settings_comp) {
    settings = settings_comp;

    history = settings.get('goto:waypoint-history') || [];
    current = settings.get('goto:current-waypoint') || {
            'name': 'B',
            'lat': 47.234534,
            'lon': -122.4235674,
        };;

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

    boat_data.on('data:rmc', function(msg) {
        var rmb = {
            type: 'rmb'

        };

        // TODO: calculate waypoiny stuff and broadcast it

        boat_data.broadcast(null, rmb);
    });

    return ['/goto', 'GoTo Waypoint'];
};





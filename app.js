//! GoTo/app.js
//! Runs simple goto app.  Enter a waypoint, and RMB navigation messages will
//! be injected into the NMEA network.
//! version : 0.8
//! homegrownmarine.com

var express = require('express');
var path = require('path');
var fs = require('fs');
var console = require('console');

var calcs = require('./calcs');

var current = null;
var history = null;
var settings = null;


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

    // get app settings
    history = settings.get('goto:waypoint-history') || [];
    current = settings.get('goto:current-waypoint') || {
            'name': 'B',
            'lat': 47.234534,
            'lon': -122.4235674,
        };;

    
    // add in app's static content
    server.use('/goto', express.static(path.join(__dirname, 'www')));

    
    // add in app's dynamic ajax handlers
    server.get('/goto/history', function(req, res){
        res.send(getHistory());
    });

    server.get('/goto/current', function(req, res){
        res.send(getCurrentWaypoint());
    });

    server.post('/goto/current', function(req, res){
        //add to history and save

        var waypoint = {
            'name': req.body.name,
            'lat': coordinate(req.body.lat),
            'lon': coordinate(req.body.lon),
        };

        setCurrentWaypoint(waypoint);
        res.send(current);
    });

    //TODO: allow no waypoint.
    boat_data.on('data:rmc', function(data) {
        if ( current === null ) return;
        try {
            var dtw = calcs.distance( data['lat'], data['lon'], current.lat, current.lon );
            var btw = calcs.bearing( data['lat'], data['lon'], current.lat, current.lon );
            var vmg = data['sog'] * Math.cos( calcs.rad(btw - data['cog']));
            
            //TODO: From waypoint
            //var xte = crossTrackError( fromWP.latitude, fromWP.longitude, data['lat'], data['lon'], destinationWP.latitude, destinationWP.longitude )
            var rmb = {
                type: 'rmb',
                to: current,
                from: {name:'X'}, //TODO:
                dtw: dtw,
                btw: btw,
                vmgw: vmg,
                dts: calcs.steer(btw, data.cog)>=0?'L':'R', //TODO:
                xte: 0
            };
            boat_data.broadcast(null, rmb);
        }
        catch(e) {
            console.error('error calculating nav', data, current, e);
        }
    });

    return {url:'/goto/', title:'GoTo Waypoint', priority: 1};
};





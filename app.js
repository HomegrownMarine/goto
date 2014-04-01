var express = require('express');
var path = require('path');
var fs = require('fs');

var console = require('console');

var current = null;
var history = null;
var settings = null;

//TODO: move calcs to util and add unit tests
var R = '3440.06479'; //radius of earth in nautical miles

function deg(radians) {
    return (radians*180/Math.PI + 360) % 360;
}    

function rad(degrees) {
    return degrees * Math.PI / 180;
}

//see: http://www.movable-type.co.uk/scripts/latlong.html
function distance(lat1, lon1, lat2, lon2) {
    lat1 = rad(lat1);
    lat2 = rad(lat2);
    lon1 = rad(lon1);
    lon2 = rad(lon2);

    var dLat = lat2-lat1,
        dLon = lon2-lon1;
    
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// distance(47.67962,-122.40555,47.67897, -122.3767); --> 1.1668

function bearing(lat1, lon1, lat2, lon2) {
    lat1 = rad(lat1)
    lat2 = rad(lat2)
    lon1 = rad(lon1)
    lon2 = rad(lon2)
    
    var dLon = lon2-lon1;
    
    var y = Math.sin(dLon)*Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    
    return deg( Math.atan2(y, x) );
}

function steer(hdg1, hdg2) {
    var diff = Math.abs(hdg1 - hdg2);
    if ( diff > 180 ) {
        diff = 360 - diff;
    }
    return diff;
}

function crossTrackError( fromLat, fromLon, lat, lon, toLat, toLan ) {
    var d = distance(fromLat, fromLon, toLat, toLan);
    var b1 = bearing(fromLat, fromLon, toLat, toLan);
    var b2 = bearing(fromLat, fromLon, lat, lon);
    return Math.asin(Math.sin(d/R) * Math.sin(rad(b2-b1))) * R;
}

// bearing(47.62455,-122.33107,47.63272,-122.34746) -> 306.49

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
            var dtw = distance( data['lat'], data['lon'], current.lat, current.lon );
            var btw = bearing( data['lat'], data['lon'], current.lat, current.lon );
            var vmg = data['sog'] * Math.cos(rad(btw - data['cog']));
            
            //var xte = crossTrackError( fromWP.latitude, fromWP.longitude, data['lat'], data['lon'], destinationWP.latitude, destinationWP.longitude )
            var rmb = {
                type: 'rmb',
                to: current,
                from: {name:'X'}, //TODO:
                dtw: dtw,
                btw: btw,
                vmgw: vmg,
                dts: steer(btw, data.cog)>=0?'L':'R', //TODO:
                xte: 0
            };
            boat_data.broadcast(null, rmb);
        }
        catch(e) {
            console.error('error calculating nav', data, current);
        }
    });

    return {url:'/goto/', title:'GoTo Waypoint', priority: 1};
};





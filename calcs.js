//TODO: move calcs to util and add unit tests

var R = '3440.06479'; //radius of earth in nautical miles

function deg(radians) {
    return (radians*180/Math.PI + 360) % 360;
}    

function rad(degrees) {
    return degrees * Math.PI / 180;
}

//parse coordinate string in either decimal degrees or decimal 
//minutes.  Returns float
function coordinate(str) {
    var m = /(-?)(\d{0,3}) (\d{0,2}\.\d+)/.exec(str);
    var r;

    if (m)
        return (m[1]=='-'?-1:1)*(parseInt(m[2])+parseFloat(m[3]/60));
    else
        return parseFloat(str);
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

function bearing(lat1, lon1, lat2, lon2) {
    lat1 = rad(lat1);
    lat2 = rad(lat2);
    lon1 = rad(lon1);
    lon2 = rad(lon2);
    
    var dLon = lon2-lon1;
    
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    return deg( Math.atan2(y, x) );
}

function steer(from, to) {
    var diff = to - from;
    if ( diff > 180 ) {
        diff = 360 - diff;
    }
    else if ( diff < -180 ) {
        diff = 360 + diff;
    }

    return diff;
}

function crossTrackError(fromLat, fromLon, lat, lon, toLat, toLan) {
    var d = distance(fromLat, fromLon, toLat, toLan);
    var b1 = bearing(fromLat, fromLon, toLat, toLan);
    var b2 = bearing(fromLat, fromLon, lat, lon);
    return Math.asin(Math.sin(d/R) * Math.sin(rad(b2-b1))) * R;
}

module.exports = {
    deg: deg,
    rad: rad,
    coordinate: coordinate,
    distance: distance,
    bearing: bearing,
    steer: steer,
    crossTrackError: crossTrackError
};

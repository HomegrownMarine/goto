//TODO: move calcs to util and add unit tests

var R = '3440.06479'; //radius of earth in nautical miles

var deg = exports.deg = function deg(radians) {
    return (radians*180/Math.PI + 360) % 360;
}    

var rad = exports.rad = function rad(degrees) {
    return degrees * Math.PI / 180;
}

//see: http://www.movable-type.co.uk/scripts/latlong.html
var distance = exports.distance = function distance(lat1, lon1, lat2, lon2) {
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

var bearing = exports.bearing = function bearing(lat1, lon1, lat2, lon2) {
    lat1 = rad(lat1)
    lat2 = rad(lat2)
    lon1 = rad(lon1)
    lon2 = rad(lon2)
    
    var dLon = lon2-lon1;
    
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    return deg( Math.atan2(y, x) );
}

var steer = exports.steer = function steer(hdg1, hdg2) {
    var diff = hdg1 - hdg2;
    if ( diff > 180 ) {
        diff = 360 - diff;
    }
    return diff;
}

var crossTrackError = exports.crossTrackError = function crossTrackError(fromLat, fromLon, lat, lon, toLat, toLan) {
    var d = distance(fromLat, fromLon, toLat, toLan);
    var b1 = bearing(fromLat, fromLon, toLat, toLan);
    var b2 = bearing(fromLat, fromLon, lat, lon);
    return Math.asin(Math.sin(d/R) * Math.sin(rad(b2-b1))) * R;
}

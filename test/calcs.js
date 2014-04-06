var assert = require("chai").assert;
var calcs = require('../calcs.js');

describe('goto', function(){
    it(' should calculate distance correctly', function(){
        assert.closeTo( calcs.distance(47.67962, -122.40555, 47.67897, -122.3767), 1.1668, .0001);
    });

    it(' should calculate bearing correctly', function(){
        assert.closeTo( calcs.bearing(47.63272, -122.34746, 47.62455, -122.33107), 126.48, .01);
        assert.closeTo( calcs.bearing(47.62455, -122.33107, 47.63272, -122.34746), 306.49, .01);
        assert.closeTo( calcs.bearing(47.63272, -122.34746, 47.641666, -122.34746), 0, .01);
        assert.closeTo( calcs.bearing(47.641666, -122.34746, 47.63272, -122.34746), 180, .01);
        assert.closeTo( calcs.bearing(47.63272, -122.33107, 47.63272, -122.33100), 90, .01);
        assert.closeTo( calcs.bearing(47.63272, -122.33107, 47.63272, -122.3311), 270, .01);
    });

    it(' should calculate steer correctly', function() {
        assert.equal( calcs.steer(355,5), 10 );
        assert.equal( calcs.steer(355,345), -10 );
        assert.equal( calcs.steer(5,15), 10 );
        assert.equal( calcs.steer(5,180), 175 );
        assert.equal( calcs.steer(5,190), 175 );
    });


    it(' should calculate xte correctly', function() {

    });
});

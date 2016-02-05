$.fn.clearLatLon = function() {
    return $(this)
        .each( function() {
            var textbox = $(this);
            var x = $('<a href="#" class="coord_clear pure-button" tabindex="-1">◀</a>')
                        .click( function() { 
                            var val = textbox.val();
                            var m = /(-?\d+[\. ])?(\d{0,2}.?)?(\d+)?/.exec(val);
                            
                            if ( m && m[3] )
                                val = m[1] + m[2];
                            else if ( m && m[2] )
                                val = m[1];
                            else
                                val = '';
                                
                            textbox.val(val).focus();
                            return false;
                        })
                        .insertAfter(textbox);
        });
};

(function() {
    /**
     * Decimal adjustment of a number.
     *
     * @param   {String}    type    The type of adjustment.
     * @param   {Number}    value   The number.
     * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number}            The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function(value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
})();

function updateCurrentDestination(data) {
    $(window).scrollTop(0);
    $('#current_waypoint .name').text(data.name);
    $('#current_waypoint .lat').text(data.lat);
    $('#current_waypoint .lon').text(data.lon);
}

function roundCoordinates(data) {
    data.lat = Math.round10(data.lat, -8);
    data.lon = Math.round10(data.lon, -8);
    return data;
}

// INIT
$(function() {    
    $('#lat,#lon').clearLatLon();

    var historyTemplate = Handlebars.compile($('#history_template').html());

    $.getJSON('/goto/history', function(data) {
        var historyHTML = [];

        for (var i=0; i < data.length; i++) {
            historyHTML.push( historyTemplate(roundCoordinates(data[i])) );
        }

        $('#wplist').html(historyHTML.join(''));
    });

    $.getJSON('/goto/current', function(data) {
        updateCurrentDestination(roundCoordinates(data));
    });

    //TODO: block UI for a second.
    //TODO: if lat/lon aren't well formed lat/lons, auto cleanup
    $('form').submit( function(e) {
        e.preventDefault();

        var data = $(this).serialize();
        var action = $(this).attr('action'); 
        $.ajax(action, {
            data: data,
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                roundCoordinates(data);
                updateCurrentDestination(data);

                $('#goto'+data.name).remove();

                $(historyTemplate(data)).prependTo( $('#wplist') );
            }
        });

        return false;
    });

    $('#wplist').on('click', 'a', function(e) {
        e.preventDefault();

        var el = $(this);
        var payload = el.attr('href').split('?');
        $.ajax(payload[0], {
            type: 'POST',
            data: payload[1],
            dataType: 'json',
            success: function(data) {
                updateCurrentDestination(data);

                el.closest('.menu_item').prependTo( $('#wplist') );
            }
        });
    });

    $('form input[name=name]').focus();
});

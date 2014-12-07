$.fn.clearLatLon = function() {
    return $(this)
        .each( function() {
            var textbox = $(this);
            var x = $('<a href="#" class="coord_clear" tabindex="-1">&lt;</a>')
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

function updateCurrentDestination(data) {
    $(window).scrollTop(0);
    $('h1 .name').text(data.name);
    $('h1 .lat').text(data.lat);
    $('h1 .lon').text(data.lon);
}

// INIT
$(function() {    
    $('#lat,#lon').clearLatLon();

    var historyTemplate = Handlebars.compile($('#history_template').html());

    $.getJSON('/goto/history', function(data) {
        var historyHTML = [];

        for (var i=0; i < data.length; i++) {
            historyHTML.push( historyTemplate(data[i]) );
        }

        $('#wplist').html(historyHTML.join(''));
    });

    $.getJSON('/goto/current', function(data) {
        updateCurrentDestination(data);
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
                updateCurrentDestination(data);

                $('li#goto'+data.name).remove();

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

                el.closest('li').prependTo( $('#wplist') );
            }
        });
    });

    $('form input[name=name]').focus();
});
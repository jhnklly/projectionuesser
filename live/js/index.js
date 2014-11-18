
var GJ_LYR, RESPONSE_JSON;
var PROJ4 = [];
var map;
var BOUNDS = new L.LatLngBounds([-44,-100],[45,100]); // latlng: sw, ne; Helsinki: 61N, Christchurch: 43.5S
// Anchorage: 61.23, -149.88
// Christchurch: -43.48, 172.65

var DEMO_JSON = null;

$(document).ready(function() {
    initMap();
    initControls();


});

function loadDemoData() {
    $.ajax({
        'async': false,
        'global': false,
        'url': 'data/projection_guesses.geojson',
        'dataType': "json",
        'success': function (data) {
            DEMO_JSON = data;

            GJ_LYR = L.geoJson(DEMO_JSON, {
                    style: invisible_style,
                    //style: simpler_style,
                    onEachFeature: mouseHandlers
                });
            GJ_LYR.addTo(map);        
        }
    });
}

var nam, val;
function createSieve(selector) {
    // not generalized for now
    //createSieve('#sieve');
    var sieve_html = '<ul>';
    sieve_html += '<li>ellipsoid';
        sieve_html += '<ul>';
        sieve_html += '<li><label><input type="checkbox" name="ellps" value="GRS80">GRS80</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="ellps" value="WGS84">WGS84</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="ellps" value="WGS72">WGS72</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="ellps" value="clrk80">clrk80</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="ellps" value="clrk66">clrk66</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="ellps" value="intl">intl</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="ellps" value="krass">krass</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="ellps" value="">all other</label></li>';
    sieve_html += '</li></ul>';
    sieve_html += '<li>projection type';
        sieve_html += '<ul>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="aea">albers equal area</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="cea">cylindrical equal area</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="laea">lambert azimuthal equal area</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="lcc">lambert conformal conic</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="longlat">longitude/latitude (geodetic)</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="stere">stereographic</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="tmerc">transverse mercator</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="utm">universal transverse mercator</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="aea">albers</label></li>';
        sieve_html += '<li><label><input type="checkbox" name="proj" value="">all other</label></li>';
    sieve_html += '</li></ul>';    
    console.log(sieve_html);
    $('#sieve').html(sieve_html);
    $(selector).html(sieve_html);

    var a, b;
    $('#sieve input').change(function(){

        console.log(this.checked);
        checkd = this.checked;
        map.removeLayer(GJ_LYR);
        
        //if ( this.checked ) {
        //if ( $(this).is(':checked') ) {
        nam = $(this).attr('name');
        val = $(this).attr('value');
        
        GJ_LYR = L.geoJson(RESPONSE_JSON, {
            style: highlight_style,
            onEachFeature: mouseHandlers,
            filter: function(feature, layer) {
                var bool = false, test = false;
                // search
                var plus_param_val = '+' + nam + '=' + val;
                console.log(plus_param_val, checkd);
                if ( feature.properties.proj4text.indexOf(plus_param_val) > -1 ) test = true;

                if ( test && checkd ) {
                    console.log('test and checkd');
                    bool = true;
                } else {
                    bool = false;
                }
                
                return bool;
            }
        });
        GJ_LYR.addTo(map);

    });

};


function initMap() {
    //map = L.mapbox.map('map', 'examples.map-y7l23tes')
    map = L.map('map')
    //.setView([3.8,-12.2], 3);
    .fitBounds(BOUNDS);
    
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/examples.map-y7l23tes/{z}/{x}/{y}.jpg').addTo(map)
    .on('load',function() {
        loadDemoData()
    });

    L.control.attribution({ prefix:'' }).addTo(map);

    // load the basemap options into a custom basemap control, add it to the map, make sure to create a reference to it so it can be triggered later
    var zIndex = 20;
    var basemaps = [];
    for (var i=0, l=BASEMAPS.length; i<l; i++) {
        var typ = BASEMAPS[i].type;
        var txt = BASEMAPS[i].name;
        var url = BASEMAPS[i].url;
        var att = BASEMAPS[i].attrib;
        var api = BASEMAPS[i].apikey;
        var lab = BASEMAPS[i].labels;

        basemaps.push({ 'type':typ, 'label':txt, 'attribution':att, 'url':url, 'apikey':api, 'labels':lab });
    }
    var labels = L.tileLayer("http://{s}.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.jpg", { zIndex:50 });//.addTo(map);

    //console.log('basemaps[0]', basemaps[0]);
    map.basemap_control = new L.Control.BasemapBar({ layers:basemaps, labels:labels }).addTo(map);


}

/*PROJ4 = {[
    'srid': '4326',
    'proj4text': '+proj=tmerc +lat_0=0 +lon_0=-62 +k=0...',
    'proj_obj': {
        'proj': 'tmerc',
        'lat_0': 0,
        'lon_0': -62,
        'k': 'tmerc',
        ...
    },
    'srid': '4326',
    'proj4text': '+proj=tmerc +lat_0=0 +lon_0=-62 +k=0...',
    'proj_obj': {
        'proj': 'tmerc',
        'lat_0': 0,
        'lon_0': -62,
        'k': 'tmerc',
        ...
    },
    ...
]}*/

var DISTINCT_PARAMS = {};

function initControls() {

    $('#btn-demo').click(function(){ runDemo(); });

    Dropzone.autoDiscover = false;

    var myDropzone = new Dropzone("div#map", { url: "upload.php"} );

    myDropzone.on("sending", function(file, response) {
        $('#waiter').show();
    });

    myDropzone.on("success", function(file, response) {
        /* Maybe display some more file information on your page */
        //runDemo(geojson);
        $('#waiter').hide();

        json = response;
        RESPONSE_JSON = response;

        var feat_arr = response.features;
        var temp_obj = {};
        var temp_proj, temp_arr, temper_arr;
        var temper_obj = {};

        for (var i = 0; i < feat_arr.length; i++) {
            temp_obj.srid = feat_arr[i].properties.srid;
            temp_proj = feat_arr[i].properties.proj4text;
            temp_obj.proj4text = feat_arr[i].properties.proj4text;
            temp_arr = temp_proj.split('+');
            for (var j = 0; j < temp_arr.length; j++) {
                temper_arr = temp_arr[j].split('=');
                if (temper_arr.length == 2) {
                    temper_obj[temper_arr[0]] = temper_arr[1].trim();

                    // If the param key doesn't exist yet, then add it
                    // If the value for the key doesn't exist yet, then add it
                    // After that, increment a counter for that param:key 
                    parameter = temper_arr[0];
                    valu = temper_arr[1].trim();

                    //console.log(parameter, valu);

                    if( typeof(DISTINCT_PARAMS[parameter]) == "undefined"){
                        DISTINCT_PARAMS[parameter] = {};
                    }
                    
                    if( typeof(DISTINCT_PARAMS[parameter][valu]) == "undefined"){
                        DISTINCT_PARAMS[parameter][valu] = 1;
                    } else {
                        DISTINCT_PARAMS[parameter][valu] += 1;
                    }

                }
            }
            temp_obj.proj_obj = temper_obj;

            PROJ4.push(temp_obj);
        }
        
        
        //console.log('response', response);
        //createSieve('#sieve');
    

        GJ_LYR = L.geoJson(json, {
                    style: invisible_style,
                    onEachFeature: mouseHandlers
                });
        GJ_LYR.addTo(map);
        //.done(function() {
            paintFeatures();
        //});
    });

    var settings_html = '';
    for (var key in simpler_style) {
        settings_html += '<div><input class="setting-input" type="text" name="'+key+'" value="'+simpler_style[key]+'"> '+key+'</div>';
    }

    $('#settings').html(settings_html);
    $('.setting-input').change(function(){
        var key = $(this).attr('name');
        //console.log(key)
        simpler_style[key] = $(this).val();
        GJ_LYR.setStyle(simpler_style);
    });


    L.easyButton('fa-gear', 
        function (){
            if ( $('#sieve').is(':visible') ) {
                $('#sieve').hide();
            } else {
                $('#sieve').show();
            }

        },
        'Settings'
    )


}


var my_style = {
    "stroke": "#f00",
    "stroke-opacity": 0.4,
    "stroke-width": 1,
    "fill": "#f00",
    "fill-opacity": 0.2
};


//$.getJSON('data/projnesser.geojson', function(json){ // see l48 (lower 48 us)
//$.getJSON('data/projnesser.geojson', function(json){ // see l48 (lower 48 us)
//$.getJSON('data/lwcf2.geojson', function(json){ // 



function runDemo() {        
    paintFeatures();


    //.done(function() {
    //});

    /*$.getJSON('data/projection_guesses.geojson', function(json){ // california
        RESPONSE_JSON = json;
        GJ_LYR = L.geoJson(json, {
                //style: invisible_style,
                style: simpler_style,
                onEachFeature: mouseHandlers
            });
        GJ_LYR.addTo(map);
    })
    .done(function() {
        paintFeatures();
    });*/
}

/*
function goGetJSON(url) {
    $.getJSON(url, function(json){ // see l48 (lower 48 us)
        GJ_LYR = L.geoJson(json, {
                style: invisible_style,
                onEachFeature: mouseHandlers
            });
        GJ_LYR.addTo(map);
    })
    .done(function() {
        paintFeatures();
    });
}
*/

function mouseHandlers(feature, layer) {
    if (feature.properties && feature.properties.srid) {
        var srid = '' + feature.properties.srid;
        //console.log(feature.properties.srid);
        //layer.bindPopup('<a href="http://www.epsg.io/?q='+srid+'">'+srid+'</a>');
    }
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: handleClick
        //click: popupInfo
    });
}

function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle(simpler_style);    
}

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(highlight_style);

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

function popupInfo(feature, layer) {
    //var feat = e.target.feature;
    //console.log(feature);
    //console.log(layer);
    // does this feature have a property named popupContent?
    /*if (feat.properties && feat.properties.srid) {
        console.log(feat.properties.srid);
        e.bindPopup(feat.properties.srid);
    }*/
}

var layers;

function handleClick(e) {
    var html = '';
    var srid;
    layers = [
        { name: 'Layer Name', layer: GJ_LYR }
    ];
    // look through each layer in order and see if the clicked point,
    // e.latlng, overlaps with one of the shapes in it.
    for (var i = 0; i < layers.length; i++) {
    //for (var i = 0; i < GJ_LYR.length; i++) {
        var match = leafletPip.pointInLayer(
            // the clicked point
            e.latlng,
            // this layer
            GJ_LYR,
            //layers[i].layer,
            // whether to stop at first match
            false);
        // if there's overlap, add some content to the popup: the layer name
        // and a table of attributes
        if (match.length) {
            for (j=0, l=match.length; j<l; j++) {
                srid = '' + match[j].feature.properties.srid;
                srtext = '' + match[j].feature.properties.srtext;
                srtext = srtext.substr(0,60);
                //html += [e.latlng.lat, e.latlng.lng];
                html += '<a target="new" href="http://www.epsg.io/'+srid+'.esriwkt">.prj</a> | ';
                html += '<a target="new" href="http://www.epsg.io/?q='+srid+'">'+srid+' '+srtext+'</a>';
                html += '<br />';
            }
        }
        /*if (match.length) {
            html += '<strong>' + layers[i].name +
                '<button onclick="highlightMatch(this)" data-layer="' + i +
                '" data-latlng="' +
                [e.latlng.lat, e.latlng.lng] +
                '">highlight</button></strong>';
            html += propertyTable(match[0].feature.properties);
        }*/
    }
    if (html) {
        map.openPopup(html, e.latlng);
    }
}

/*
featureLoop(GJ_LYR, simpler_style);

function featureLoop(lyr, style) {
    for (var idx in GJ_LYR._layers) {
        // For each feature
        var query = ;
        changeFeatureStyle(GJ_LYR, query, simpler_style);
        // Wait a moment

}

function changeFeatureStyle(lyr, query, style) {
    feat = GJ_LYR._layers[idx];
    if (feat.feature && feat.feature.properties && feat.feature.properties.srid) {
        console.log(feat.feature.properties.srid);
    }
}

for (var idx in GJ_LYR._layers) {
    feat = GJ_LYR._layers[idx];
    if (feat.feature && feat.feature.properties && feat.feature.properties.srid) {
        console.log(feat.feature.properties.srid);
    }
}*/


function paintFeatures() {
    var MAX_IDX = 0;
    for (var idx in GJ_LYR._layers) {
        MAX_IDX = idx;
        feat = GJ_LYR._layers[idx];
        if (feat.feature && feat.feature.properties && feat.feature.properties.srid) {
            //console.log(feat.feature.properties.srid);
        }
    }

    var IDX = 0;
    var interval_var = window.setInterval(function() {
        // "current" feature (not as current as the next feature)
        feat = GJ_LYR._layers[IDX];
        if (feat && feat.feature && feat.feature.properties && feat.feature.properties.srid) {
            //console.log(feat.feature.properties.srid);
            feat.setStyle(simpler_style);
        }

        feat = GJ_LYR._layers[IDX+1];
        if (feat && feat.feature && feat.feature.properties && feat.feature.properties.srid) {
            //console.log(feat.feature.properties.srid);
            feat.setStyle(simpler_style);
        }
        IDX++;

        if (IDX === MAX_IDX) {
            clearInterval(interval_var);
        }
    },1);
}
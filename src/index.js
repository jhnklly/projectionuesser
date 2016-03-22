var A = {};
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
    initSpectrum();
});

function loadDemoData() {
    $.ajax({
        //'async': false,
        'global': false,
        'url': 'data/projection_guesses.json',
        'dataType': "json",
        'success': function (data) {

            DEMO_JSON = data;

            GJ_LYR = L.geoJson(DEMO_JSON, {
                style: invisible_style,
                //style: simpler_style,
                onEachFeature: mouseHandlers
            });
            GJ_LYR.addTo(map);

            $('#btn-demo').html('DEMO');
            //$('#help_info').slideToggle();
            //setTimeout( function(){ }, 1000 );
            runDemo();
        }
    });
}

var nam, val;
var checkd;

/*function createSieve(selector) {
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
}; */

ALREADY_LOADED = false;

function initMap() {
    //map = L.mapbox.map('map', 'examples.map-y7l23tes')
    map = L.map('map')
    //.setView([3.8,-12.2], 3);
    .fitBounds(BOUNDS);

    //L.tileLayer('http://{s}.tiles.mapbox.com/v3/examples.map-y7l23tes/{z}/{x}/{y}.jpg').addTo(map)
    //L.tileLayer('http://{s}.tiles.mapbox.com/v3/examples.map-y7l23tes/{z}/{x}/{y}.jpg').addTo(map)

    A.mapid = 'nofuxletsgo.4c529064';
    A.key = 'pk.eyJ1Ijoibm9mdXhsZXRzZ28iLCJhIjoiY2lmNXo0ejFkMDl5bnJ0a3QyNjc4MmUxOCJ9.eBpsq07II4KOTUF3eSrdvQ';
    A.base_url = 'https://api.mapbox.com/v4/'+A.mapid+'/{z}/{x}/{y}.png?access_token='+A.key;


    /*L.tileLayer(A.base_url, {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map)
    .on('load',function() {
        loadDemoData()
    });*/

    map.attributionControl.setPrefix('');

    //L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',{attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'}).addTo(map)
    L.tileLayer(A.base_url,{attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">&copy;OpenStreetMap</a>'}).addTo(map)
    .on('load',function() {
        if (ALREADY_LOADED == false) {
            loadDemoData();
        }
        ALREADY_LOADED = true;
    });



    //L.control.attribution({ prefix:'' }).addTo(map);

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
    var labels = L.tileLayer("http://{s}.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.jpg", { zIndex:50, attribution: '<a target="_blank" href="http://mapbox.com/about/maps" title="http://mapbox.com/about/maps">&copy;Mapbox</a> <a target="_blank" href="http://openstreetmap.org/copyright" title="http://openstreetmap.org/copyright"> & OpenStreetMap</a>'});//.addTo(map);

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


function initSpectrum() {
    $("#color, #fillColor").spectrum({
        //color: "#000",
        color: $(this).text(),
        showInitial: true,
        showInput: true,
        preferredFormat: 'hex',
        clickoutFiresChange: true, // defaults to cancelling/reverting color
        show: function(){
            //$("#colorPicker").css('background-color',drawn_obj.options.color);
        }
    });

    $("#color, #fillColor").on('move.spectrum', function(e, tinycolor) {
        $('#color').val(tinycolor.toHexString()).trigger('change');
    });
}


function initControls() {

    $('#btn-demo').click(function(){ runDemo(); });
    $('#help_button, #help_close').click(function(){
         $('#help_info').toggle();
    });

    Dropzone.autoDiscover = false;

    var myDropzone = new Dropzone("div#map", { url: "pyproj_transform_upload.py"} );

    myDropzone.on("sending", function(file, response) {
        $('#waiter-comment').html('uploading&hellip;');
        $('#waiter').show();
        $('#help_info').hide();
        map.removeLayer(GJ_LYR);
    });

    myDropzone.on("success", function(file, response) {
        /* Maybe display some more file information on your page */
        //runDemo(geojson);
        //$('#waiter').hide();
        $('#waiter-comment').html('processing&hellip;');

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
                    //style: invisible_style,
                    style: fat_line_style,
                    onEachFeature: mouseHandlers
                });
        GJ_LYR.addTo(map)
            //.done(function() {
            //});
        paintFeatures(paintCallback);


    });

    var settings_html = '<div id="count"></div>';
    for (var key in simpler_style) {
        if (key !== 'fillColor') {
            settings_html += '<div><input id="'+key+'" class="setting-input" type="text" name="'+key+'" value="'+simpler_style[key]+'"> '+key+'</div>';
        }
    }

    $('#settings').html(settings_html);
    $('.setting-input').change(function(){
        var key = $(this).attr('name');
        //console.log(key)
        simpler_style[key] = $(this).val();
        simpler_style['fillColor'] = simpler_style['color']
        //GJ_LYR.setStyle(simpler_style);
    });


    /*L.easyButton('fa-gear',
        function (){
            if ( $('#sieve').is(':visible') ) {
                $('#sieve').hide();
            } else {
                $('#sieve').show();
            }

        },
        'Settings'
    )*/


}


var my_style = {
    "stroke": "#f00",
    "stroke-opacity": 0.4,
    "stroke-width": 1,
    "fill": "#f00",
    "fill-opacity": 0.2
};


function runDemo() {
    //map.removeLayer(GJ_LYR);
    //GJ_LYR.addTo(map);

    paintFeatures(paintCallback);
}

var TEMP, TEMP2;
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




function paintCallback() {
    console.log('paintCallback');
    $('#waiter').hide();
}

function paintFeatures(anon_cb_func) {
    var MAX_IDX = 0;

    GJ_LYR.setStyle(invisible_style);
    $('#help_info').hide();
    $('#waiter-comment').html('painting&hellip;');

    /*for (var idx in GJ_LYR._layers) {
        MAX_IDX = parseInt(idx);
        feat = GJ_LYR._layers[idx];
        if (feat.feature && feat.feature.properties && feat.feature.properties.srid) {
            //console.log(feat.feature.properties.srid);
        }
    }
    console.log(feat.feature.properties.srid);
*/
    var IDX = 0;

    var interval_var = window.setInterval(function() {
        // "current" feature (not as current as the next feature)
        //feat = GJ_LYR._layers[IDX];
        feat = GJ_LYR.getLayers()[IDX];
        if (feat && feat.feature && feat.feature.properties && feat.feature.properties.srid) {
            //console.log(feat.feature.properties.srid);
            feat.setStyle(simpler_style);

            // psychedelia: change the hue each step
            // hue step:360 :: IDX:MAX_IDX
            //hue_step = 360 * IDX / MAX_IDX;
            hue_step = 1/360;
            old_hex = $('#color').val();
            old_hue = one.color(old_hex).hue();
            new_hex = one.color(old_hex).hue(old_hue + hue_step).hex();

            new_weight = area2stylesize(feat.feature.properties.sqkm);
            //console.log(new_weight);

            $('#count').text(IDX);

            $('#color').val(new_hex).trigger('change');
            $('#weight').val(new_weight).trigger('change');
        }


        /*feat = GJ_LYR._layers[IDX+1];
        if (feat && feat.feature && feat.feature.properties && feat.feature.properties.srid) {
            feat.setStyle(simpler_style);
        }*/
        IDX++;


        if (IDX === MAX_IDX) {
            clearInterval(interval_var);
        }
    },1);

    anon_cb_func();
}

function area2stylesize(area) {
    /*AK: 1.7 M sq km >> 1
    CA: 425 K sq km >> 5
    NY: 141 K sq km >> 10
    DC: 177   sq km >> 100*/

    //px = 20 - 6 * area / 100000;
    px = 20 - area / 100000;
    px = px > 0.5 ? px : 1;
    return px;
}


// https://github.com/One-com/one-color
(function(e,t,n,r,i,s,o){function d(r){if(Object.prototype.toString.apply(r)==="[object Array]"){if(typeof r[0]=="string"&&typeof d[r[0]]=="function")return new d[r[0]](r.slice(1,r.length));if(r.length===4)return new d.RGB(r[0]/255,r[1]/255,r[2]/255,r[3]/255)}else if(typeof r=="string"){var i=r.toLowerCase();a[i]&&(r="#"+a[i]),i==="transparent"&&(r="rgba(0,0,0,0)");var s=r.match(p);if(s){var o=s[1].toUpperCase(),u=f(s[8])?s[8]:t(s[8]),l=o[0]==="H",h=s[3]?100:l?360:255,v=s[5]||l?100:255,m=s[7]||l?100:255;if(f(d[o]))throw new Error("one.color."+o+" is not installed.");return new d[o](t(s[2])/h,t(s[4])/v,t(s[6])/m,u)}r.length<6&&(r=r.replace(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i,"$1$1$2$2$3$3"));var g=r.match(/^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i);if(g)return new d.RGB(n(g[1],16)/255,n(g[2],16)/255,n(g[3],16)/255);if(d.CMYK){var y=r.match(new e("^cmyk\\("+c.source+","+c.source+","+c.source+","+c.source+"\\)$","i"));if(y)return new d.CMYK(t(y[1])/100,t(y[2])/100,t(y[3])/100,t(y[4])/100)}}else if(typeof r=="object"&&r.isColor)return r;return!1}function v(e,t,n){function l(e,t){var n={};n[t.toLowerCase()]=new r("return this.rgb()."+t.toLowerCase()+"();"),d[t].propertyNames.forEach(function(e,i){n[e]=n[e==="black"?"k":e[0]]=new r("value","isDelta","return this."+t.toLowerCase()+"()."+e+"(value, isDelta);")});for(var i in n)n.hasOwnProperty(i)&&d[e].prototype[i]===undefined&&(d[e].prototype[i]=n[i])}d[e]=new r(t.join(","),"if (Object.prototype.toString.apply("+t[0]+") === '[object Array]') {"+t.map(function(e,n){return e+"="+t[0]+"["+n+"];"}).reverse().join("")+"}"+"if ("+t.filter(function(e){return e!=="alpha"}).map(function(e){return"isNaN("+e+")"}).join("||")+"){"+'throw new Error("['+e+']: Invalid color: ("+'+t.join('+","+')+'+")");}'+t.map(function(e){return e==="hue"?"this._hue=hue<0?hue-Math.floor(hue):hue%1":e==="alpha"?"this._alpha=(isNaN(alpha)||alpha>1)?1:(alpha<0?0:alpha);":"this._"+e+"="+e+"<0?0:("+e+">1?1:"+e+")"}).join(";")+";"),d[e].propertyNames=t;var s=d[e].prototype;["valueOf","hex","hexa","css","cssa"].forEach(function(t){s[t]=s[t]||(e==="RGB"?s.hex:new r("return this.rgb()."+t+"();"))}),s.isColor=!0,s.equals=function(n,r){f(r)&&(r=1e-10),n=n[e.toLowerCase()]();for(var s=0;s<t.length;s+=1)if(i.abs(this["_"+t[s]]-n["_"+t[s]])>r)return!1;return!0},s.toJSON=new r("return ['"+e+"', "+t.map(function(e){return"this._"+e},this).join(", ")+"];");for(var o in n)if(n.hasOwnProperty(o)){var a=o.match(/^from(.*)$/);a?d[a[1].toUpperCase()].prototype[e.toLowerCase()]=n[o]:s[o]=n[o]}s[e.toLowerCase()]=function(){return this},s.toString=new r('return "[one.color.'+e+':"+'+t.map(function(e,n){return'" '+t[n]+'="+this._'+e}).join("+")+'+"]";'),t.forEach(function(e,n){s[e]=s[e==="black"?"k":e[0]]=new r("value","isDelta","if (typeof value === 'undefined') {return this._"+e+";"+"}"+"if (isDelta) {"+"return new this.constructor("+t.map(function(t,n){return"this._"+t+(e===t?"+value":"")}).join(", ")+");"+"}"+"return new this.constructor("+t.map(function(t,n){return e===t?"value":"this._"+t}).join(", ")+");")}),u.forEach(function(t){l(e,t),l(t,e)}),u.push(e)}var u=[],a={},f=function(e){return typeof e=="undefined"},l=/\s*(\.\d+|\d+(?:\.\d+)?)(%)?\s*/,c=/\s*(\.\d+|100|\d?\d(?:\.\d+)?)%\s*/,h=/\s*(\.\d+|\d+(?:\.\d+)?)\s*/,p=new e("^(rgb|hsl|hsv)a?\\("+l.source+","+l.source+","+l.source+"(?:,"+h.source+")?"+"\\)$","i");d.installMethod=function(e,t){u.forEach(function(n){d[n].prototype[e]=t})},v("RGB",["red","green","blue","alpha"],{hex:function(){var e=(s(255*this._red)*65536+s(255*this._green)*256+s(255*this._blue)).toString(16);return"#"+"00000".substr(0,6-e.length)+e},hexa:function(){var e=s(this._alpha*255).toString(16);return"#"+"00".substr(0,2-e.length)+e+this.hex().substr(1,6)},css:function(){return"rgb("+s(255*this._red)+","+s(255*this._green)+","+s(255*this._blue)+")"},cssa:function(){return"rgba("+s(255*this._red)+","+s(255*this._green)+","+s(255*this._blue)+","+this._alpha+")"}}),typeof define=="function"&&!f(define.amd)?define(function(){return d}):typeof exports=="object"?module.exports=d:(one=window.one||{},one.color=d),typeof jQuery!="undefined"&&f(jQuery.color)&&(jQuery.color=d),v("HSV",["hue","saturation","value","alpha"],{rgb:function(){var e=this._hue,t=this._saturation,n=this._value,r=o(5,i.floor(e*6)),s=e*6-r,u=n*(1-t),a=n*(1-s*t),f=n*(1-(1-s)*t),l,c,h;switch(r){case 0:l=n,c=f,h=u;break;case 1:l=a,c=n,h=u;break;case 2:l=u,c=n,h=f;break;case 3:l=u,c=a,h=n;break;case 4:l=f,c=u,h=n;break;case 5:l=n,c=u,h=a}return new d.RGB(l,c,h,this._alpha)},hsl:function(){var e=(2-this._saturation)*this._value,t=this._saturation*this._value,n=e<=1?e:2-e,r;return n<1e-9?r=0:r=t/n,new d.HSL(this._hue,r,e/2,this._alpha)},fromRgb:function(){var e=this._red,t=this._green,n=this._blue,r=i.max(e,t,n),s=o(e,t,n),u=r-s,a,f=r===0?0:u/r,l=r;if(u===0)a=0;else switch(r){case e:a=(t-n)/u/6+(t<n?1:0);break;case t:a=(n-e)/u/6+1/3;break;case n:a=(e-t)/u/6+2/3}return new d.HSV(a,f,l,this._alpha)}}),v("HSL",["hue","saturation","lightness","alpha"],{hsv:function(){var e=this._lightness*2,t=this._saturation*(e<=1?e:2-e),n;return e+t<1e-9?n=0:n=2*t/(e+t),new d.HSV(this._hue,n,(e+t)/2,this._alpha)},rgb:function(){return this.hsv().rgb()},fromRgb:function(){return this.hsv().hsl()}})})(RegExp,parseFloat,parseInt,Function,Math,Math.round,Math.min)
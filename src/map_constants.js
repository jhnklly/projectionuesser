

// the predefined set of basemap options, used to generate the basemap selector top-right
// see initMap() and the BasemapBar instantiation
// this is inspired by, but not the same as, the one over at MapCOllaborator which uses a global struct; this one keeps a cleaner namespace by assinging the basemap options into the control itself
var BASEMAPS = [
    {
        type: 'xyz',
        name:'Dark',
        url:'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
        attrib:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="http://cartodb.com/attributions">CartoDB</a>',
        labels: false
    },
    {
        type: 'xyz',
        name:'Photo',
        url:'http://{s}.tiles.mapbox.com/v3/greeninfo.map-zudfckcw/{z}/{x}/{y}.jpg',
        attrib:'<a target="_blank" href="http://mapbox.com/about/maps" title="http://mapbox.com/about/maps">&copy;Mapbox</a> <a target="_blank" href="http://openstreetmap.org/copyright" title="http://openstreetmap.org/copyright">&copy;OpenStreetMap</a>',
        labels: true
    },
    /*{
        type: 'xyz',
        name:'Color',
        url:'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
        attrib:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="http://stamen.com">Stamen Design</a>',
        labels: false
    },*/
    {
        type: 'xyz',
        name:'Light',
        url:'http://{s}.tiles.mapbox.com/v4/greeninfo.5edc7fa0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZ3JlZW5pbmZvIiwiYSI6Ik1HUWRtdEkifQ.aWQKcu787DGrDq7LN5r2iA',
        attrib:'<a target="_blank" href="http://mapbox.com/about/maps" title="http://mapbox.com/about/maps">&copy;Mapbox</a> <a target="_blank" href="http://openstreetmap.org/copyright" title="http://openstreetmap.org/copyright">&copy;OpenStreetMap</a>',
        labels: true
    }
];



var invisible_style =  {
    color: '#00ff00',
    /*weight: 0.3,
    fillOpacity: 0,
    */
    weight: 1,
    opacity: 0.0,
    fillOpacity: 0.0,
    fillColor: '#00ff00'
}

var simple_style =  {
    color: '#00ff00',
    weight: 1.3,
    opacity: 1,
    fillOpacity: 0.6,
    fillColor: '#00ff00'
}

var simpler_style =  {
    color: '#00ff00',
    weight: 1,
    opacity: 0.2,
    fillOpacity: 0.05,
    fillColor: '#00ff00'
}

var fat_line_style =  {
    color: '#00ff00',
    weight: 20,
    opacity: 0.2,
    fillOpacity: 0.05,
    fillColor: '#00ff00'
}

var highlight_style =  {
    //color: '#ff00ff',
    //color: '#ffffff',
    weight: 1.4,
    opacity: 0.8,
    fillOpacity: 0.25,
    fillColor: '#fffff'
}





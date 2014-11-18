var BING_API_KEY    = "AiecIf8cAgrFbHnHLpNfNIAmSqk9wo89f1yDtEMLJJdGpPJPa6G9-WpF3WC8EvTn";
var GOOGLE_API_KEY  = "AIzaSyBdFgcE_oJ_qhNCxGrgf1Tm2qdpPRNPYrY";

// the predefined set of basemap options, used to generate the basemap selector top-right
// see initMap() and the BasemapBar instantiation
// this is inspired by, but not the same as, the one over at MapCOllaborator which uses a global struct; this one keeps a cleaner namespace by assinging the basemap options into the control itself
var BASEMAPS = [
    {
        type: 'xyz',
        name:'Dark',
        url:'http://{s}.tiles.mapbox.com/v3/examples.map-y7l23tes/{z}/{x}/{y}.jpg',
        attrib:'Map tiles by <a target="_blank" href="http://www.mapbox.com">MapBox</a>.<br />Data &copy; <a target="_blank" href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
        labels: false
    },
    {
        type: 'xyz',
        name:'Map',
        url:'http://{s}.tiles.mapbox.com/v3/greeninfo.map-p71hkhvk/{z}/{x}/{y}.jpg',
        attrib:'Map tiles by <a target="_blank" href="http://www.mapbox.com">MapBox</a>.<br />Data &copy; <a target="_blank" href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
        labels: false
    },
    {
        type: 'xyz',
        name:'Topo',
        url:'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.jpg',
        attrib:'&copy; <a target="_blank" href="http://support.esri.com/en/knowledgebase/techarticles/detail/42495" target="_blank">Sources: ESRI, DeLorme, HERE, TomTom, and others</a>',
        labels: false
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
    opacity: 0.05,
    fillOpacity: 0.05,
    fillColor: '#00ff00'
}

var highlight_style =  {
    color: '#ff00ff',
    weight: 1.3,
    opacity: 0.3,
    fillOpacity: 0.25,
    fillColor: '#ff00ff'
}


// a control to form the basemap picker across the top
// reads from the given list, and generates the buttons as named; which means that the BASEMAPS entries must match the list given
L.Control.BasemapBar = L.Control.extend({
    options: {
        position: 'topright'
    },
    initialize: function(options) {
        if (! options.layers) throw "L.BasemapBar: missing layers list  [ {label,attribution,url}, {label,attribution,url}, ... ]";

        this.map     = null;                // the Map object itself, used in selectLayer()to removeLayer() and addLayer()
        this.layers  = options.layers;      // the list of options we were passed, used to construct buttons in onAdd()
        this.buttons = {};                  // registry mapping button name -> layer instance, used for toggling in selectLayer()
        this.labels  = options.labels;      // labels tilelayer; selectLayer() will toggle this based on target basemap's 'labels' setting
        this.bar_div = null;                // jmk
        this.current_basemap_tag = options.layers[0].label.toLowerCase();
    },
    onAdd: function (map) {
        // add a linkage to the map, since we'll be managing map layers
        this.map = map;

        // pass 1
        // create an internal registry entry for each layer-option, mapping the button text onto the L.tileLayer instance
        // this is the key to the selectLayer() function being able to identify which layer is desired
        this._layers = {};
        for (var i=0, l=this.layers.length; i<l; i++) {
            var layeroption = this.layers[i];

            // preprocessing
            // standardize the capitalization to always be lowercase; makes things more consistent when testing
            layeroption.label = layeroption.label.toLowerCase();

            switch (layeroption.type) {
                case 'xyz':
                    // XYZ which can be used as a Leaflet L.TileLayer
                    // params:
                    //      url             the URL template of the XYZ tile service, as is usual for a L.TileLayer
                    //      attribution     attribution (text/html) when this layer is showing
                    this._layers[ layeroption.label ] = L.tileLayer(layeroption.url, { attribution:layeroption.attribution });
                    break;
                case 'google':
                    // Google basemap: various subtypes
                    // params:
                    //      url             the type of Map to use; any of: satellite, streets, terrain
                    //      attribution     NOT USED (here as a note) the Google Maps layer driver already provides the attribution
                    switch (layeroption.url) {
                        case 'satellite':
                            this._layers[ layeroption.label ] = new L.Google('SATELLITE', { zIndex:-1 });
                            break;
                        case 'streets':
                            this._layers[ layeroption.label ] = new L.Google('ROADMAP', { zIndex:-1 });
                            break;
                        case 'terrain':
                            this._layers[ layeroption.label ] = new L.Google('TERRAIN', { zIndex:-1 });
                            break;
                    }
                    break;
                case 'bing':
                    // Bing basemap: various subtypes
                    // params:
                    //      apikey      the Bing Maps API key to use for this layer
                    //      url         the type of Map to use; any of: aerial, street
                    //      attribution     attribution (text/html) when this layer is showing
                    switch (layeroption.url) {
                        case 'aerial':
                            this._layers[ layeroption.label ] = new L.BingLayer(layeroption.apikey, { zIndex:-1, type:'Aerial' });
                            break;
                        case 'street':
                            this._layers[ layeroption.label ] = new L.BingLayer(layeroption.apikey, { zIndex:-1, type:'Road' });
                            break;
                        default:
                            throw("L.Control.BasemapBar: Unknown Bing subtype ("+layeroption.url+") Must be: street, aerial");
                            break;
                    }
                    break;
                default:
                    throw("L.Control.BasemapBar: Unknown layer 'type' ("+layeroption.type+") Must be: xyz, bing, google");
                    break;
            } // end of layer type switch

            // postprocessing of the layer object
            // indicate whether labels should be on/off for this basemap
            this._layers[ layeroption.label ].labels = layeroption.labels;

        } // end of this layer option passed in as a list

        // pass 2
        // create a button for each registered layer, complete with a data attribute for the layer to get toggled, and a linkage to the parent control
        var controlDiv = L.DomUtil.create('div', 'leaflet-control-basemapbar');
        this.bar_div = controlDiv;
        L.DomEvent
            .addListener(controlDiv, 'mouseout', L.DomEvent.stopPropagation)
            .addListener(controlDiv, 'mouseout', L.DomEvent.stopPropagation)
            .addListener(controlDiv, 'mouseout', L.DomEvent.preventDefault)
            .addListener(controlDiv, 'mouseout', function () {
                // collapse
                //http://stackoverflow.com/questions/4697758/prevent-onmouseout-when-hovering-child-element-of-the-parent-absolute-div-withou
                e = event.toElement || event.relatedTarget;
                if (e.parentNode == this || e == this) {
                    return;
                }
                control.collapseUI();
            });

        for (var i=0, l=this.layers.length; i<l; i++) {
            var label            = this.layers[i].label;
            var button           = L.DomUtil.create('div', 'leaflet-control-basemapbar-option', controlDiv);
            button.control       = this;
            button.innerHTML     = label.toUpperCase();
            button['data-layer'] = label;

            // on a click on a button, it calls the control's selectLayer() method by name
            L.DomEvent
                .addListener(button, 'mousedown', L.DomEvent.stopPropagation)
                .addListener(button, 'click', L.DomEvent.stopPropagation)
                .addListener(button, 'click', L.DomEvent.preventDefault)
                .addListener(button, 'click', function () {
                    // select the given basemap
                    this.control.selectLayer( this['data-layer'] );
                    L.DomUtil.removeClass(button,'leaflet-control-basemapbar-hidden');
                    L.DomUtil.removeClass(this,'leaflet-control-basemapbar-hidden');
                });

            L.DomEvent
                .addListener(button, 'mouseover', function () {
                this.control.expandUI();
            });

            // add the button to our internal random-access list, so we can arbitrarily fetch buttons later, e.g. to toggle one programatically
            this.buttons[label] = button;
        }



        // afterthought: add Open and Close buttons to the list, which when clicked, expands/collapses the other buttons
        /*this.opener = L.DomUtil.create('div', 'leaflet-control-basemapbar-open', controlDiv);
        //this.opener.innerHTML = '+ Base Maps';
        this.opener.innerHTML = 'MAP';
        this.opener.title     = 'Show options for the base map';
        this.opener.control   = this;
        L.DomEvent
            .addListener(this.opener, 'mousedown', L.DomEvent.stopPropagation)
            .addListener(this.opener, 'click', L.DomEvent.stopPropagation)
            .addListener(this.opener, 'click', L.DomEvent.preventDefault)
            //.addListener(this.opener, 'click', function () {
            .addListener(this.opener, 'mouseover', function () {
                this.control.expandUI();
            });
*/
        


        // and on launch.... collapse the UI
        var control = this;
        setTimeout(function () {
            control.collapseUI();

            var label_0 = control.layers[0].label;
            var button = control.buttons[label_0];
            L.DomUtil.addClass(button,'leaflet-control-basemapbar-option-active');
            L.DomUtil.removeClass(button,'leaflet-control-basemapbar-hidden');

        }, 500);

        // done!
        return controlDiv;
    },
    selectLayer: function (which) {
        // selectLayer() is *the* public method to trigger the basemap picker to select a layer, highlight appropriately, and trigger a change in the map layers
        for (var tag in this.buttons) {
            var button = this.buttons[tag];
            if (tag == which) {
                L.DomUtil.addClass(button,'leaflet-control-basemapbar-option-active');
                L.DomUtil.removeClass(button,'leaflet-control-basemapbar-hidden');
                this.map.addLayer(this._layers[tag],true);
                this.current_basemap_tag = tag.toLowerCase();
            } else {
                L.DomUtil.removeClass(button,'leaflet-control-basemapbar-option-active');
                L.DomUtil.addClass(button,'leaflet-control-basemapbar-hidden');
                this.map.removeLayer(this._layers[tag]);
            }
        }

        // check the layers options we were passed, and see whether this chosen basemap should have the labels turned on or off
        if (this._layers[which].labels) {
            //MAP.addLayer(this.labels);
            this.map.addLayer(this.labels);
        } else {
            //MAP.removeLayer(this.labels);
            this.map.removeLayer(this.labels);
        }

    },
    collapseUI: function () {
        // (jmk) add the css which makes selected float right
        // and makes width = 1 button
        /*L.DomUtil.addClass(this.bar_div, 'leaflet-control-basemapbar-close');
        L.DomUtil.removeClass(this.bar_div, 'leaflet-control-basemapbar-open');
        */

        // add the CSS which hides the picker buttons
        for (var tag in this.buttons) {
            if (tag == this.current_basemap_tag) continue;
            var button = this.buttons[tag];
            L.DomUtil.addClass(button,'leaflet-control-basemapbar-hidden');
        }
        
        // then add/remove CSS to show/hide the opener/closer button
        //L.DomUtil.addClass(this.closer, 'leaflet-control-basemapbar-hidden');
        //L.DomUtil.removeClass(this.opener, 'leaflet-control-basemapbar-hidden');
    },
    expandUI: function () {
        // (jmk) add the css which makes width = all buttons
        /*L.DomUtil.addClass(this.bar_div, 'leaflet-control-basemapbar-open');
        L.DomUtil.removeClass(this.bar_div, 'leaflet-control-basemapbar-close');
        */
        
        // remove the CSS which hides the picker buttons
        for (var tag in this.buttons) {
            var button = this.buttons[tag];
            L.DomUtil.removeClass(button,'leaflet-control-basemapbar-hidden');
        }

        // then add/remove CSS to show/hide the opener/closer button
        //L.DomUtil.removeClass(this.closer, 'leaflet-control-basemapbar-hidden');
        //L.DomUtil.addClass(this.opener, 'leaflet-control-basemapbar-hidden');
    }
});


// a generic button-on-the-map which when clicked, toggles the visiblity of a JQUI dialog
// the icons are set via CSS based on the .leaflet-control-dialogtoggle-JQID class
L.Control.DialogToggler = L.Control.extend({
    options: {
        position: 'topright'
    },
    initialize: function(options) {
        if (! options.jqid)   throw "L.Control.DialogToggler: missing required option: jqid";
        if (! options.tooltip)      throw "L.Control.DialogToggler: missing required option: tooltip";

        this.jqid     = options.jqid;
        this.tooltip  = options.tooltip;
        this.dialog   = jQuery('#' + this.jqid); // a reference to the #selector jQuery element
    },
    onAdd: function (map) {
        var controlDiv     = L.DomUtil.create('div', 'leaflet-control-dialogtoggle');
        controlDiv.title   = this.tooltip;
        controlDiv.control = this;

        // add a class based on the JQID, to differentiate the buttons in CSS, e.g. leaflet-control-dialogtoggle-dialog_share can get a different background-image or color
        L.DomUtil.addClass(controlDiv, 'leaflet-control-dialogtoggle-' + this.jqid);

        // keep in mind that the event context is the DIV and not the Control, but there is a .control attribute on the DIV
        L.DomEvent
            .addListener(controlDiv, 'mousedown', L.DomEvent.stopPropagation)
            .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
            .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
            .addListener(controlDiv, 'click', function () {
                var dialog = this.control.dialog;
                if (dialog.dialog('isOpen')) {
                    dialog.dialog('close');
                } else {
                    dialog.dialog('open');
                }
            });

        return controlDiv;
    }
});


function onMouseOut(event) {
    e = event.toElement || event.relatedTarget;
    if (e.parentNode == this || e == this) {
        return;
    }
    alert('MouseOut');
    // handle mouse event here!
};

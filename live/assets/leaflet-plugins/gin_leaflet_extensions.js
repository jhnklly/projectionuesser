
///////////////////////////////////////////////////////////////////////////////////
///// LEAFLET EXTENSIONS
///////////////////////////////////////////////////////////////////////////////////

// a control to form the basemap picker across the top
// reads from the given list, and generates the buttons as named; which means that the BASEMAPS entries must match the list given
L.Control.BasemapBar = L.Control.extend({
    options: {
        position: 'topright'
    },
    initialize: function(options) {
        if (! options.layers) throw "L.ControlBasemapBarDialogToggler: missing layers list  [tag, tag, ... ]";
        this.layers  = options.layers;
        this.buttons = {};
        this.map     = null;
    },
    onAdd: function (map) {
        // add a linkage to the map, since we'll be managing map layers
        this.map = map;

        // create a button for each registered layer, complete with a data attribute for the layer to get toggled, and a linkage to the parent control
        // the list of layers is simply a list of texts, which are used literally as the text of the button and as the BASEMAPS entry
        var controlDiv = L.DomUtil.create('div', 'leaflet-control-basemapbar');
        for (var i=0, l=this.layers.length; i<l; i++) {
            var tag              = this.layers[i];
            var button           = L.DomUtil.create('div', 'leaflet-control-basemapbar-option', controlDiv);
            button.control       = this;
            button.innerHTML     = tag.toUpperCase();
            button['data-layer'] = tag;

            // on a click on a button, it calls the control's selectLayer() method by name
            L.DomEvent
                .addListener(button, 'click', L.DomEvent.stopPropagation)
                .addListener(button, 'click', L.DomEvent.preventDefault)
                .addListener(button, 'click', function () {
                    // select the given basemap
                    this.control.selectLayer( this['data-layer'] );
                });

            // add the button to our internal random-access list, so we can arbitrarily fetch buttons later, e.g. to toggle one programatically
            this.buttons[tag] = button;
        }
        return controlDiv;
    },
    selectLayer: function (which) {
        // selectLayer() is *the* public method to trigger the basemap picker to select a layer, highlight appropriately, and trigger a change in the map layers
        for (var tag in this.buttons) {
            var button = this.buttons[tag];
            if (tag == which) {
                L.DomUtil.addClass(button,'leaflet-control-basemapbar-option-active');
                this.map.addLayer(BASEMAPS[tag],true);
            } else {
                L.DomUtil.removeClass(button,'leaflet-control-basemapbar-option-active');
                this.map.removeLayer(BASEMAPS[tag]);
            }
        }
    }
});

// a generic button-on-the-map which when clicked, toggles the visiblity of a JQUI dialog
// the icons are set via CSS based on the leaflet-control-dialogtoggle-JQID class
L.Control.DialogToggler = L.Control.extend({
    options: {
        position: 'topleft'
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

// a simple control to display the GreenInfo logo and credits in the corner of the map
// notably, the logo image defined in CSS as a background-image, so we don't need to hardcode here (CSS tends to be in same folder as images)
L.GreeninfoCreditsControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },
    onAdd: function (map) {
        this._map      = map;

        var container = L.DomUtil.create('div', 'leaflet-greeninfocredits-control', container);
        var link      = L.DomUtil.create('a', '', container);
        link.href       = 'http://www.greeninfo.org/';
        link.target     = '_blank';
        link.innerHTML  = 'Interactive mapping<br/>by GreenInfo Network';

        container.link = link;

        L.DomEvent.addListener(container,'click', function () {
            var link = this.link;
            if ( L.DomUtil.hasClass(link, 'leaflet-greeninfocredits-showlink') ) {
                L.DomUtil.removeClass(link, 'leaflet-greeninfocredits-showlink');
            } else {
                L.DomUtil.addClass(link, 'leaflet-greeninfocredits-showlink');
            }
        });

        return container;
    }
});

// an extension of the L.TileLayer.WMS to include WMS GetFeatureInfo capability when a click is made on the map
// the callback simply opens a L.Popup onto the map
L.TileLayer.WMSWithFeatureInfo = L.TileLayer.WMS.extend({
    onAdd: function (map) {
        L.TileLayer.WMS.prototype.onAdd.call(this, map);
        map.on('click', this.getFeatureInfoFromClickEvent, this);
    },
    onRemove: function (map) {
        L.TileLayer.WMS.prototype.onRemove.call(this, map);
        map.off('click', this.getFeatureInfoFromClickEvent, this);
    },
    getFeatureInfoFromClickEvent: function (evt) {
        // hack! if any of the drawing tools are in use, then we don't want to click-query at all
        // this is specific to the front-facing map (index.js) so not at all a "constant" but 99% of this functionality is same as in the Administration  UI so easiest to just hack around it like this
        if ( DRAWTOOL_NOTE    && DRAWTOOL_NOTE.enabled()    ) return;
        if ( DRAWTOOL_POINT   && DRAWTOOL_POINT.enabled()   ) return;
        if ( DRAWTOOL_LINE    && DRAWTOOL_LINE.enabled()    ) return;
        if ( DRAWTOOL_POLYGON && DRAWTOOL_POLYGON.enabled() ) return;

        // proceed
        var url         = this.composeFeatureInfoUrl(evt.latlng);
        var showResults = L.Util.bind(this.showGetFeatureInfo, this);
        $('#map').addClass('busy'); // specific to MapCollaborator; see CSS for #map.busy
        $.ajax({
            url: url,
            success: function (data, status, xhr) {
                $('#map').removeClass('busy'); // specific to MapCollaborator; see CSS for #map.busy
                var err = typeof data === 'string' ? null : data;
                showResults(err, evt.latlng, data);
            },
            error: function (xhr, status, error) {
                $('#map').removeClass('busy'); // specific to MapCollaborator; see CSS for #map.busy
                showResults(error);
            }
        });
    },
    composeFeatureInfoUrl: function (latlng) {
        var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom());
        var size = this._map.getSize();
        var params = {
            request: 'GetFeatureInfo',
            service: 'WMS',
            srs: 'EPSG:4326',
            styles: this.wmsParams.styles,
            transparent: this.wmsParams.transparent,
            version: this.wmsParams.version,
            format: this.wmsParams.format,
            bbox: this._map.getBounds().toBBoxString(),
            height: size.y,
            width: size.x,
            layers: this.wmsParams.layers,
            query_layers: this.wmsParams.layers,
            info_format: 'text/html'
        };
        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
        return this._url + L.Util.getParamString(params, this._url, true);
    },
    showGetFeatureInfo: function (err, latlng, content) {
        if (err) { console.log(err); return; } // an error, so do nothing
        if (! content) return; // no content? no bubble

        // load the bubble, then call this generic postprocessor which can do other things to the bubble content,
        // e.g. iterate over fields and look for empty fields, draw charts, whatever
        // tip: your HTML templates can include input[type="hidden"] fields and DIVs with style=display:none if you want to embed non-visible data
        L.popup({ maxWidth:800 }).setLatLng(latlng).setContent(content).openOn(this._map);
        postprocessPopupBubble(this.wmsParams.layers);
    }
});
L.tileLayer.wmsWithFeatureInfo = function (url, options) {
  return new L.TileLayer.WMSWithFeatureInfo(url, options);  
};

// extend the L.TileLayer.WMSWithFeatureInfo defined above to also include the required &STATUS= parameter for Core layers
L.TileLayer.WMSWithFeatureInfoCore = L.TileLayer.WMSWithFeatureInfo.extend({
    composeFeatureInfoUrl: function (latlng) {
        var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom());
        var size = this._map.getSize();
        var params = {
            request: 'GetFeatureInfo',
            service: 'WMS',
            srs: 'EPSG:4326',
            styles: this.wmsParams.styles,
            transparent: this.wmsParams.transparent,
            version: this.wmsParams.version,
            format: this.wmsParams.format,
            bbox: this._map.getBounds().toBBoxString(),
            height: size.y,
            width: size.x,
            layers: this.wmsParams.layers,
            query_layers: this.wmsParams.layers,
            info_format: 'text/html',
            'STATUS' : this.wmsParams.STATUS // the only diff between the Core and the Context
        };
        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
        return this._url + L.Util.getParamString(params, this._url, true);
    }
});
L.tileLayer.wmsWithFeatureInfoCore = function (url, options) {
  return new L.TileLayer.WMSWithFeatureInfoCore(url, options);  
};


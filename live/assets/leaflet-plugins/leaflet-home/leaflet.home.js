L.Map.mergeOptions({
    home: false
});

L.Control.Home = L.Control.extend({

    options: {
        home: {
            title: 'Home',
            initialZoom: 0,
            initialCenter: []
        }
    },

    handlers: {},

    initialize: function (options) {
        L.Util.extend(this.options, options);

        this.map = {};
    },

    onAdd: function (map) {
        var className = 'leaflet-control-home';
        var container = map.zoomControl._container;

        this.map = map;
        this.options.home.initialZoom = map.options.zoom;
        this.options.home.initialCenter = map.options.center;
        this.options.home.initialBounds = map.options.home_bounds; // jmk

        if (this.options.home) {
            this._createButton(
                    this.options.home.title,
                    className,
                    container,
                    this.goHome,
                    this
            );
        }

        return container;
    },

    _createButton: function (title, className, container, fn, context) {
        var link = L.DomUtil.create('a', className, container);
        link.href = '#';
        link.title = title;

        L.DomEvent
                .on(link, 'click', L.DomEvent.stopPropagation)
                .on(link, 'mousedown', L.DomEvent.stopPropagation)
                .on(link, 'dblclick', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.preventDefault)
                .on(link, 'click', fn, context);

        return link;
    },

    goHome: function () {
        this._exitFired = false;

        //this.map.setView(this.options.home.initialCenter, this.options.home.initialZoom);
        this.map.fitBounds( L.latLngBounds(this.options.home.initialBounds) );
    }
});

L.Map.addInitHook(function () {
    if (this.options.home) {
        this.homeControl = new L.Control.Home();
        this.addControl(this.homeControl);
    }
});
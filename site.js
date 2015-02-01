var map = L.mapbox.map('map', 'examples.map-y7l23tes', { zoomControl: false });
map.scrollWheelZoom.disable();

var bufferLayer = L.mapbox.featureLayer().addTo(map);

var raceRoute = L.mapbox.featureLayer().addTo(map);
var schoolFountains = L.mapbox.featureLayer().addTo(map);
var schoolFountainsInside = L.mapbox.featureLayer().addTo(map);

schoolFountains.loadURL('./buildingCentroids.geojson')
    .on('ready', done);

raceRoute.loadURL('./ikot.geojson')
    .on('ready', done);

var loaded = 0;
function done() {
    if (++loaded !== 2) return;
    raceRoute.setStyle({ color: 'hotpink', weight: 3 });
    map.fitBounds(raceRoute.getBounds());

    function run() {
        var radius = parseInt(document.getElementById('radius').value);
        if (isNaN(radius)) radius = 100;
        var buffer = turf.buffer(raceRoute.getGeoJSON(), radius/5280, 'miles');
        var fountains = schoolFountains.getGeoJSON();
        fountains.features.forEach(function(feature) {
            feature.properties['marker-color'] = '#111';
            feature.properties['marker-symbol'] = 'building';
            feature.properties['marker-size'] = 'small';
        });
        schoolFountains.setGeoJSON(fountains);
        bufferLayer
            .setGeoJSON(buffer)
            .setStyle({
                stroke: false,
                fillColor: 'red',
                fillOpacity: 0.2
            })
            .eachLayer(function(layer) {
                layer.bindLabel('Ikot Route', { noHide: true });
            });
        var fountainsInside = turf.within(schoolFountains.getGeoJSON(), buffer);
        fountainsInside.features.forEach(function(feature) {
            feature.properties['marker-color'] = '#00f';
            feature.properties['marker-symbol'] = 'building';
            feature.properties['marker-size'] = 'large';
        });
        schoolFountainsInside
            .setGeoJSON(fountainsInside)
            .eachLayer(function(layer) {
                layer.bindLabel('Accessible school fountain');
            });
    }

    run();

    document.getElementById('radius').onchange = run;
}

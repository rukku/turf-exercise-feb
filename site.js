var map = L.mapbox.map('map', 'examples.map-y7l23tes', { zoomControl: false });
map.scrollWheelZoom.disable();

var bufferLayer = L.mapbox.featureLayer().addTo(map);

var ikotRoute = L.mapbox.featureLayer().addTo(map);
var buildingCentroids = L.mapbox.featureLayer().addTo(map);
var buildingCentroidsInside = L.mapbox.featureLayer().addTo(map);

buildingCentroids.loadURL('./buildingCentroids.geojson')
    .on('ready', done);

ikotRoute.loadURL('./ikot.geojson')
    .on('ready', done);

var loaded = 0;
function done() {
    if (++loaded !== 2) return;
    ikotRoute.setStyle({ color: 'yellow', weight: 3 });
    map.fitBounds(ikotRoute.getBounds());

    function run() {
        var radius = parseInt(document.getElementById('radius').value);
        if (isNaN(radius)) radius = 100;
        var buffer = turf.buffer(ikotRoute.getGeoJSON(), radius/5280, 'miles');
        var buildings = buildingCentroids.getGeoJSON();
        buildings.features.forEach(function(feature) {
            feature.properties['marker-color'] = '#111';
            feature.properties['marker-symbol'] = 'building';
            feature.properties['marker-size'] = 'small';
        });
        buildingCentroids.setGeoJSON(buildings);
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
        var buildingsInside = turf.within(buildingCentroids.getGeoJSON(), buffer);
        buildingsInside.features.forEach(function(feature) {
            feature.properties['marker-color'] = '#00f';
            feature.properties['marker-symbol'] = 'building';
            feature.properties['marker-size'] = 'large';
        });
        buildingCentroidsInside
            .setGeoJSON(buildingsInside)
            .eachLayer(function(layer) {
                layer.bindLabel(layer.feature.properties.name + 'is accessible from Ikot route');
            });
    }

    run();

    document.getElementById('radius').onchange = run;
}

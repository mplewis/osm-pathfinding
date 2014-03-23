var map = L.mapbox.map('map', 'examples.map-9ijuk24y');
var markers = new L.MarkerClusterGroup();

var locs = {
  triangle: {
    desc: 'Triangle Fraternity',
    coords: [44.983294, -93.237445]
  },
  keller: {
    desc: 'Keller Hall',
    coords: [44.974548, -93.232232]
  }
};

_.values(locs).forEach(function(loc) {
  L.marker(loc.coords).bindPopup(loc.desc).addTo(map);
});

$.get('/mpls_nodes_some.json').then(function(data) {
  _.pairs(data).forEach(function(locPair) {
    var id = locPair[0];
    var loc = locPair[1];
    var marker = L.marker([loc.lat, loc.lon])
      .bindPopup('ID:' + id + ', lat:' + loc.lat + ', lon:' + loc.lon);
    markers.addLayer(marker);
  });
});

map.addLayer(markers);

map.setView(locs.triangle.coords, 15);

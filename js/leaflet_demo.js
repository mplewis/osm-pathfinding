var map = L.mapbox.map('map', 'examples.map-9ijuk24y');
var markers = new L.MarkerClusterGroup();

var locs = {
  triangle: {
    desc: 'Triangle Fraternity',
    coords: [44.983294, -93.237445]
  }
};

var nodeIcon = L.AwesomeMarkers.icon({
  icon: 'circle-o',
  markerColor: 'cadetblue',
  prefix: 'fa'
});

var favoriteIcon = L.AwesomeMarkers.icon({
  icon: 'star',
  markerColor: 'blue',
  prefix: 'fa'
});

_.values(locs).forEach(function(loc) {
  L.marker(loc.coords, {icon: favoriteIcon}).bindPopup(loc.desc).addTo(map);
});

$.get('data/mpls_nodes_bounded.json').then(function(data) {
  _.pairs(data).forEach(function(locPair) {
    var id = locPair[0];
    var loc = locPair[1];
    var marker = L.marker([loc.lat, loc.lon], {icon: nodeIcon})
      .bindPopup('ID: ' + id);
    markers.addLayer(marker);
  });
});

map.addLayer(markers);

map.setView(locs.triangle.coords, 15);

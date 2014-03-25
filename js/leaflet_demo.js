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

$.get('data/moa_visited.json').then(function(data) {
  var timer;
  timer = setInterval(function() {
    if (data.length <= 0) {
      clearInterval(timer);
    }
    loc = data.shift();
    L.circle([loc.lat, loc.lon], 1, {opacity: 0.5}).addTo(map);
  }, 5);
});

$.get('data/moa_path.json').then(function(data) {
  pointList = data.map(function(loc) { return [loc.lat, loc.lon]; });
  L.polyline(pointList, {color: 'red'}).addTo(map);
});

map.addLayer(markers);

map.setView(locs.triangle.coords, 15);

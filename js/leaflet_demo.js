var map = L.mapbox.map('map', 'examples.map-9ijuk24y');
var markers = new L.MarkerClusterGroup();

var locs = {
  '33308096': 'Triangle Fraternity'
};

var icons = {
  node: L.AwesomeMarkers.icon({
    icon: 'circle-o',
    markerColor: 'cadetblue',
    prefix: 'fa'
  }),
  favorite: L.AwesomeMarkers.icon({
    icon: 'star',
    markerColor: 'blue',
    prefix: 'fa'
  })
};

function getNodeCoords(nodeId) {
  var redisUrl = 'http://localhost:7379/GET/node:' + nodeId + '?jsonp=nodeCoordData';
  return $.ajax({
    type: 'GET',
    url: redisUrl,
    jsonpCallback: 'nodeCoordData',
    contentType: "application/json",
    dataType: 'jsonp'
  }).then(function(node) {
    return node.GET.split(':');
  });
}

function getAdjNodes(nodeId) {
  var redisUrl = 'http://localhost:7379/SMEMBERS/nodeadj:' + nodeId + '?jsonp=adjNodeData';
  return $.ajax({
    type: 'GET',
    url: redisUrl,
    jsonpCallback: 'adjNodeData',
    contentType: "application/json",
    dataType: 'jsonp'
  }).then(function(node) {
    return node.SMEMBERS;
  });
}

_.pairs(locs).forEach(function(loc) {
  getNodeCoords(loc[0]).then(function(coords) {
    console.log(coords);
    map.setView(coords, 15);
    L.marker(coords, {icon: icons.favorite}).bindPopup(loc[1]).addTo(map);
  });
});

getAdjNodes('33308096').then(function(nodes) {
  console.log(nodes);
});

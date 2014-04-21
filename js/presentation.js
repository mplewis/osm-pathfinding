var iterationsPerLoop = 1;
var maxFreshDots = 20;

var locs = {
  home: { name: 'Triangle Fraternity', node: '33308096' },
  keller: { name: 'Keller Hall', node: '244111945' }
};

var style = {

  icon: {
    node: L.AwesomeMarkers.icon({
      icon: 'circle-o',
      markerColor: 'cadetblue',
      prefix: 'fa'
    }),
    favorite: L.AwesomeMarkers.icon({
      icon: 'star',
      markerColor: 'blue',
      prefix: 'fa'
    }),
    start: L.AwesomeMarkers.icon({
      icon: 'flag-o',
      markerColor: 'green',
      prefix: 'fa'
    }),
    goal: L.AwesomeMarkers.icon({
      icon: 'flag-checkered',
      markerColor: 'red',
      prefix: 'fa'
    })
  },

  dot: {
    aged: {color: 'blue', opacity: 0.2},
    fresh: {color: '#ff4400', opacity: 1}
  },

  path: {
    final: {color: 'red', opacity: 0.5}
  }

};

function nodeCoords(node) {
  var reqUrl = 'http://localhost:7379/GET/node:' + node;
  var req = new XMLHttpRequest();
  req.open('GET', reqUrl, false);
  req.send();
  if (req.readyState === 4 && req.status === 200) {
    rawData = JSON.parse(req.responseText).GET;
    coords = rawData.split(':').map(function(coord) { return parseFloat(coord); });
    return coords;
  }
}

var map = L.mapbox.map('map', 'mplewis.hjdng7eb');
var markers = new L.MarkerClusterGroup();

var startFlag = null;
var goalFlag = null;

function removeStartFlag() {
  if (startFlag) {
    map.removeLayer(startFlag);
  }
  startFlag = null;
}

function removeGoalFlag() {
  if (goalFlag) {
    map.removeLayer(goalFlag);
  }
  goalFlag = null;
}

function addStartFlag(coords) {
  removeStartFlag();
  startFlag = L.marker(coords, {icon: style.icon.start}).addTo(map);
}

function addGoalFlag(coords) {
  removeGoalFlag();
  goalFlag = L.marker(coords, {icon: style.icon.goal}).addTo(map);
}

function zoomMapToFlags() {
  if (startFlag && goalFlag) {
    var group = new L.featureGroup([startFlag, goalFlag]);
    map.fitBounds(group.getBounds());
  } else if (startFlag) {
    map.setView(startFlag.getLatLng());
  } else if (goalFlag) {
    map.setView(goalFlag.getLatLng());
  }
}

var newCircles = [];
var allCircles = [];

function displayNode(coords) {
  var circle = L.circle(coords, 1, style.dot.fresh).addTo(map);
  allCircles.push(circle);
  newCircles.push(circle);
  while (newCircles.length > maxFreshDots) {
    newCircles.shift().setStyle(style.dot.aged);
  }
}

function ageAllNodes() {
  newCircles.forEach(function(circle) {
    circle.setStyle(style.dot.aged);
  });
}

function removeAllNodes() {
  allCircles.forEach(function(circle) {
    map.removeLayer(circle);
  });
}

var displayedPath = null;

function removeDisplayedPath() {
  if (displayedPath) {
    map.removeLayer(displayedPath);
  }
  displayedPath = null;
}

function displayPath(coordList) {
  removeDisplayedPath();
  displayedPath = L.polyline(coordList, style.path.final).addTo(map);
}

function clearMap() {
  removeAllNodes();
  removeDisplayedPath();
}

var worker = new Worker('js/webworker.js');

worker.addEventListener('message', function(ev) {
  var data = ev.data;
  var task = data.task;
  if (task === 'addStartFlag') {
    addStartFlag(data.coords);
  } else if (task === 'addGoalFlag') {
    addGoalFlag(data.coords);
  } else if (task === 'displayNode') {
    displayNode(data.coords);
  } else if (task === 'pathFound') {
    ageAllNodes();
    displayPath(data.path);
  } else if (task === 'noPathFound') {
    ageAllNodes();
  }
}, false);

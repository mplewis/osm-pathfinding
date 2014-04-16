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

function addStartFlag(coords) {
  L.marker(coords, {icon: style.icon.start}).addTo(map);
}

function addGoalFlag(coords) {
  L.marker(coords, {icon: style.icon.goal}).addTo(map);
}

var circles = [];

function displayNode(coords) {
  var circle = L.circle(coords, 1, style.dot.fresh).addTo(map);
  circles.push(circle);
  while (circles.length > maxFreshDots) {
    circles.shift().setStyle(style.dot.aged);
  }
}

function ageAllNodes() {
  circles.forEach(function(circle) {
    circle.setStyle(style.dot.aged);
  });
}

function displayPath(coordList) {
  L.polyline(coordList, style.path.final).addTo(map);
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

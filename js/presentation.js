var nodeDataUrl = 'data/nodes.json';
var maxFreshDots = 20;

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

var cachedNodes = null;
function getNodes() {
  if (!cachedNodes) {
    $.ajax({
      url: nodeDataUrl,
      dataType: 'json',
      async: false,
      success: function(data) {
        cachedNodes = data;
      }
    });
  }
  return cachedNodes;
}

function nodeCoords(nodeId) {
  return getNodes()[nodeId];
}

L.mapbox.accessToken="pk.eyJ1IjoiZGFvaHU1MjciLCJhIjoiY2p1cGhuNTRmMjI0MjQ0bWlncnZ1cXZhZiJ9.RLz-3NiK6crojbTnWu34Kg";
var map = L.mapbox.map('map').setView([22.50, 113.91], 14).addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));
var markers = new L.MarkerClusterGroup();

function updateLegend(map, nodes, progress) {
  this.currentText = '';
}

updateLegend.prototype.publicMethod = function (map, nodes, progress) {
  map.legendControl.removeLegend(this.currentText);
  delete map.legendControl._legends[this.currentText];

  this.currentText = '<p><a href="https://github.com/mplewis/osm-pathfinding" target="_blank">View the code on Github</a></p>' +
                '<p>Nodes Searched: ' + String(nodes) + '<br>' + 
                'Progress: ' + String(progress.toFixed(2)) + '%</p>';
  map.legendControl.addLegend(this.currentText, {'position': 'bottomright'});
};
var legend = new updateLegend();

legend.publicMethod(map, 0, 0);

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

function addLocFlag(coords) {
  L.marker(coords, {icon: style.icon.favorite}).addTo(map);
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
  legend.publicMethod(map, 0, 0);
}

var worker = null;

function startWorker() {
  worker = new Worker('js/webworker.js');
  worker.postMessage({
    task: 'loadNodes',
    nodes: getNodes()
  });
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
      disableStopButton();
      enableStartButton();
    } else if (task === 'noPathFound') {
      ageAllNodes();
      disableStopButton();
      enableStartButton();
    } else if (task === 'updateLegend') {
      legend.publicMethod(map, data.nodes, data.progress);
    }
  }, false);
}

function restartWorker() {
  worker.terminate();
  startWorker();
}

startWorker();

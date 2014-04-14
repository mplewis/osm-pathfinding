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



function ucs(start, goal) {
  addStartFlag(nodeCoords(start));
  addGoalFlag(nodeCoords(goal));
  var openList = [];
  openList.push(start);
  var closedSet = {};
  closedSet[start] = true;
  var cameFrom = {};

  var whileLoop = setInterval(function() {
    for (var iterations = 0; iterations < iterationsPerLoop; iterations++) {
      if (openList.length < 1) {
        clearInterval(whileLoop);
        ageAllNodes();
        throw 'No path found from ' + start + ' to ' + goal;
      }
      var current = openList.shift();
      console.log(current);
      closedSet[current] = true;
    
      displayNode(nodeCoords(current));
      if (current == goal) {
        clearInterval(whileLoop);
        ageAllNodes();
        var path = reconstructPath(cameFrom, goal);
        displayPath(path.map(nodeCoords));
        return;
      }
      var adj = adjNodes(current).filter(function(node) { return !(node in closedSet); });
      adj.forEach(function(node) {
        cameFrom[node] = current;
      });
    
      openList = openList.concat(adj);
    }
  }, 0);
}

function dfs(start, goal) {
  addStartFlag(nodeCoords(start));
  addGoalFlag(nodeCoords(goal));
  var openList = [];
  openList.push(start);
  var closedSet = {};
  closedSet[start] = true;
  var cameFrom = {};

  var whileLoop = setInterval(function() {
    for (var iterations = 0; iterations < iterationsPerLoop; iterations++) {
      if (openList.length < 1) {
        clearInterval(whileLoop);
        ageAllNodes();
        throw 'No path found from ' + start + ' to ' + goal;
      }
      var current = openList.pop();
      console.log(current);
      closedSet[current] = true;
    
      displayNode(nodeCoords(current));
      if (current == goal) {
        clearInterval(whileLoop);
        ageAllNodes();
        var path = reconstructPath(cameFrom, goal);
        displayPath(path.map(nodeCoords));
        return;
      }
      var adj = adjNodes(current).filter(function(node) { return !(node in closedSet); });
      adj.forEach(function(node) {
        cameFrom[node] = current;
      });
    
      openList = openList.concat(adj);
    }
  }, 0);
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

worker.postMessage({
  task: 'search',
  type: 'astar',
  start: locs.home.node,
  goal: locs.keller.node
});

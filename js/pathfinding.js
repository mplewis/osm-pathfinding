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

function reconstructPath(cameFrom, currentNode) {
  if (currentNode in cameFrom) {
    return reconstructPath(cameFrom, cameFrom[currentNode]).concat(currentNode);
  } else {
    return [currentNode];
  }
}

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

function astar(start, goal) {
  addStartFlag(nodeCoords(start));
  addGoalFlag(nodeCoords(goal));
  var closedSet = {};
  var openSet = {};
  openSet[start] = true;
  var openSetCount = 1;
  var cameFrom = {};

  var gScore = {};
  gScore[start] = 0;

  var fScore = {};
  fScore[start] = gScore[start] + distNodes(start, goal);

  var whileLoop = setInterval(function() {
    for (var iterations = 0; iterations < iterationsPerLoop; iterations++) {
      if (openSetCount < 1) {
        clearInterval(whileLoop);
        ageAllNodes();
        throw 'No path found from ' + start + ' to ' + goal;
      }
      var openSetUnsorted = _.keys(openSet);
      var openSetSortedF = openSetUnsorted.sort(function(a, b) { return fScore[a] - fScore[b]; });
      var current = openSetSortedF[0];
      displayNode(nodeCoords(current));
      if (current == goal) {
        clearInterval(whileLoop);
        ageAllNodes();
        var path = reconstructPath(cameFrom, goal);
        displayPath(path.map(nodeCoords));
        return;
      }

      delete openSet[current];
      openSetCount--;
      closedSet[current] = true;
      var adj = adjNodes(current);
      for (var i = 0; i < adj.length; i++) {
        var neighbor = adj[i];
        if (neighbor in closedSet) {
          continue;
        }
        tentativeGScore = gScore[current] + distNodes(current, neighbor);
        if (!(neighbor in openSet) || tentativeGScore < gScore[neighbor]) {
          cameFrom[neighbor] = current;
          gScore[neighbor] = tentativeGScore;
          fScore[neighbor] = gScore[neighbor] + distNodes(neighbor, goal);
          if (!(neighbor in openSet)) {
            openSet[neighbor] = true;
            openSetCount++;
          }
        }
      }
    }
  }, 0);
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
  console.log('Worker said:', ev.data);
}, false);

worker.postMessage({
  task: 'search',
  type: 'gbfs',
  start: locs.home.node,
  goal: locs.keller.node
});

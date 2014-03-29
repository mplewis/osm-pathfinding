var iterationsPerLoop = 1;
var maxFreshDots = 20;
var partitionDecimalPlaces = 3;

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

var initialStartLoc = locs.home;
var initialGoalLoc = locs.keller;

var startNode = initialStartLoc.node;
var goalNode = initialGoalLoc.node;

var startCoords = nodeCoords(startNode);
var goalCoords = nodeCoords(goalNode);

var startFlag = L.marker(startCoords, {
  icon: style.icon.start,
  draggable: true
}).addTo(map);
var goalFlag = L.marker(goalCoords, {
  icon: style.icon.goal,
  draggable: true
}).addTo(map);

startFlag.on('dragend', function(e) {
  var newCoords = startFlag.getLatLng();
  startCoords = [newCoords.lat, newCoords.lng];
  var nearbyNodes = partitionNodes(startCoords, partitionDecimalPlaces);
  if (nearbyNodes.length > 0) {
    startNode = getNearestNode(startCoords, nearbyNodes);
    addCircle(nodeCoords(startNode));
  }
  deleteAllCircles();
  astar(startNode, goalNode);
});

goalFlag.on('dragend', function(e) {
  var newCoords = goalFlag.getLatLng();
  goalCoords = [newCoords.lat, newCoords.lng];
  var nearbyNodes = partitionNodes(goalCoords, partitionDecimalPlaces);
  if (nearbyNodes.length > 0) {
    goalNode = getNearestNode(goalCoords, nearbyNodes);
    addCircle(nodeCoords(goalNode));
  }
  deleteAllCircles();
  astar(startNode, goalNode);
});

function getNearestNode(coords, nodeList) {
  console.log(coords, nodeList);
  return nodeList.reduce(function(prev, curr) {
    if (distLatLon(nodeCoords(prev), startCoords) < distLatLon(nodeCoords(curr), startCoords)) {
      return prev;
    } else {
      return curr;
    }
  });
}

function truncateDecimals(number, digits) {
    var multiplier = Math.pow(10, digits);
    var adjustedNum = number * multiplier;
    var truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
    return truncatedNum / multiplier;
}

function nodeCoords(node) {
  var coords;
  var reqUrl = 'http://localhost:7379/GET/node:' + node;
  $.ajax({
    url: reqUrl,
    dataType: 'json',
    async: false,
    success: function(data) {
      coords = data.GET.split(':').map(function(coord) { return parseFloat(coord); });
    }
  });
  return coords;
}

function adjNodes(node) {
  var adj;
  var reqUrl = 'http://localhost:7379/SMEMBERS/nodeadj:' + node;
  $.ajax({
    url: reqUrl,
    dataType: 'json',
    async: false,
    success: function(data) {
      adj = data.SMEMBERS;
    }
  });
  return adj;
}

function partitionNodes(coords, decimalPlaces) {
  var adj;
  var latTrunc = truncateDecimals(coords[0], decimalPlaces);
  var lonTrunc = truncateDecimals(coords[1], decimalPlaces);
  var partition = latTrunc.toString() + ':' + lonTrunc.toString();
  var reqUrl = 'http://localhost:7379/SMEMBERS/part:' + partition;
  $.ajax({
    url: reqUrl,
    dataType: 'json',
    async: false,
    success: function(data) {
      adj = data.SMEMBERS;
    }
  });
  return adj;
}

function distLatLon(latlonA, latlonB) {
  return Math.sqrt(Math.pow(latlonB[0] - latlonA[0], 2) + Math.pow(latlonB[1] - latlonA[1], 2));
}

function distNodes(nodeA, nodeB) {
    return distLatLon(nodeCoords(nodeA), nodeCoords(nodeB));
}

function reconstructPath(cameFrom, currentNode) {
  if (currentNode in cameFrom) {
    return reconstructPath(cameFrom, cameFrom[currentNode]).concat(currentNode);
  } else {
    return [currentNode];
  }
}

var allCircles = [];
var freshCircles = [];

function addCircle(coords) {
  var circle = L.circle(coords, 1, style.dot.fresh).addTo(map);
  allCircles.push(circle);
  freshCircles.push(circle);
  while (freshCircles.length > maxFreshDots) {
    freshCircles.shift().setStyle(style.dot.aged);
  }
}

function ageAllCircles() {
  freshCircles.forEach(function(circle) {
    circle.setStyle(style.dot.aged);
  });
}

function deleteAllCircles() {
  freshCircles = [];
  while (allCircles.length > 0) {
    map.removeLayer(allCircles.shift());
  }
}

function displayPath(coordList) {
  L.polyline(coordList, style.path.final).addTo(map);
}

function astar(start, goal) {
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
        ageAllCircles();
        throw 'No path found from ' + start + ' to ' + goal;
      }
      var openSetUnsorted = _.keys(openSet);
      var openSetSortedF = openSetUnsorted.sort(function(a, b) { return fScore[a] - fScore[b]; });
      var current = openSetSortedF[0];
      addCircle(nodeCoords(current));
      if (current == goal) {
        clearInterval(whileLoop);
        ageAllCircles();
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
  var openList = [];
  openList.push(start);
  var closedSet = {};
  closedSet[start] = true;
  var cameFrom = {};

  var whileLoop = setInterval(function() {
    for (var iterations = 0; iterations < iterationsPerLoop; iterations++) {
      if (openList.length < 1) {
        clearInterval(whileLoop);
        ageAllCircles();
        throw 'No path found from ' + start + ' to ' + goal;
      }
      var current = openList.shift();
      console.log(current);
      closedSet[current] = true;
    
      addCircle(nodeCoords(current));
      if (current == goal) {
        clearInterval(whileLoop);
        ageAllCircles();
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

function gbfs(start, goal) {
  var closedSet = {};
  var openSet = {};
  openSet[start] = true;
  var openSetCount = 1;
  var cameFrom = {};

  var fScore = {};
  fScore[start] = distNodes(start, goal);

  var whileLoop = setInterval(function() {
    for (var iterations = 0; iterations < iterationsPerLoop; iterations++) {
      if (openSetCount < 1) {
        clearInterval(whileLoop);
        ageAllCircles();
        throw 'No path found from ' + start + ' to ' + goal;
      }
      var openSetUnsorted = _.keys(openSet);
      var openSetSortedF = openSetUnsorted.sort(function(a, b) { return fScore[a] - fScore[b]; });
      var current = openSetSortedF[0];
      addCircle(nodeCoords(current));
      if (current == goal) {
        clearInterval(whileLoop);
        ageAllCircles();
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
        if (!(neighbor in openSet)) {
          cameFrom[neighbor] = current;
          fScore[neighbor] = distNodes(neighbor, goal);
          if (!(neighbor in openSet)) {
            openSet[neighbor] = true;
            openSetCount++;
          }
        }
      }
    }
  }, 0);
}

function dfs(start, goal) {
  var openList = [];
  openList.push(start);
  var closedSet = {};
  closedSet[start] = true;
  var cameFrom = {};

  var whileLoop = setInterval(function() {
    for (var iterations = 0; iterations < iterationsPerLoop; iterations++) {
      if (openList.length < 1) {
        clearInterval(whileLoop);
        ageAllCircles();
        throw 'No path found from ' + start + ' to ' + goal;
      }
      var current = openList.pop();
      console.log(current);
      closedSet[current] = true;
    
      addCircle(nodeCoords(current));
      if (current == goal) {
        clearInterval(whileLoop);
        ageAllCircles();
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

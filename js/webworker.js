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

function adjNodes(node) {
  var reqUrl = 'http://localhost:7379/SMEMBERS/nodeadj:' + node;
  var req = new XMLHttpRequest();
  req.open('GET', reqUrl, false);
  req.send();
  if (req.readyState === 4 && req.status === 200) {
    return JSON.parse(req.responseText).SMEMBERS;
  }
}

function distLatLon(latlonA, latlonB) {
  return Math.sqrt(Math.pow(latlonB[0] - latlonA[0], 2) + Math.pow(latlonB[1] - latlonA[1], 2));
}

function distNodes(nodeA, nodeB) {
    return distLatLon(nodeCoords(nodeA), nodeCoords(nodeB));
}

function gbfs(start, goal) {
  self.postMessage({task: 'addStartFlag', coords: nodeCoords(start)});
  self.postMessage({task: 'addGoalFlag', coords: nodeCoords(goal)});
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

self.addEventListener('message', function(ev) {
  var msg = ev.data;
  if (msg.task === 'search') {
    if (msg.type === 'gbfs') {
      //gbfs(msg.start, msg.goal);
      self.postMessage(nodeCoords(msg.start));
    }
  }
}, false);

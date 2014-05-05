var nodes;

function nodeCoords(nodeID) {
  var node = nodes[nodeID];
  return [node.lat, node.lon];
}

function adjNodes(nodeID) {
  var node = nodes[nodeID];
  return node.adj;
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

function addStartFlag(coords) {
  self.postMessage({task: 'addStartFlag', coords: coords});
}

function addGoalFlag(coords) {
  self.postMessage({task: 'addGoalFlag', coords: coords});
}

function displayNode(coords) {

  //setInterval(function() {self.postMessage({ task: 'displayNode', coords: coords}); }, 1)  // time in milliseconds

  self.postMessage({task: 'displayNode', coords: coords});
}

function noPathFound() {
  self.postMessage({task: 'noPathFound'});
}

function pathFound(nodes) {
  self.postMessage({task: 'pathFound', path: nodes});
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

  var whileloop = setInterval(function() {

      if (openSetCount < 1) {
        clearInterval(whileLoop);
        noPathFound();
        return;
      }
      var openSetUnsorted = [];
      for (var k in openSet) openSetUnsorted.push(k);
      var openSetSortedF = openSetUnsorted.sort(function(a, b) { return fScore[a] - fScore[b]; });
      var current = openSetSortedF[0];

      displayNode(nodeCoords(current));

      if (current == goal) {
        clearInterval(whileLoop);
        var path = reconstructPath(cameFrom, goal);
        var pathCoords = path.map(nodeCoords);
        pathFound(pathCoords);
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

  }, 1000)   // number of ms


}

function bfs(start, goal) {
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
  fScore[start] = gScore[start];

  var looping = true;
  while (looping) {
    if (openSetCount < 1) {
      looping = false;
      noPathFound();
      return;
    }
    var openSetUnsorted = [];
    for (var k in openSet) openSetUnsorted.push(k);
    var openSetSortedF = openSetUnsorted.sort(function(a, b) { return fScore[a] - fScore[b]; });
    var current = openSetSortedF[0];
    displayNode(nodeCoords(current));
    if (current == goal) {
      looping = false;
      var path = reconstructPath(cameFrom, goal);
      var pathCoords = path.map(nodeCoords);
      pathFound(pathCoords);
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
        fScore[neighbor] = gScore[neighbor];
        if (!(neighbor in openSet)) {
          openSet[neighbor] = true;
          openSetCount++;
        }
      }
    }
  }
}

function gbfs(start, goal) {
  addStartFlag(nodeCoords(start));
  addGoalFlag(nodeCoords(goal));
  var closedSet = {};
  var openSet = {};
  openSet[start] = true;
  var openSetCount = 1;
  var cameFrom = {};

  var fScore = {};
  fScore[start] = distNodes(start, goal);

  var looping = true;
  while (looping) {
    if (openSetCount < 1) {
      looping = false;
      noPathFound();
      return;
    }
    var openSetUnsorted = [];
    for (var k in openSet) openSetUnsorted.push(k);
    var openSetSortedF = openSetUnsorted.sort(function(a, b) { return fScore[a] - fScore[b]; });
    var current = openSetSortedF[0];
    displayNode(nodeCoords(current));
    if (current == goal) {
      looping = false;
      var path = reconstructPath(cameFrom, goal);
      var pathCoords = path.map(nodeCoords);
      pathFound(pathCoords);
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
}

function ucs(start, goal) {
  addStartFlag(nodeCoords(start));
  addGoalFlag(nodeCoords(goal));
  var openList = [];
  openList.push(start);
  var closedSet = {};
  closedSet[start] = true;
  var cameFrom = {};

  var looping = true;
  while (looping) {
    if (openList.length < 1) {
      looping = false;
      noPathFound();
      return;
    }
    var current = openList.shift();
  
    displayNode(nodeCoords(current));
    if (current == goal) {
      looping = false;
      var path = reconstructPath(cameFrom, goal);
      var pathCoords = path.map(nodeCoords);
      pathFound(pathCoords);
      return;
    }
    var adj = adjNodes(current).filter(function(node) { return !(node in closedSet); });
    adj.forEach(function(node) {
      cameFrom[node] = current;
      closedSet[node] = true;
    });
  
    openList = openList.concat(adj);
  }
}

function dfs(start, goal) {
  addStartFlag(nodeCoords(start));
  addGoalFlag(nodeCoords(goal));
  var openList = [];
  openList.push(start);
  var closedSet = {};
  closedSet[start] = true;
  var cameFrom = {};

  var looping = true;
  while (looping) {
    if (openList.length < 1) {
      looping = false;
      noPathFound();
      return;
    }
    var current = openList.pop();
    closedSet[current] = true;
  
    displayNode(nodeCoords(current));
    if (current == goal) {
      looping = false;
      var path = reconstructPath(cameFrom, goal);
      var pathCoords = path.map(nodeCoords);
      pathFound(pathCoords);
      return;
    }
    var adj = adjNodes(current).filter(function(node) { return !(node in closedSet); });
    adj.forEach(function(node) {
      cameFrom[node] = current;
    });
  
    openList = openList.concat(adj);
  }
}

self.addEventListener('message', function(ev) {
  var msg = ev.data;
  if (msg.task === 'search') {
    if (msg.type === 'gbfs') {
      gbfs(msg.start, msg.goal);
    } else if (msg.type === 'astar') {
      astar(msg.start, msg.goal);
    } else if (msg.type === 'bfs') {
      bfs(msg.start, msg.goal);
    } else if (msg.type === 'ucs') {
      ucs(msg.start, msg.goal);
    } else if (msg.type === 'dfs') {
      dfs(msg.start, msg.goal);
    }
  } else if (msg.task === 'loadNodes') {
    nodes = msg.nodes;
  }
}, false);

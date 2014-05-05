var nodes;
var searchDelay = 0;   // in milliseconds

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

// From http://stackoverflow.com/a/12646864/2811887
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function addStartFlag(coords) {
  self.postMessage({task: 'addStartFlag', coords: coords});
}

function addGoalFlag(coords) {
  self.postMessage({task: 'addGoalFlag', coords: coords});
}

function displayNode(coords) {
  self.postMessage({task: 'displayNode', coords: coords});
}

function noPathFound() {
  self.postMessage({task: 'noPathFound'});
}

function pathFound(nodes) {
  self.postMessage({task: 'pathFound', path: nodes});
}

function updateLegend(nodes, progress) {
  self.postMessage({task: 'updateLegend', nodes: nodes, progress: progress});
}

function astar(start, goal) {
  addStartFlag(nodeCoords(start));
  addGoalFlag(nodeCoords(goal));
  var closedSet = {};
  var openSet = {};
  openSet[start] = true;
  var openSetCount = 1;
  var totalNodesSeen = 1;
  var cameFrom = {};
  var progress = 0;

  var gScore = {};
  gScore[start] = 0;

  var fScore = {};
  fScore[start] = gScore[start] + distNodes(start, goal);

  var whileLoop;

  var algo = function() {
    if (openSetCount < 1) {
      clearInterval(whileLoop);
      looping = false;
      noPathFound();
      return;
    }
    var openSetUnsorted = [];
    for (var k in openSet) openSetUnsorted.push(k);
    var openSetSortedF = openSetUnsorted.sort(function(a, b) { return fScore[a] - fScore[b]; });
    var current = openSetSortedF[0];

    displayNode(nodeCoords(current));

    var currProgress = (1 - distNodes(current, goal) / distNodes(start, goal)) * 100;
    if (currProgress > progress) {
      progress = currProgress;
    }
    updateLegend(totalNodesSeen, progress);
    if (current == goal) {
      clearInterval(whileLoop);
      looping = false;
      var path = reconstructPath(cameFrom, goal);
      var pathCoords = path.map(nodeCoords);
      pathFound(pathCoords);
      updateLegend(totalNodesSeen, 100);
      return;
    }

    delete openSet[current];
    openSetCount--;
    totalNodesSeen++;
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
  };

  if (searchDelay < 0) {
    var looping = true;
    whileLoop = 0;
    while (looping) {
      algo();
    }
  } else {
    whileLoop = setInterval(algo, searchDelay);
  }
}

function bfs(start, goal) {
  addStartFlag(nodeCoords(start));
  addGoalFlag(nodeCoords(goal));
  var closedSet = {};
  var openSet = {};
  openSet[start] = true;
  var openSetCount = 1;
  var totalNodesSeen = 1;
  var cameFrom = {};
  var progress = 0;

  var gScore = {};
  gScore[start] = 0;

  var fScore = {};
  fScore[start] = gScore[start];


var whileLoop;

  var algo = function() {
    if (openSetCount < 1) {
      clearInterval(whileLoop);
      looping = false;
      noPathFound();
      return;
    }
    var openSetUnsorted = [];
    for (var k in openSet) openSetUnsorted.push(k);
    var openSetSortedF = openSetUnsorted.sort(function(a, b) { return fScore[a] - fScore[b]; });
    var current = openSetSortedF[0];
    displayNode(nodeCoords(current));

    var currProgress = (1 - distNodes(current, goal) / distNodes(start, goal)) * 100;
    if (currProgress > progress) {
      progress = currProgress;
    }
    updateLegend(totalNodesSeen, progress);

    if (current == goal) {
      clearInterval(whileLoop);
      looping = false;
      var path = reconstructPath(cameFrom, goal);
      var pathCoords = path.map(nodeCoords);
      pathFound(pathCoords);
      updateLegend(totalNodesSeen, 100);
      return;
    }

    delete openSet[current];
    openSetCount--;
    closedSet[current] = true;
    var adj = adjNodes(current);
    shuffleArray(adj);
    for (var i = 0; i < adj.length; i++) {
      var neighbor = adj[i];
      if (neighbor in closedSet) {
        continue;
      }
      totalNodesSeen++;
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
  };

  if (searchDelay < 0) {
    var looping = true;
    whileLoop = 0;
    while (looping) {
      algo();
    }
  } else {
    whileLoop = setInterval(algo, searchDelay);
  }
}

function gbfs(start, goal) {
  addStartFlag(nodeCoords(start));
  addGoalFlag(nodeCoords(goal));
  var closedSet = {};
  var openSet = {};
  openSet[start] = true;
  var openSetCount = 1;
  var totalNodesSeen = 1;
  var cameFrom = {};
  var progress = 0;

  var fScore = {};
  fScore[start] = distNodes(start, goal);

  var whileLoop;

  var algo = function() {
    if (openSetCount < 1) {
      clearInterval(whileLoop);
      looping = false;
      noPathFound();
      return;
    }
    var openSetUnsorted = [];
    for (var k in openSet) openSetUnsorted.push(k);
    var openSetSortedF = openSetUnsorted.sort(function(a, b) { return fScore[a] - fScore[b]; });
    var current = openSetSortedF[0];
    displayNode(nodeCoords(current));

    var currProgress = (1 - distNodes(current, goal) / distNodes(start, goal)) * 100;
    if (currProgress > progress) {
      progress = currProgress;
    }
    updateLegend(totalNodesSeen, progress);

    if (current == goal) {
      clearInterval(whileLoop);
      looping = false;
      var path = reconstructPath(cameFrom, goal);
      var pathCoords = path.map(nodeCoords);
      pathFound(pathCoords);
      updateLegend(totalNodesSeen, 100);
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
      totalNodesSeen++;
      if (!(neighbor in openSet)) {
        cameFrom[neighbor] = current;
        fScore[neighbor] = distNodes(neighbor, goal);
        if (!(neighbor in openSet)) {
          openSet[neighbor] = true;
          openSetCount++;
        }
      }
    }

  };

  if (searchDelay < 0) {
    var looping = true;
    whileLoop = 0;
    while (looping) {
      algo();
    }
  } else {
    whileLoop = setInterval(algo, searchDelay);
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
  var totalNodesSeen = 1;
  var progress = 0;

  var whileLoop;

  var algo = function() {
    if (openList.length < 1) {
      clearInterval(whileLoop);
      looping = false;
      noPathFound();
      return;
    }
    var current = openList.shift();

    displayNode(nodeCoords(current));

    var currProgress = (1 - distNodes(current, goal) / distNodes(start, goal)) * 100;
    if (currProgress > progress) {
      progress = currProgress;
    }
    updateLegend(totalNodesSeen, progress);

    if (current == goal) {
      clearInterval(whileLoop);
      looping = false;
      var path = reconstructPath(cameFrom, goal);
      var pathCoords = path.map(nodeCoords);
      pathFound(pathCoords);
      updateLegend(totalNodesSeen, 100);
      return;
    }
    var adj = adjNodes(current).filter(function(node) { return !(node in closedSet); });
    shuffleArray(adj);
    adj.forEach(function(node) {
      cameFrom[node] = current;
      closedSet[node] = true;
      totalNodesSeen++;
    });

    openList = openList.concat(adj);
  };

  if (searchDelay < 0) {
    var looping = true;
    whileLoop = 0;
    while (looping) {
      algo();
    }
  } else {
    whileLoop = setInterval(algo, searchDelay);
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
  var totalNodesSeen = 1;
  var progress = 0;

  var whileLoop;

  var algo = function() {
    if (openList.length < 1) {
      setInterval(whileLoop);
      noPathFound();
      return;
    }
    var current = openList.pop();
    closedSet[current] = true;

    displayNode(nodeCoords(current));

    var currProgress = (1 - distNodes(current, goal) / distNodes(start, goal)) * 100;
    if (currProgress > progress) {
      progress = currProgress;
    }
    updateLegend(totalNodesSeen, progress);

    if (current == goal) {
      clearInterval(whileLoop);
      looping = false;
      var path = reconstructPath(cameFrom, goal);
      var pathCoords = path.map(nodeCoords);
      pathFound(pathCoords);
      updateLegend(totalNodesSeen, 100);
      return;
    }
    var adj = adjNodes(current).filter(function(node) { return !(node in closedSet); });
    shuffleArray(adj);
    adj.forEach(function(node) {
      cameFrom[node] = current;
      totalNodesSeen++;
    });

    openList = openList.concat(adj);
  };

  if (searchDelay < 0) {
    var looping = true;
    whileLoop = 0;
    while (looping) {
      algo();
    }
  } else {
    whileLoop = setInterval(algo, searchDelay);
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
  } else if (msg.task === 'searchDelay') {
    searchDelay = msg.searchDelay;
  }
}, false);

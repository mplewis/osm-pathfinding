$.getJSON('data/locs.json', function(locs) {
  locs.forEach(function(loc) {
    var newOption = $('<option>').text(loc.name).val(loc.node);
    $('select.loc').append(newOption);
  });
}).then(function() {
  $('select').chosen();
});

$('select#start').change(function() {
  var node = $('select#start').val();
  addStartFlag(nodeCoords(node));
});

$('select#goal').change(function() {
  var node = $('select#goal').val();
  addGoalFlag(nodeCoords(node));
});

$('button#go').click(function() {
  var algo = $('select#algo').val();
  var startNode = $('select#start').val();
  var goalNode = $('select#goal').val();
  worker.postMessage({
    task: 'search',
    type: algo,
    start: startNode,
    goal: goalNode
  });
});

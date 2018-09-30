// Let's first initialize sigma:
var s = new sigma('container');

function addNodeToGraph(node) {
  s.graph.addNode(node);
}

var greenNodes = [];
var redNodes = [];
var greyNodes = [];

var numberOfNodesPerLine = 6

for(var i=0; i<20; i++) {
  greenNodes.push({
    id: `n${i}`,
    label: `Stake: ${parseInt(Math.random()*10000)}`,
    x: i % numberOfNodesPerLine,
    y: parseInt(i/numberOfNodesPerLine),
    size: 1,
    color: '#0F0'
  })
}


greenNodes.map((node) => {
  addNodeToGraph(node);
})
// Then, let's add some data to display:
// }).addEdge({
//   id: 'e0',
//   // Reference extremities:
//   source: 'n0',
//   target: 'n1'
// });

// Finally, let's ask our sigma instance to refresh:
s.refresh();

// Let's first initialize sigma:
var GREEN = '#0F0'
var RED = '#F00'
var BLACK = '#000'
var nodes = []
var edges = []
var edgesTo = {}

var s = new sigma({
  container: 'container',
  settings: {
    sideMargin: 0.3,
    minArrowSize: 9,
    minEdgeSize: 3.0,
    maxEdgeSize: 3.0,
  }
});

function getNodeByNodeId(nodeId) {
  for(var i=0; i< nodes.length; i++) 
    if(nodes[i].id == nodeId)
      return nodes[i]
  return null
}

function getWeightByNodeId(nodeId) {
  var node = getNodeByNodeId(nodeId)
  if(node)
    return node.weight
  return 0
}
function addNodeToGraph(node) {
  if(!node.incoming)
    node.incoming = 0
  if(!node.weight)
    node.weight = parseInt(Math.random()*1000)
  nodes.push(node)
  s.graph.addNode(node);
}

function addEdgeToGraph(src, target) {
  edge = {
    id: edges.length,
    source: src,
    target: target,
    size: 5,
    color: '#BB9',
    type: 'arrow'
  }
  if(!edgesTo[target])
    edgesTo[target] = []
  var srcAndWeight = {}
  edgesTo[target].push({srcId: src, weight: getWeightByNodeId(src)})
  edges.push(edge)
  s.graph.addEdge(edge)
}

function weightedChoice(array) {
  var sumOfWeights = array.reduce(function(memo, element) {
    return memo + element.weight
  }, 0)
  var selectedWeigths = {}
  var random = Math.floor(Math.random() * (sumOfWeights + 1))
  for(var i=0; i<array.length;i++) {
    random -= array[i].weight
    if(random <= 0)
      return array[i]
  }
}

var MAX_VERTICAL_NODES = 6
var genesisNode = {
  id: '0',
  label: "Genesis",
  x: 0,
  y: MAX_VERTICAL_NODES/2,
  size: 1,
  color: GREEN,
  incoming: 2
}

addNodeToGraph(genesisNode)

addNodeToGraph({
  id: '1',
  x: 1,
  y: 2,
  size: 1,
  color: BLACK
})

addNodeToGraph({
  id: '2',
  x: 1,
  y: 4,
  size: 1,
  color: BLACK
})
addEdgeToGraph('1','0')
addEdgeToGraph('2','0')

function getTwoTips() {
  var tips = []
  nodes = nodes.map(node => {
    if(tips.length < 2 && node.id != '0') {
      tips.push(node)
      node.incoming += 1
    }
    return node
  })
  return tips
}

for(var i=0;i<10;i++) {
  addNodeToGraph({
    id: `${3+i}`,
    label: `${3+i}`,
    x: 2+parseInt(i/4),
    y: 1+(i%4),
    size: 1,
    color: BLACK
  })

  var tips = getTwoTips()
  console.log(i,'Got tips', tips[0].id, tips[1].id)
  addEdgeToGraph(`${3+i}`, tips[0].id)
  addEdgeToGraph(`${3+i}`, tips[1].id)
}

console.log(weightedChoice(edgesTo[0]))
// var numberOfHorizontalNodes = 3
// var numberOfGreenNodes = numberOfHorizontalNodes * 2
// var numberOfRedNodes = numberOfHorizontalNodes * 2

// for(var i=0; i<20; i++) {
//   nodes.push({
//     id: `n${i}`,
//     label: `Stake: ${parseInt(Math.random()*10000)}`,
//     y: i % numberOfHorizontalNodes,
//     x: parseInt(i/numberOfHorizontalNodes),
//     size: 1,
//     color: i < numberOfGreenNodes ? '#0F0' : (i< numberOfRedNodes + numberOfGreenNodes ? '#F00' : '#000'),
//     status: i < numberOfGreenNodes ? 'confirmed' : (i< numberOfRedNodes + numberOfGreenNodes ? 'pending' : 'new') 
//   })
// }


// nodes.map((node) => {
//   addNodeToGraph(node);
// })


// var edges = {}
// nodes.map(node => edges[node.id] = [])

// nodes.slice(1).map((source) => {
//   if(source.status == 'confirmed') {
//     while(edges[source].length < 2)
//       nodes.map((target) => {
//         if(source.id != target.id && target.status != 'new')
//           addEdgeToGraph({
//             source: source.id,
//             target: target.id,
//             id: `e${source.id}${target.id}`
//           });
//       })
//   }
// })

// console.log(s.graph.astar('n0','n5'))
// Then, let's add some data to display:
// }).addEdge({
//   id: 'e0',
//   // Reference extremities:
//   source: 'n0',
//   target: 'n1'
// });

// Finally, let's ask our sigma instance to refresh:
s.refresh();

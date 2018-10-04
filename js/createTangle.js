// Let's first initialize sigma:
var GREEN = '#0F0'
var RED = '#F00'
var BLACK = '#000'
var nodes = []
var pendingNodes = []
var edges = []
var edgesTo = {}

var s = new sigma({
  container: 'container',
  renderer: {
    container: document.getElementById('container'),
    type: sigma.renderers.canvas
  },
  settings: {
    sideMargin: 1.5,
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
    color: '#BBF',
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

function weightedRandomWalk(start) {
  while(edgesTo[start] && edgesTo[start].length > 0) {
    start = weightedChoice(edgesTo[start]).srcId
  }
  return start
}

function getConfirmationConfidence(nodeId) {
  var noOfConfirmations = 0
  for(var i=0; i<200; i++) {
    var tip = weightedRandomWalk(0)
    if(s.graph.astar(String(tip), String(nodeId)))
      noOfConfirmations++
  }
  return noOfConfirmations/2
}

function updateNodeColor() {
  s.graph.nodes().forEach(node => {
    var id = parseInt(node.id)
    var confirmationConfidence = getConfirmationConfidence(id)
    if(confirmationConfidence > 90 && edgesTo[id] && edgesTo[id].length>0) {
      node.color = GREEN
      node.label = String(confirmationConfidence)
    }
    else if(edgesTo[id] && edgesTo[id].length > 0) {
      node.color = RED
      node.label = String(confirmationConfidence)
    }
    else {
      node.color = BLACK
      node.label = String(confirmationConfidence)
    }
  })
}

var xVal = 0
var yVal = 0
function createTransaction(endBatch=false) {
  var node = {
    id: `${nodes.length}`,
    label: `Node: ${nodes.length}`,
    x: xVal,
    y: yVal,
    size: 1,
    color: BLACK,
  }
  if(endBatch) {
    xVal++;
    yVal = 0
  }
  else
    yVal++;
  addNodeToGraph(node)
  return node
}


createTransaction(true)

createTransaction()
createTransaction(true)
addEdgeToGraph('1','0')
addEdgeToGraph('2','0')

function getTwoTips() {
  var tip1 = weightedRandomWalk(0)
  var tip2 = tip1
  for(var i=0;i<5000;i++) {
    tip2 = weightedRandomWalk(0)
    if(tip1 != tip2)
      break
  }
  var tips = [getNodeByNodeId(tip1), getNodeByNodeId(tip2)]
  return tips
}

for(var i=0;i<12;i++) {
  var burst = Math.floor(3 + Math.random() * 4)
  for(var j=0; j< burst; j++) {
    pendingNodes.push(createTransaction(j+1 >= burst ? true : false))
  }
  startApproval()
}

function startApproval() {
  var pendingTips = pendingNodes.map(node => getTwoTips())
  for(var l=0; l< pendingTips.length; l++) {
    addEdgeToGraph(pendingNodes[l].id, pendingTips[l][0].id)
    addEdgeToGraph(pendingNodes[l].id, pendingTips[l][1].id)
  }
  pendingNodes = []
}

updateNodeColor()
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

document.querySelectorAll('.createTransaction').forEach(element => element.addEventListener("click", (e) => {
  var endBatch = e.target.classList.contains('endBatch')
  pendingNodes.push(createTransaction(endBatch))
  s.refresh()
}))

document.querySelector('.startApproval').addEventListener('click', (e) => {
  startApproval()
  updateNodeColor()
  s.refresh()
})

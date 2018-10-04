// Let's first initialize sigma:
var RED = '#F00'
var GREEN = '#0F0'
var BLUE = '#00F'
var BLACK = '#000'
var YELLOW = '#FF0'
var nodes = []
var pendingNodes = []
var edges = []
var edgesTo = {}
var edgesFrom = {}
var delay = 500

var s = new sigma({
  container: 'container',
  renderer: {
    container: document.getElementById('container'),
    type: sigma.renderers.canvas
  },
  settings: {
    sideMargin: 1.0,
    minArrowSize: 9,
    minEdgeSize: 3.0,
    maxEdgeSize: 3.0,
  }
});

function sleep(ms=delay) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

function findNodeFromGraph(nodeId) {
  return s.graph.nodes().find(node => node.id == nodeId)
}

function addNodeToGraph(node) {
  if(!node.incoming)
    node.incoming = 0
  if(!node.weight)
    node.weight = parseInt(Math.random()*1000)
  node.label = `Stake: ${node.weight}`
  edgesTo[parseInt(node.id)] = []
  edgesFrom[parseInt(node.id)] = []
  nodes.push(node)
  s.graph.addNode(node);
}

function addEdgeToGraph(src, target) {
  edge = {
    id: edges.length,
    source: src,
    target: target,
    size: 1,
    color: '#BBF',
    type: 'arrow'
  }
  edgesTo[target].push({srcId: src, weight: getWeightByNodeId(src)})
  edgesFrom[src].push({srcId: src})
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
    }
    else if(edgesTo[id] && edgesTo[id].length > 0) {
      node.color = RED
    }
    else {
      node.color = BLACK
    }
  })
}

var xVal = 0
var yVal = 0
function endBatch() {
  xVal++
  yVal = 0
}

function createTransaction() {
  var node = {
    id: `${nodes.length}`,
    x: xVal,
    y: yVal,
    size: 1,
    color: BLACK,
  }
  yVal++
  addNodeToGraph(node)
  return node
}


createTransaction()
endBatch()

createTransaction()
createTransaction()
endBatch()

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

for(var i=0;i<3;i++) {
  var burst = Math.floor(3 + Math.random() * 4)
  for(var j=0; j< burst; j++) {
    pendingNodes.push(createTransaction())
    if(j+1>=burst) endBatch()
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

function changeStatus(status) {
  document.querySelector('.status-value').innerText = status
}

function changeNodeColor(nodeId, color) {
  findNodeFromGraph(nodeId).color = color
  s.refresh()
}

async function blinkNode(nodeId, finalColor=BLUE, tempColor=YELLOW) {
  for(var i=0; i<2; i++) {
    changeNodeColor(nodeId, tempColor)
    await sleep(delay/5)
    changeNodeColor(nodeId, finalColor)
    await sleep(delay/5)
  }
}


async function startApprovalPOS() {
  var allTips = s.graph.nodes().filter(node => {
    var nodeId = parseInt(node.id)
    if(edgesFrom[nodeId].length > 0 && edgesTo[nodeId] == 0 )
      return true
  })
  for(var i=0; i< pendingNodes.length; i++) {
    node = pendingNodes[i]

    changeStatus('Choosing Transactions for approval')
    await blinkNode(node.id, "#DDD", '#343')
    await sleep()

    var availableTips = allTips.slice(0)
    var tips = [weightedChoice(availableTips)]
    availableTips.splice(availableTips.indexOf(tips[0]), 1)
    tips.push(weightedChoice(availableTips))

    changeStatus(`Node with Stake: ${tips[0].weight} selected for approval`)
    await blinkNode(tips[0].id)
    await sleep()

    changeStatus(`Node with Stake: ${tips[1].weight} selected for approval`)
    await blinkNode(tips[1].id)
    await sleep()

    changeStatus('Approving Transactions')
    addEdgeToGraph(node.id, tips[0].id)
    addEdgeToGraph(node.id, tips[1].id)
    await sleep()

    updateNodeColor()
    s.refresh()
    changeStatus('Idle')
    await sleep()
  }
  pendingNodes = []
}

updateNodeColor()
s.refresh();

document.querySelectorAll('.createTransaction').forEach(element => element.addEventListener("click", (e) => {
  pendingNodes.push(createTransaction())
  s.refresh()
}))

document.querySelector('.startApproval').addEventListener('click', (e) => {
  endBatch()
  startApproval()
  updateNodeColor()
  s.refresh()
})

document.querySelector('.startApprovalPOS').addEventListener('click', (e) => {
  endBatch()
  startApprovalPOS()
  s.refresh()
})

document.querySelector('#speed').addEventListener('input', (e) => {
  delay = e.target.value
})

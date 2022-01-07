const { cos, sin, round, floor, ceil, min, max, abs, sqrt, atan, atan2 } = Math;
function xyArrayHas(arr,arr2,x,y){
  for(var i=0; i<arr.length; i+=3){
    if(arr[i] === x && arr[i+1] === y){
      return true
    }
  }
  for(var i=0; i<arr2.length; i+=3){
    if(arr2[i] === x && arr2[i+1] === y){
      return true
    }
  }
}
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

var c = document.querySelector("#c")
var ctx = c.getContext("2d")
function setSize(w,h){
  c.width = w
  c.height = h
  c.style.width = w+"px"
  c.style.height = h+"px"
}

var tint = {
  0: "#4B0000",
  1: "#6F0000",
  2: "#790000",
  3: "#820000",
  4: "#8C0000",
  5: "#970000",
  6: "#A10000",
  7: "#AB0000",
  8: "#B50000",
  9: "#BF0000",
  10: "#CA0000",
  11: "#D30000",
  12: "#DD0000",
  13: "#E70600",
  14: "#F11B00",
  15: "#FC3100"
}

var blockData = [
  {
    name:"air"
  },
  {
    name:"redstoneWire",
    Name:"Redstone Wire",
    draw: function(x,y){
      var tags = world.getTags(x,y)
      if(!tags){
        return
      }
      var {left,right,up,down} = tags
      ctx.fillStyle = tint[tags.power]
      x *= size
      y *= size
      ctx.fillRect(x+s2-6,y+s2-6,12,12)
      if(right){
        ctx.fillRect(x+s2,y+s2-3,s2,6)
      }
      if(left){
        ctx.fillRect(x,y+s2-3,s2,6)
      }
      if(down){
        ctx.fillRect(x+s2-3,y+s2,6,s2)
      }
      if(up){
        ctx.fillRect(x+s2-3,y,6,s2)
      }
    },
    onupdate: function(x,y){
      var tags = world.getTags(x,y)
      if(!tags){
        tags = {
          power:0,
          right:0,
          left:0,
          up:0,
          down:0
        }
        world.setTags(x,y,tags)
      }
      var right = world.getBlock(x+1,y)
      var left = world.getBlock(x-1,y)
      var down = world.getBlock(x,y+1)
      var up = world.getBlock(x,y-1)
      tags.right = connectable(right)
      tags.left = connectable(left)
      tags.up = connectable(up)
      tags.down = connectable(down)
    },
    onplace:function(x,y){
      var tags = world.getTags(x,y)
      tags.power = world.getRedstoneWirePower(x,y)
      if(tags.power) world.spreadPower(x,y,tags.power)
    },
    ondelete:function(x,y, prevTags){
      var tags = prevTags
      if(tags.power) world.unspreadPower(x,y,tags.power)
    }
  },
  {
    name:"redstoneBlock",
    Name:"Block of Redstone",
    draw: function(x,y){
      ctx.fillStyle = "#d22"
      ctx.fillRect(x*size, y*size, size,size)
    },
    onplace: function(x,y){
      world.setTags(x,y,{power:16})
      world.spreadPower(x,y, 15)
    },
    ondelete: function(x,y){
      world.unspreadPower(x,y, 15)
    }
  },
  {
    name:"stone",
    Name:"Stone",
    draw: function(x,y){
      ctx.fillStyle = "#aaa"
      ctx.fillRect(x*size, y*size, size,size)
    }
  }
]
var blockIds = {}
blockData.forEach((block, i) => {
  blockIds[block.name] = i
  block.id = i
  block.Name = block.Name || block.name
})

var connectables = [blockIds.redstoneWire, blockIds.redstoneBlock]
var connectable = id => connectables.includes(id)

var selected = 0
var blockPicker = document.querySelector("#blocks")
function unselect(){
  var div = document.querySelector("#blocks > div.selected")
  div.classList.remove("selected")
}
blockData.forEach((b, i) => {
  var div = document.createElement("div")
  div.innerHTML = b.Name + "<br>"
  div.setAttribute("block-id", i)
  if(i === selected) div.classList.add("selected")
  div.onclick = function(){
    var id = parseInt(this.getAttribute("block-id"))
    selected = id
    unselect()
    this.classList.add("selected")
  }
  blockPicker.appendChild(div)
})

class World{
  constructor(){
    this.blocks = []
    this.tags = []

    this.update = [] //blocks to update

    this.width = 64
    this.height = 64
  }
  getIndex(x,y){
    if(x < 0 || y < 0 || x >= this.width || y >= this.height) return -1
    return x + y*this.width
  }
  getBlock(x,y){
    var i = this.getIndex(x,y)
    if(i < 0) return 0
    return this.blocks[i] || 0
  }
  setBlock(x,y, id){
    var i = this.getIndex(x,y)
    if(i < 0) return
    var prev = this.blocks[i]
    var prevTags = this.tags[i]
    this.blocks[i] = id

    this.tags[i] = null

    this.updateBlock(x,y,   x,y)
    this.updateBlock(x+1,y, x,y)
    this.updateBlock(x-1,y, x,y)
    this.updateBlock(x,y+1, x,y)
    this.updateBlock(x,y-1, x,y)

    if(blockData[id].onplace){
      blockData[id].onplace(x,y)
    }
    if(prev && blockData[prev].ondelete){
      blockData[prev].ondelete(x,y, prevTags)
    }
  }
  getTags(x,y){
    var i = this.getIndex(x,y)
    if(i < 0) return 0
    return this.tags[i] || null
  }
  setTags(x,y, tags){
    this.tags[this.getIndex(x,y)] = tags
  }
  updateBlock(x,y, sourceX,sourceY){ //sourceX and sourceY is the source of the update
    var b = this.getBlock(x,y)
    if(!b) return
    if(blockData[b].onupdate) blockData[b].onupdate(x,y, sourceX,sourceY)
  }

  getRedstoneConnectedTo(x,y, level){
    var spreaded = []
    var spreadAt = []
    spreadAt.push(x,y,0)
    while(spreadAt.length){
      var x = spreadAt[0]
      var y = spreadAt[1]
      var i = spreadAt[2]
      if(i < level) {
        if(!xyArrayHas(spreaded,spreadAt,x+1,y) && world.getBlock(x+1,y) === blockIds.redstoneWire) spreadAt.push(x+1,y,i+1)
        if(!xyArrayHas(spreaded,spreadAt,x-1,y) && world.getBlock(x-1,y) === blockIds.redstoneWire) spreadAt.push(x-1,y,i+1)
        if(!xyArrayHas(spreaded,spreadAt,x,y+1) && world.getBlock(x,y+1) === blockIds.redstoneWire) spreadAt.push(x,y+1,i+1)
        if(!xyArrayHas(spreaded,spreadAt,x,y-1) && world.getBlock(x,y-1) === blockIds.redstoneWire) spreadAt.push(x,y-1,i+1)
        spreaded.push(x,y,i)
      }
      spreadAt.splice(0,3)
    }

    //testing
    /*console.log(spreaded)
    var s=spreaded
    for(var i=0; i<s.length; i+=3){
      world.setBlock(s[i],s[i+1],blockIds.stone)
    }//*/

    return spreaded
  }
  spreadPower(x,y, level){
    var spread = this.getRedstoneConnectedTo(x,y,level)
    for(var i=0; i<spread.length; i+=3){
      var bx = spread[i]
      var by = spread[i+1]
      if(bx === x && by === y) continue
      var l = this.getRedstoneWirePower(bx,by)
      this.setPower(bx,by, l)
    }
  }
  unspreadPower(x,y, level){
    var spread = this.getRedstoneConnectedTo(x,y,level)
    for(var n=0; n<level; n++){
      for(var i=0; i<spread.length; i+=3){
        var bx = spread[i]
        var by = spread[i+1]
        if(bx === x && by === y) continue
        var l = this.getRedstoneWirePower(bx,by)
        this.setPower(bx,by, l)
      }
    }
  }
  getRedstoneWirePower(x,y){
    var right = this.getPower(x+1,y)
    var left = this.getPower(x-1,y)
    var down = this.getPower(x,y+1)
    var up = this.getPower(x,y-1)
    var level = max(right,left,down,up) - 1
    return level < 0 ? 0 : level
  }
  getPower(x,y){
    var tags = this.getTags(x,y)
    return (tags && tags.power) || 0
  }
  setPower(x,y, level){
    var tags = this.getTags(x,y)
    tags.power = level
  }
  /*trySpread(x, y, level, spread) {
    if(y < 0) return
    
    var f
    if (this.getPower(x, y) < level) {
      if (!blockData[this.world.getBlock(x, y, z)].blocksLight) {
        this.setPower(x, y, level)
        spread.push(x, y)
      }
    }
  }
  spreadPowerAtBlocks(blocks, level) {
    let spread = []
    let x = 0, y = 0
    for (let i = 0; i < blocks.length; i += 2) {
      x = blocks[i]
      y = blocks[i+1]
      if(y < 0) continue
      this.trySpread(x - 1, y, level, spread)
      this.trySpread(x + 1, y, level, spread)
      this.trySpread(x, y - 1, level, spread)
      this.trySpread(x, y + 1, level, spread)
    }
    if (level > 1 && spread.length) {
      this.spreadPowerAtBlocks(spread, level - 1, update, blockLight)
    }
  }*/
}

var world = new World()
var size = 32 //16 pixels
var s2 = size / 2

setSize(world.width * size, world.height * size)

var mouseX = 0, mouseY = 0, blockX = 0, blockY = 0,mouseDown = false

function getMousePos(e) {
  var rect = c.getBoundingClientRect();
  mouseX = e.clientX - rect.left
  mouseY = e.clientY - rect.top
  var x = floor(mouseX / size)
  var y = floor(mouseY / size)
  e.blockX = x
  e.blockY = y
}

function newWorldBlock(x,y){
  world.setBlock(x,y, selected)
}
c.onmousedown = function(e){
  mouseDown = true
  getMousePos(e)
  blockX = e.blockX
  blockY = e.blockY
  newWorldBlock(blockX, blockY)
}
c.onmouseup = function(e){
  mouseDown = false
}
c.onmousemove = function(e){
  getMousePos(e)
  if(mouseDown && (e.blockX !== blockX || e.blockY !== blockY)){
    blockX = e.blockX
    blockY = e.blockY
    newWorldBlock(e.blockX, e.blockY)
  }
}

function draw(){
  ctx.clearRect(0,0,c.width,c.height)
  for(var i=0; i<world.blocks.length; i++){
    var b = world.blocks[i]
    if(b){
      var y = floor(i / world.width)
      var x = i - (y * world.width)
      blockData[b].draw(x,y)
    }
  }
  requestAnimationFrame(draw)
}
onload = () => draw()
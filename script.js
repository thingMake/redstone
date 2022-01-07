const { cos, sin, round, floor, ceil, min, max, abs, sqrt, atan, atan2 } = Math;
function xyArrayHas(arr,x,y){
  for(var i=0; i<arr.length; i++){
    if(arr[i].x === x && arr[i].y === y){
      return true
    }
  }
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
      ctx.fillStyle = tint[tags.powerLevel]
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
          powerLevel:0,
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
      world.spreadPower(x,y, 15)
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

    this.width = 32
    this.height = 16
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
    this.blocks[i] = id

    this.tags[i] = null

    this.updateBlock(x,y,   x,y)
    this.updateBlock(x+1,y, x,y)
    this.updateBlock(x-1,y, x,y)
    this.updateBlock(x,y+1, x,y)
    this.updateBlock(x,y-1, x,y)

    if(blockData[id].onplace){
      blockData[id].onplace()
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

  spreadPower(x,y, level){
    //how???
  }
  /*updatePower(x,y){
    var right = world.getTags(x+1,y)
    var left = world.getTags(x-1,y)
    var down = world.getTags(x,y+1)
    var up = world.getTags(x,y-1)
    right = (right && right.powerLevel) || 0
    left = (left && left.powerLevel) || 0
    down = (down && down.powerLevel) || 0
    up = (up && up.powerLevel) || 0
    var level = max(right,left,down,up) - 1
    return level < 0 ? 0 : level
  }
  getPower(x,y){
    var tags = this.getTags(x,y)
    return (tags && tags.powerLevel) || 0
  }
  setPower(x,y, level){
    var tags = this.getTags(x,y)
    tags.powerLevel = level
  }
  trySpread(x, y, level, spread) {
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

var mouseX = 0, mouseY = 0, mouseDown = false

function getMousePos(evt) {
  var rect = c.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function newWorldBlock(e){
  var pos = getMousePos(e)
  mouseX = pos.x
  mouseY = pos.y
  var x = floor(pos.x / size)
  var y = floor(pos.y / size)
  var block = selected
  world.setBlock(x,y, block)
}
c.onmousedown = function(e){
  mouseDown = true
  newWorldBlock(e)
}
c.onmouseup = function(e){
  mouseDown = false
}
c.onmousemove = function(e){
  if(mouseDown){
    newWorldBlock(e)
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
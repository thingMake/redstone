//math functions and stuff
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
function lerp(t, a, b) {
  return a + t * (b - a);
}
function getDirection(d){
  var res = getDirection.result
  res.x = 0
  res.y = 0
  switch(d){
    case "right":
      res.x = 1
      break
    case "left":
      res.x = -1
      break
    case "up":
      res.y = -1
      break
    case "down":
      res.y = 1
      break
  }
  return res
}
getDirection.result = {x:0,y:0}

//other stuff
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
    name:"air",
    info: "Use this to set blocks to air."
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

      tags.right = connectable(x+1,y,"right")
      tags.left = connectable(x-1,y,"left")
      tags.up = connectable(x,y-1,"up")
      tags.down = connectable(x,y+1,"down")
      world.setTags(x,y,tags)
    },
    onplace:function(x,y){
      var tags = {
        power:0,
        right:0,
        left:0,
        up:0,
        down:0
      }
      tags.power = world.getRedstoneWirePower(x,y)
      if(tags.power) world.spreadPower(x,y,tags.power)
      world.setTags(x,y,tags)
    },
    ondelete:function(x,y, prevTags){
      var tags = prevTags
      if(tags.power) world.unspreadPower(x,y,tags.power)
    },
    info: "Power can go through this block. This block can connect to other blocks."
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
    },
    info:"A power source."
  },
  {
    name:"stone",
    Name:"Stone",
    draw: function(x,y){
      ctx.fillStyle = "#aaa"
      ctx.fillRect(x*size, y*size, size,size)
    },
    info:"A solid block."
  },
  {
    name:"redstoneLamp",
    Name:"Redstone Lamp",
    draw: function(x,y){
      var tags = world.getTags(x,y)
      ctx.fillStyle = "black"
      ctx.fillRect(x*size,y*size,size,size)//outline
      ctx.fillStyle = tags.on ? "#fa0" : "#a60"
      ctx.fillRect(x*size+2,y*size+2,size-4,size-4)
    },
    onupdate: function(x,y){
      var tags = world.getTags(x,y)
      if(!tags){
        tags = {on:false}
        world.setTags(x,y,tags)
      }
      var power = world.getRedstonePower(x,y)
      var prevOn = tags.on
      tags.on = power
      if(prevOn !== tags.on) world.setTags(x,y,tags)
    },
    detectTagChange: true,
    info:"A block that glows when it gets power."
  },
  {
    name:"redstoneRepeater",
    Name:"Redstone Repeater",
    draw: function(x,y){
      var tags = world.getTags(x,y)
      ctx.fillStyle = "#aaa"
      ctx.fillRect(x*size,y*size,size,size)
      ctx.fillStyle = tags.on ? tint[15] : tint[0]
      switch(tags.facing){
        case "right":
          ctx.fillRect(x*size+4,y*size+s2-2, size-14,4)
          break
        case "left":
          ctx.fillRect(x*size+10,y*size+s2-2, size-14,4)
          break
        case "up":
          ctx.fillRect(x*size+s2-2,y*size+10, 4,size-14)
          break
        case "down":
          ctx.fillRect(x*size+s2-2,y*size+4, 4,size-14)
      }
      ctx.fillStyle = tags.on ? "#ff4" : tint[0]
      var speed = tags.speed
      var amount = (speed-1)/3
      switch(tags.facing){
        case "right":
          ctx.fillRect(x*size+size-6,y*size+s2-2, 4,4)
          ctx.fillRect(lerp(amount,x*size+size-14,x*size+4),y*size+s2-2, 4,4)
          break
        case "left":
          ctx.fillRect(x*size+2,y*size+s2-2, 4,4)
          ctx.fillRect(lerp(amount,x*size+10,x*size+size-8),y*size+s2-2, 4,4)
          break
        case "down":
          ctx.fillRect(x*size+s2-2,y*size+size-6, 4,4)
          ctx.fillRect(x*size+s2-2,lerp(amount,y*size+size-14,y*size+4), 4,4)
          break
        case "up":
          ctx.fillRect(x*size+s2-2,y*size+2, 4,4)
          ctx.fillRect(x*size+s2-2,lerp(amount,y*size+10,y*size+size-8), 4,4)
          break
      }
    },
    onplace: function(x,y){
      var prevTags = world.getTags(x,y)
      world.setTags(x,y,{
        on:false,
        facing: (prevTags && prevTags.facing) || "right",
        speed: 1 //1 to 4
      })
    },
    onupdate: function(x,y, sx,sy){
      //detect if input got updated
      var tags = world.getTags(x,y)
      delete tags.power
      var d = getDirection(tags.facing)

      if(x + d.x === sx && y + d.y === sy && tags.on){
        var block = world.getBlock(x+d.x,y+d.y)
        var blockTags = world.getTags(x+d.x,y+d.y)
        if(!blockTags) return
        if("on" in blockTags) {
          tags.power = 16
          world.updateBlock(x+d.x,y+d.y,x,y)
          delete tags.power
        }
        if(blockTags.power !== 15){
          world.setPower(x+d.x,y+d.y,15)
          world.spreadPower(x+d.x,y+d.y,14)
        }
      }
      if(!(x - d.x === sx && y - d.y === sy) && !(sx === x && sy === y)) return

      setTimeout(function(){
        var inputTags = world.getTags(x-d.x,y-d.y)
        var prevOn = tags.on
        tags.on = (inputTags && inputTags.power && true) || false
        var block = world.getBlock(x+d.x,y+d.y) //block in front
        if(!block) return //power cannot go through air
        var blockTags = world.getTags(x+d.x,y+d.y)
        if((blockTags && blockTags.power ? true : false) !== tags.on){
          if(tags.on){
            world.setPower(x+d.x,y+d.y,15)
            world.spreadPower(x+d.x,y+d.y,14)
          }else{
            world.unspreadPower(x+d.x,y+d.y,15,true)
          }
        }
        if(blockTags && "on" in blockTags && blockTags.on !== tags.on){
          if(tags.on){
            tags.power = 16
            world.updateBlock(x+d.x,y+d.y,x,y)
            delete tags.power
          }else{
            world.updateBlock(x+d.x,y+d.y,x,y)
          }
        }
      }, tags.speed * 100)
    },
    detectTagChange:true,
    noSetPower:true,
    ondelete: function(x,y, tags){
      var d = getDirection(tags.facing)
      if(tags.on && world.getBlock(x+d.x,y+d.y)){
        world.unspreadPower(x+d.x,y+d.y,15,true)
      }
    },
    info:"A block that delays signals going through it. Click to rotate."
  }
]
var blockIds = {}
blockData.forEach((block, i) => {
  blockIds[block.name] = i
  block.id = i
  block.Name = block.Name || block.name
})

var connectables = [blockIds.redstoneWire, blockIds.redstoneBlock, blockIds.redstoneLamp]
var connectable = function(x,y, d) {
  var id = world.getBlock(x,y)
  if(connectables.includes(id)) return true
  if(id === blockIds.redstoneRepeater){
    var tags = world.getTags(x,y)
    var canIt = false
    switch(tags.facing){
      case "right":
      case "left":
        canIt = d === "left" || d === "right"
        break
      case "up":
      case "down":
        canIt = d === "up" || d === "down"
    }
    return canIt
  }
  return false
}

var selected = 0
var blockPicker = document.querySelector("#blocks")
var blockInfo = document.querySelector("#blockInfo")
function setBlockInfo(id){
  var block = blockData[id]
  if(!block.info){
    blockInfo.innerHTML = ""
    return
  }
  blockInfo.innerHTML = "<h2>"+block.Name+"</h2>"+block.info
}
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
    setBlockInfo(id)
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
  setBlock(x,y, id, tags){
    var i = this.getIndex(x,y)
    if(i < 0) return
    var prev = this.blocks[i]
    var prevTags = this.tags[i]
    this.blocks[i] = id

    this.tags[i] = tags || null

    if(prev && blockData[prev].ondelete){
      blockData[prev].ondelete(x,y, prevTags)
    }

    if(blockData[id].onplace){
      blockData[id].onplace(x,y)
    }

    this.updateBlock(x,y,   x,y)
    this.updateBlock(x+1,y, x,y)
    this.updateBlock(x-1,y, x,y)
    this.updateBlock(x,y+1, x,y)
    this.updateBlock(x,y-1, x,y)
  }
  getTags(x,y){
    var i = this.getIndex(x,y)
    if(i < 0) return 0
    return this.tags[i] || null
  }
  setTags(x,y, tags){
    this.tags[this.getIndex(x,y)] = tags

    this.tagChangeUpdate(x+1,y, x,y)
    this.tagChangeUpdate(x-1,y, x,y)
    this.tagChangeUpdate(x,y+1, x,y)
    this.tagChangeUpdate(x,y-1, x,y)
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
  unspreadPower(x,y, level, includeSource){
    var spread = this.getRedstoneConnectedTo(x,y,level)
    for(var n=0; n<level; n++){
      for(var i=0; i<spread.length; i+=3){
        var bx = spread[i]
        var by = spread[i+1]
        if(!includeSource && bx === x && by === y) continue
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
  getRedstonePower(x,y){
    var right = this.getPower(x+1,y)
    var left = this.getPower(x-1,y)
    var down = this.getPower(x,y+1)
    var up = this.getPower(x,y-1)
    var level = max(right,left,down,up)
    return level
  }
  getPower(x,y){
    var tags = this.getTags(x,y)
    return (tags && tags.power) || 0
  }
  setPower(x,y, level){
    var block = this.getBlock(x,y)
    if(block && blockData[block].noSetPower) return
    var tags = this.getTags(x,y) || {}
    tags.power = level
    this.setTags(x,y,tags)
  }
  tagChangeUpdate(x,y, sourceX,sourceY){
    var block = this.getBlock(x,y)
    if(blockData[block].detectTagChange){
      blockData[block].onupdate(x,y, sourceX,sourceY)
    }
  }
}

var world = new World()
var size = 32 //16 pixels
var s2 = size / 2

setSize(world.width * size, world.height * size)

var mouseX = 0, mouseY = 0, blockX = 0, blockY = 0,mouseDown = false, mouseButton = 0

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
  var prevBlock = world.getBlock(x,y)
  var prevTags = world.getTags(x,y)
  if(mouseButton === 2){
    world.setBlock(x,y, 0)
  }else if(prevTags && prevTags.facing && prevBlock === selected){
    var facing = prevTags.facing
    switch(facing){
      case "right":
        facing = "down"
        break
      case "down":
        facing = "left"
        break
      case "left":
        facing = "up"
        break
      case "up":
        facing = "right"
    }
    prevTags.facing = facing
    world.setBlock(x,y, selected, prevTags)
  }else{
    world.setBlock(x,y, selected)
  }
}
c.onmousedown = function(e){
  mouseDown = true
  getMousePos(e)
  blockX = e.blockX
  blockY = e.blockY
  mouseButton = e.button
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

c.oncontextmenu = function(e){
  return false
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
class Vector2{
  constructor(x, y){
    this.x = x
    this.y = y
  }

  add(v){
    return new Vector2(this.x + v.x, this.y + v.y)
  }

  subtract(v){
    return new Vector2(this.x - v.x, this.y - v.y)
  }

  multiply(v){
    return new Vector2(this.x * v.x, this.y * v.y)
  }

  crossProduct(v){
    return this.x * v.y - this.y * v.x
  }

  dotProduct(v){
    return this.x * v.x + this.y * v.y
  }

  getMagnitude(){
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  getNormalized(factor){
    const magnitude = this.getMagnitude()
    if (magnitude == 0){
      return new Vector2(0, 0)
    }
    return new Vector2((this.x / magnitude) * factor, (this.y / magnitude) * factor)
  }
}

game.width = 600
game.height = 600
POINT_RADIUS = 1
const ctx = game.getContext("2d")
const pressedKeys = {}
const RED = "rgb(255,0,0)"
const GREEN = "rgb(0,255,0)"
const GRAY = "rgb(100,100,100)"
const BLUE = "rgb(0,0,255)"
const NEW_AUXINS_FREQ = 3
const AUXIMITY = 5

function point(p, color){
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.arc(p.x, p.y, POINT_RADIUS, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.fillStyle = color
  ctx.fill()
}

function clear(){
  ctx.fillStyle = GRAY
  ctx.fillRect(0, 0, game.width, game.height)
}

function line(a, b, color){
  ctx.strokeStyle = color
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function newAuxin(){
  const x = Math.random() * game.width
  const y = Math.random() * game.height
  const auxin = new Vector2(x, y)
  if (indexOfPointToRemove(auxin, auxins) == -1 && indexOfPointToRemove(auxin, veins) == -1){
    auxins.push(auxin)
  }
}

function associateClosest(){
  for (const auxin of auxins){
    let closest = veins[0]
    let closestDistance = auxin.subtract(closest).getMagnitude()
    for (let i = 1; i < veins.length; i++){
      let newDistance = auxin.subtract(veins[i]).getMagnitude()
      if (newDistance < closestDistance){
        closest = veins[i]
        closestDistance = newDistance
      }
    }
    closest.direction = closest.direction.add(auxin.subtract(closest))
  }
}

function growVeins(){
  const newVeins = []
  for (const vein of veins){
    if (vein.direction.x != 0 && vein.direction.y != 0){
      let newVein = vein.add(vein.direction.getNormalized(POINT_RADIUS * 2))
      newVein.direction = new Vector2(0, 0)
      vein.direction = new Vector2(0, 0)
      newVeins.push(newVein)
    }
  }
  for (const vein of newVeins){
    veins.push(vein)
  }
  const indexesToRemove = []
  for (const vein of veins){
    let i = indexOfPointToRemove(vein, auxins)
    if (i >= 0){
      indexesToRemove.push(i)
    }
  }
  indexesToRemove.sort()
  indexesToRemove.reverse()
  for (const i of indexesToRemove){
    auxins.splice(i, 1)
  }
}

function indexOfPointToRemove(p, array){
  for (let i = 0; i < array.length; i++){
    if (array[i].subtract(p).getMagnitude() <= AUXIMITY){
      return i
    }
  }
  return -1
}

document.addEventListener("keydown", function(event){
  if (event.key == " "){
    for (let i = 0; i < NEW_AUXINS_FREQ; i++){
      newAuxin()
    }
    associateClosest()
    growVeins()
  }
})

const veins = [new Vector2(game.width / 2, game.height - POINT_RADIUS)]
veins[0].direction = new Vector2(0, 0)
const auxins = []

function loop(timestamp){  
  clear()

  for (const vein of veins){
    point(vein, GREEN)
    //line(vein, vein.add(vein.direction.getNormalized(POINT_RADIUS * 2)), BLUE)
  }

  for (const auxin of auxins){
    point(auxin, RED)
  }

  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
var hexnode = require('./node.js');
var HexGrid = require('./grid.js');

function pathHexagon(ctx, x, y, radius, flatten) {
    flatten = flatten === undefined ? 1 : flatten;
    ctx.beginPath();
    ctx.moveTo(x + radius, flatten * y);
    for(var i=1; i<6; i+= 1) {
        ctx.lineTo(x + radius * Math.cos(Math.PI * i / 3.0), 
                   flatten * y + radius * Math.sin(Math.PI * i / 3.0));
    }
    ctx.closePath();
}

function fillHexagon(ctx, x, y, radius, flatten) {
    pathHexagon(ctx, x, y, radius, flatten);
    ctx.fill();
}

function strokeHexagon(ctx, x, y, radius, flatten) {
    pathHexagon(ctx, x, y, radius, flatten);
    ctx.stroke();
}

window.hex = module.exports = {
    HexGrid: HexGrid,
    HexNode: hexnode.HexNode,
    HexNodeType: hexnode.HexNodeType,
    fillHexagon: fillHexagon,
    strokeHexagon: strokeHexagon,
}

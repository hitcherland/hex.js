var hexnode = require('./node.js');
var grid = require('./grid.js');

window.hex = module.exports = {
    grid: grid,
    BaseHexGrid: grid.BaseHexGrid,
    CanvasHexGrid: grid.CanvasHexGrid,
    WebGLHexGrid: grid.WebGLHexGrid,
    HexNode: hexnode.HexNode,
    HexNodeType: hexnode.HexNodeType,
}

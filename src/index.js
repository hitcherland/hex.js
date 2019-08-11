var hexnode = require('./node.js');
var grid = require('./grid.js');

window.hex = module.exports = {
    grid: grid,
    BaseHexagonalGrid: grid.BaseHexagonalGrid,
    CanvasHexagonalGrid: grid.CanvasHexagonalGrid,
    WebGLHexagonalGrid: grid.WebGLHexagonalGrid,
    DOMHexagonalGrid: grid.DOMHexagonalGrid,
    HexNode: hexnode.HexNode,
    HexNodeType: hexnode.HexNodeType,
}

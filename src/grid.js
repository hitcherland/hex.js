var base = require('./grid/base.js');
var canvas = require('./grid/canvas.js');
var webgl = require('./grid/webgl.js').default;

module.exports = {
    base: base,
    canvas: canvas,
    webgl: webgl,
    BaseHexGrid: base.BaseHexGrid,
    CanvasHexGrid: canvas.CanvasHexGrid,
    WebGLHexGrid: webgl.WebGLHexGrid,
}

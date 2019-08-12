/**
 * Container for all BaseHexagonalGrid subclasses and submodules
 * @module hexgrid.grid
 */

var base = require('./grid/base.js');
var canvas = require('./grid/canvas.js');
var webgl = require('./grid/webgl.js').default;
var dom = require('./grid/dom.js');

module.exports = {
    base: base,
    canvas: canvas,
    webgl: webgl,
    dom: dom,
    BaseHexagonalGrid: base.BaseHexagonalGrid,
    CanvasHexagonalGrid: canvas.CanvasHexagonalGrid,
    WebGLHexagonalGrid: webgl.WebGLHexagonalGrid,
    DOMHexagonalGrid: dom.DOMHexagonalGrid,
}

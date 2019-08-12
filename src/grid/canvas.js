/** A html5 canvas implementation of grid.base.BaseHexagonalGrid, 
 * with some helper functions.
 * @module hexgrid.grid.canvas
 */

var base = require('./base.js')

/**
 * Helper function, defines a path for a regular hexagon
 * @param {CanvasRenderingContext2D} ctx The context where the path should be 
 *                                       defined
 * @param {Number} x The x coordinate of the center of the hexagon
 * @param {Number} y The y coordinate of the center of the hexagon
 * @param {Number} radius The distance from the center of the hexagon to each
 *                        corner
 */
function pathHexagon(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    for(var i=1; i<6; i+= 1) {
        ctx.lineTo(x + radius * Math.cos(Math.PI * i / 3.0), 
                   y + radius * Math.sin(Math.PI * i / 3.0));
    }
    ctx.closePath();
}

/**
 * Fills a hexagon, similar to `ctx.fillRect`
 * @param {CanvasRenderingContext2D} ctx The context where the path should be
 *                                       defined
 * @param {Number} x The x coordinate of the center of the hexagon
 * @param {Number} y The y coordinate of the center of the hexagon
 * @param {Number} radius The distance from the center of the hexagon to each
 *                        corner
 */
function fillHexagon(ctx, x, y, radius) {
    pathHexagon(ctx, x, y, radius);
    ctx.fill();
}

/**
 * Strokes a hexagon, similar to `ctx.strokeRect`
 * @param {CanvasRenderingContext2D} ctx The context where the path should be
 *                                       defined
 * @param {Number} x The x coordinate of the center of the hexagon
 * @param {Number} y The y coordinate of the center of the hexagon
 * @param {Number} radius The distance from the center of the hexagon to each
 *                        corner
 */
function strokeHexagon(ctx, x, y, radius) {
    pathHexagon(ctx, x, y, radius);
    ctx.stroke();
}

/**
 * A hexagonal grid that uses HTML5's canvas.
 * Extends `BaseHexagonalGrid`.
 * @property {HTMLCanvasElement} canvas The canvas we are drawing to
 * @property {CanvasRenderingContext2D} ctx The ContextRenderingContext2D
 * instance of `CanvasHexagonalGrid.canvas`
 */
class CanvasHexagonalGrid extends base.BaseHexagonalGrid {
    /**
     * Construct a Canvas-based hexagonal grid. See 
     * `BaseHexagonalGrid.constructor` for more valid options.
     * @param {Object} options Optional values
     * @param {Object} [options.canvasPadding={x: 0, y:0}] 
     *     padding around the inside edge of the canvas, essentially shrinking
     *     the render area of the canvas
     * @param {boolean} [options.autoResize=true] Allow the grid to
     * adjust with `resize` events automatically, using 
     * `CanvasHexagonalGrid.resize()`.
     */
   constructor(canvas, options={}) {
        super(options);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        var this_ = this;
        if(this.autoResize) {
            this.resizeListener = window.addEventListener('resize', () => {
                this_.resize();
            });

            var rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }
    }

    get canvas() {
        return this._canvas;
    }

    set canvas(v) {
        this._canvas = v;
        this._ctx = v.getContext('2d');
    }

    get ctx() {
        return this._ctx;
    }

    set ctx(v) {
        this._ctx = v;
        this._canvas = v.canvas;
    }

    /**
     * Dynamic getter that defines the radius of each node, based on the size
     * of `CanvasHexagonalGrid.canvas`
     */
    get nodeRadius() {
        return this.calculateNodeRadius(
            this.canvas.width - this.canvasPadding.x,
            this.canvas.height - this.canvasPadding.y
        );
    }

    /**
     * Overridable function that is called at the start of 
     * `CanvasHexagonalGrid.render()`. By default, it clears the entire 
     * canvas using `this.ctx.clearRect`.
     */
    preRender() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Overridable function that is called during
     * `CanvasHexagonalGrid.render()`, once for each node in
     * `CanvasHexagonalGrid.nodes`. By default it strokes a black hexagon
     * around the node, of size `CanvasHexagonalGrid.nodeRadius` using
     * `strokeHexagon`.
     * @param {HexNode} node A hexagonal node
     * @param {Object} data The data stored relating to `node`.
     */
    renderNode(node, data) {
        var hR = this.nodeRadius;
        var cartesian = node.to_cartesian(hR);
        cartesian.x += this.canvas.width / 2.0;
        cartesian.y += this.canvas.height / 2.0;

        this.ctx.save();
        this.ctx.strokeStyle = 'black';
        strokeHexagon(this.ctx, cartesian.x, cartesian.y, hR);
        this.ctx.restore();
    }

    /**
     * Sets the canvas width and height to the actual size in the document,
     * and recalls `CanvasHexagonalGrid.render()` to ensure that everything 
     * looks good.
     */
    resize() {
        var rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.render();
    }
}

/**
 * Defines what the default values are for the options of this class when
 * instantiated, see `HexagonalGrid.Constructor` for more details.
 */
CanvasHexagonalGrid.prototype.default_options = Object.assign(
    {},
    base.BaseHexagonalGrid.prototype.default_options,
    {
        'canvasPadding': {x: 0, y: 0},
        'autoResize': true,
    }
)

module.exports = {
    CanvasHexagonalGrid: CanvasHexagonalGrid,
    pathHexagon: pathHexagon,
    fillHexagon: fillHexagon,
    strokeHexagon: strokeHexagon
}

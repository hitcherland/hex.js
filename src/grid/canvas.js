/** A html5 canvas implementation of grid.base.BaseHexagonalGrid, 
 * with some helper functions.
 * @module grid.canvas
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

class CanvasHexagonalGrid extends base.BaseHexagonalGrid {
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

    get nodeRadius() {
        return this.calculateNodeRadius(
            this.canvas.width - this.canvasPadding.x,
            this.canvas.height - this.canvasPadding.y
        );
    }

    preRender() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

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

    resize() {
        var rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.render();
    }
}

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

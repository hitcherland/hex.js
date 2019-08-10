var base = require('./base.js')

function pathHexagon(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    for(var i=1; i<6; i+= 1) {
        ctx.lineTo(x + radius * Math.cos(Math.PI * i / 3.0), 
                   y + radius * Math.sin(Math.PI * i / 3.0));
    }
    ctx.closePath();
}

function fillHexagon(ctx, x, y, radius) {
    pathHexagon(ctx, x, y, radius);
    ctx.fill();
}

function strokeHexagon(ctx, x, y, radius) {
    pathHexagon(ctx, x, y, radius);
    ctx.stroke();
}

class CanvasHexGrid extends base.BaseHexGrid {
   constructor(canvas, options={}) {
        super(options);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        var this_ = this;
        if(this.autoResize) {
            this.resizeListener = window.addEventListener('resize', () => {
                this_.resize();
            });
        }
    }

    get hexagonRadius() {
        return this.calculateHexRadius(
            this.canvas.width - this.canvasPadding.x,
            this.canvas.height - this.canvasPadding.y
        );
    }

    renderHexagon(node, canvasPosition, data) {
        var hR = this.hexagonRadius;
        this.ctx.save();
        this.ctx.strokeStyle = 'black';
        strokeHexagon(this.ctx, canvasPosition.x, canvasPosition.y, hR);
        this.ctx.restore();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var hR = this.hexagonRadius;
        var cx = this.canvas.width / 2.0;
        var cy = this.canvas.height / 2.0;
        for(var hexagon of Object.values(this.hexagons)) {
            var cartesian = hexagon.node.to_cartesian(hR);
            cartesian.x += cx;
            cartesian.y += cy;
            this.renderHexagon(hexagon.node, cartesian, hexagon.data);
        }
    }

    resize() {
        var rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.render();
    }
}

CanvasHexGrid.prototype.default_options = Object.assign(
    {},
    base.BaseHexGrid.prototype.default_options,
    {
        'canvasPadding': {x: 0, y: 0},
        'autoResize': true,
    }
)

module.exports = {
    CanvasHexGrid: CanvasHexGrid,
    pathHexagon: pathHexagon,
    fillHexagon: fillHexagon,
    strokeHexagon: strokeHexagon
}

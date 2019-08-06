var Hammer = require('hammerjs');
var node = require('./node.js');

const SQRT_3 = Math.sqrt(3.0);

class HexGrid {
    constructor(canvas, radius, renderFunction, events) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        radius = radius === undefined ? 5 : radius;

        this.radius = radius;
        this.renderFunction = renderFunction;
        this.hexagons = {}
        this.zoom = 1;
        new node.HexNode(0, 0).area(radius).forEach(hex => { return this.hexagons[hex.toString()] = {
            node: hex,
            state: 0,
        }});

        this.mc = new Hammer.Manager(this.canvas, {
            recognizers: [
                [Hammer.Pinch],
                [Hammer.Tap],
                [Hammer.Pan],
            ]
        });

        function dist(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
        }

        var this_ = this;
        var zoom_start = undefined;
        if(events.pinch !== undefined) {
            this.mc.on('pinch', function(e) {
                var d = dist(e.pointers[0].screenX,
                             e.pointers[0].screenY,
                             e.pointers[1].screenX,
                             e.pointers[1].screenY);
                if(zoom_start !== undefined) {
                    if(d > zoom_start)
                        events.pinch(3 * - d / zoom_start);

                    if(d < zoom_start)
                        events.pinch(3 * zoom_start / d);
                }
                zoom_start = d;

            });
        }

        if(events.tap !== undefined) {
            this.mc.on('tap', function(e) {
                var cartesian = e.center;
                cartesian.x -= this_.canvas.width / 2.0;
                cartesian.y -= this_.canvas.height / 2.0;
                cartesian.x /= this_.zoom;
                cartesian.y /= this_.zoom;
                var hr = this_.calculate_hex_radius(this_.canvas.width, this_.canvas.height);
                var coord = node.HexNode.from_cartesian(cartesian, hr);
                if(this_.hexagons[coord] !== undefined) {
                    events.tap(this_.hexagons[coord]);
                }
            });
        }

        if(events.pan !== undefined) {
            this.mc.on('pan', function(e) {
                var c = e.center;
                console.log("pan");
            });
        }
    }

    calculate_hex_radius(width, height, zoom) {
        zoom = zoom === undefined ? 1.0 : zoom;
        var n = (2 * this.radius + 1)
        var w = width / (0.5 + 1.5 * n);
        var h = height / (SQRT_3 * n);
        return Math.min(w, h) * zoom;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        Object.values(this.hexagons).sort((a, b) => { 
            var ay = a.node.y(1);
            var by = b.node.y(1);
            if(ay > by) {
                return 1;
            } else {
                return -1;
            }
        }).forEach(hexagon => this.renderFunction(this.ctx, hexagon));
    }
}

module.exports = HexGrid;

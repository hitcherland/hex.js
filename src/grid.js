var node = require('./node.js');

const SQRT_3 = Math.sqrt(3.0);

class HexGrid {
    constructor(radius, renderFunction) {
        radius = radius === undefined ? 5 : radius;

        this.radius = radius;
        this.renderFunction = renderFunction;
        this.hexagons = {}
        new node.HexNode(0, 0).area(radius).forEach(hex => { return this.hexagons[hex.toString()] = {
            node: hex,
            state: 0,
        }});
    }

    calculate_hex_radius(width, height, zoom) {
        zoom = zoom === undefined ? 1.0 : zoom;
        var n = (2 * this.radius + 1)
        var w = width / (0.5 + 1.5 * n);
        var h = height / (SQRT_3 * n);
        return Math.min(w, h) * zoom;
    }

    render() {
        Object.values(this.hexagons).sort((a, b) => { 
            var ay = a.node.y(1);
            var by = b.node.y(1);
            if(ay > by) {
                return 1;
            } else {
                return -1;
            }
        }).forEach(hexagon => this.renderFunction(hexagon));
    }
}

module.exports = HexGrid;

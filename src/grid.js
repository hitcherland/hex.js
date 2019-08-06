var node = require('./node.js');

const SQRT_3 = Math.sqrt(3.0);

class HexGrid {
    constructor(radius, renderFunction) {
        radius = radius === undefined ? 5 : radius;

        this.radius = radius;
        this.renderFunction = renderFunction;
        this.hexagons = new node.HexNode(0, 0).area(radius).map(hex => { return {
            node: hex,
            state: 0,
        }});
    }

    calculate_hex_radius(width, height) {
        var n = (2 * this.radius + 1)
        var w = width / (0.5 + 1.5 * n);
        var h = height / (SQRT_3 * n);
        return Math.min(w, h);
    }

    render() {
        for(var hexagon of this.hexagons.sort((a, b) => a.node.y(1) > b.node.y(1))) {
            this.renderFunction(hexagon);
        }
    }
}

module.exports = HexGrid;

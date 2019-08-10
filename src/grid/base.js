var node = require('../node.js')
const SQRT_3 = Math.sqrt(3.0);

class BaseHexGrid {
   constructor(options={}) {
        this.hexagons = {}
        for(var key of Object.keys(this.default_options)) {
            if(this[key] === undefined) {
                if(options[key] !== undefined) {
                    this[key] = options[key];
                } else {
                    this[key] = this.default_options[key];
                }
            }
        }

        this.generateHexagons();
    }

    setRadius(r) {
        this.radius = r;
        this.generateHexagons();
    }

    generateHexagons() {
        this.hexagons = {};
        this.center.area(this.radius).forEach(hex => { 
            return this.hexagons[hex.toString()] = {
                node: hex,
                data: {},
            }
        });
    }

    calculateHexRadius(width=100, height=100, radius=this.radius) {
        var n = 2 * radius + 1;
        var w = width / (0.5 + 1.5 * n);
        var h = height / (SQRT_3 * n);
        return Math.min(w, h);
    }

    calculateGridWidth(hexRadius, radius=this.radius) {
        var n = 2 * radius + 1;
        var w = (0.5 + 1.5 * n) * hexRadius;
        var h = SQRT_3 * n * hexRadius;
        return {width: w, height: h}
    }
}

BaseHexGrid.prototype.default_options = {
    center: new node.HexNode(0, 0),
    radius: 5,
}

module.exports = {
    BaseHexGrid: BaseHexGrid
}

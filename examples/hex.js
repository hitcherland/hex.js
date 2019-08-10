/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/grid.js":
/*!*********************!*\
  !*** ./src/grid.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var base = __webpack_require__(/*! ./grid/base.js */ "./src/grid/base.js");
var canvas = __webpack_require__(/*! ./grid/canvas.js */ "./src/grid/canvas.js");

module.exports = {
    base: base,
    canvas: canvas,
    BaseHexGrid: base.BaseHexGrid,
    CanvasHexGrid: canvas.CanvasHexGrid,
}


/***/ }),

/***/ "./src/grid/base.js":
/*!**************************!*\
  !*** ./src/grid/base.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var node = __webpack_require__(/*! ../node.js */ "./src/node.js")
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
}

BaseHexGrid.prototype.default_options = {
    center: new node.HexNode(0, 0),
    radius: 5,
}

module.exports = {
    BaseHexGrid: BaseHexGrid
}


/***/ }),

/***/ "./src/grid/canvas.js":
/*!****************************!*\
  !*** ./src/grid/canvas.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var base = __webpack_require__(/*! ./base.js */ "./src/grid/base.js")

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
    }

    get hexgonRadius() {
        console.log(this.canvas.width, this.canvas.height, this.canvasPadding);
        return calculateHexRadius(
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
        console.log("hR", hR);
        for(var hexagon of Object.values(hexagon, this.hexagons)) {
            var cartesian = hexagon.node.to_cartesian(hR);
            cartesian.x += cx;
            cartesian.y += cy;
            this.renderHexagon(hexagon.node, cartesian, hexagon.data);
        }
    }

}

CanvasHexGrid.prototype.default_options = Object.assign(
    {},
    base.BaseHexGrid.prototype.default_options,
    {
        'canvasPadding': {x: 5, y: 5},
    }
)

module.exports = {
    CanvasHexGrid: CanvasHexGrid,
    pathHexagon: pathHexagon,
    fillHexagon: fillHexagon,
    strokeHexagon: strokeHexagon
}


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var hexnode = __webpack_require__(/*! ./node.js */ "./src/node.js");
var grid = __webpack_require__(/*! ./grid.js */ "./src/grid.js");

window.hex = module.exports = {
    grid: grid,
    BaseHexGrid: grid.BaseHexGrid,
    CanvasHexGrid: grid.CanvasHexGrid,
    HexNode: hexnode.HexNode,
    HexNodeType: hexnode.HexNodeType,
}


/***/ }),

/***/ "./src/node.js":
/*!*********************!*\
  !*** ./src/node.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

const HexNodeType = {
    'FLAT_TOP': 0,
    'POINTED_TOP': 1
};

const SQRT_3 = Math.sqrt(3.0);
const SQRT_3_2 = SQRT_3 / 2.0;
const SQRT_3_3 = SQRT_3 / 3.0;

class HexNode {
    constructor(q, r) {
        this.q = q;
        this.r = r;
        this.type = HexNodeType.FLAT_TOP;
    }

    [Symbol.toPrimitive](hint) {
        return this.toString();
    }

    static from_cube(cube) {
        var q = cube.x;
        var r = cube.z;
        return this.constructor(q, r);
    }

    static from_cartesian(cartesian, size, type, round) {
        var q, r;
        type = type === undefined ? HexNodeType.FLAT_TOP : type;
        round = round === undefined ? true : round;
        if(type == HexNodeType.FLAT_TOP) {
            q = 2 * cartesian.x / (3.0 * size);
            r = (- cartesian.x / 3.0 + SQRT_3_3 * cartesian.y) / (1.0 * size);
        } else {
            q = (SQRT_3_3 * cartesian.x - cartesian.y / 3.0) / (1.0 * size);
            r = 2 * cartesian.y / (3.0 * size);
        }

        return (new this(q, r)).round();
    }

    toString() {
        return 'HexNode(' + this.q + ',' + this.r + ')';
    }

    get s() { return -this.q - this.r; }
    x(size) { 
        if(this.type == HexNodeType.FLAT_TOP) {
            return size * 1.5 * this.q;
        } else {
            x = size * (SQRT_3 * this.q + SQRT_3_2 * this.r);
        }
        return x;
    }

    y(size) { 
        if(this.type == HexNodeType.FLAT_TOP) {
            return size * (SQRT_3_2 * this.q + SQRT_3 * this.r);
        } else {
            return size * 1.5 * this.r;
        }
    }

    round() {
        var Rq = Math.round(this.q);
        var Rr = Math.round(this.r);
        var Rs = Math.round(this.s);

        var dq = Math.abs(dq - this.q)
        var dr = Math.abs(dr - this.r)
        var ds = Math.abs(ds - this.s)

        if(dq > ds && dq > dr) {
            Rq = - Rr - Rs;
        } else if(ds > dr) {
            Rs = - Rq - Rr;
        } else {
            Rr = - Rq - Rs;
        }

        return new this.constructor(Rq, Rr);
    }

    to_cube() {
        return {x: this.q, y: this.s, z: this.r}
    }

    to_cartesian(size) {
        var x, y;
        if(this.type == HexNodeType.FLAT_TOP) {
            x = size * 1.5 * this.q;
            y = size * (SQRT_3_2 * this.q + SQRT_3 * this.r);
        } else {
            x = size * (SQRT_3 * this.q + SQRT_3_2 * this.r);
            y = size * 1.5 * this.r;
        }
        return {x: x, y: y};
    }

    area(range) {
        var output = [];
        for(var q = -range; q <= range; q++) {
            var lower = Math.max(-range, -q - range);
            var upper = Math.min(range, -q + range);
            for(var s = lower; s <= upper; s++) {
                var r = - q -s
                output.push(new this.constructor(this.q + q, this.r + r));
            }
        }

        return output;
    }

    __eq__(obj) {
        return obj.q == this.q && obj.r == this.r;
    }

    neighbours() {
        return this.area(1).filter(x => !this.__eq__(x));
    }

    add(obj) {
        return new this.constructor(this.q + obj.q, this.r + obj.r);
    }

    subtract(obj) {
        return new this.constructor(this.q - obj.q, this.r - obj.r);
    }

    dot(m) {
        return new this.constructor(this.q * m, this.r * m);
    }

    lerp(obj, i) {
        var diff = obj.subtract(this);
        return this.add(diff.dot(i));
    }

}

module.exports = { 
    HexNode: HexNode,
    HexNodeType: HexNodeType
}


/***/ })

/******/ });
//# sourceMappingURL=hex.js.map
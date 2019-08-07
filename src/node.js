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

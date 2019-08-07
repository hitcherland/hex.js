var Hammer = require('hammerjs');
var node = require('./node.js');

const SQRT_3 = Math.sqrt(3.0);

function ease(time) {
    var t = time * time;
    return t / ( 2.0 * (t - time) + 1.0);
    //return time * time * (2.5 - 1.5 * time);
}

function setTimeoutContext(fn, timeout, context) {
    return setTimeout(Hammer.bindFn(fn, context), timeout);
}

class ShortPress extends Hammer.Press {
    reset() {
        clearTimeout(this._timer1);
        clearTimeout(this._timer2);
    }

    process(input) {
    let { options } = this;
    let validPointers = input.pointers.length === options.pointers;
    let validMovement = input.distance < options.threshold;
    let validTime = input.deltaTime > options.time && input.deltaTime < options.timeout;

    this._input = input;

    // we only allow little movement
    // and we've reached an end event, so a tap is possible
    if (!validMovement || !validPointers || (input.eventType & (Hammer.INPUT_END | Hammer.INPUT_CANCEL) && !validTime)) {
      this.reset();
    } else if (input.eventType & Hammer.INPUT_START) {
      this.reset();
      this._timer = setTimeoutContext(() => {
        this.state = Hammer.STATE_RECOGNIZED;
          console.log("recog", this.state, this);
      }, options.time, this);

      this._timer2 = setTimeoutContext(() => {
        console.log("FAILED", this.state, this);
        this.state = Hammer.STATE_FAILED;
      }, options.timeout, this);


    } else if (input.eventType & Hammer.INPUT_END) {
        this.reset();
        this.state = Hammer.STATE_RECOGNIZED;
        this.tryEmit();
      return Hammer.STATE_RECOGNIZED;
    }
    return Hammer.STATE_FAILED;
  }
}

class HexGrid {
    constructor(canvas, radius, renderFunction, events) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        radius = radius === undefined ? 5 : radius;
        this.radiusPadding = 1;

        this.radius = radius;
        this.renderFunction = renderFunction;
        this.hexagons = {}
        this.cameraSpeed = 0.02;

        new node.HexNode(0, 0).area(radius).forEach(hex => { return this.hexagons[hex.toString()] = {
            node: hex,
            state: undefined,
        }});

        this.zoomTo();

        this.mc = new Hammer.Manager(this.canvas, { recognizers: []});

        this.mc.add(new Hammer.Tap({event: 'doubletap', taps: 2, posThreshold: 20}))
        this.mc.add(new Hammer.Tap({event: 'singletap', posThreshold: 20}))
        this.mc.get('doubletap').recognizeWith('singletap');
        this.mc.get('singletap').requireFailure('doubletap');

        this.mc.add(new Hammer.Press({event: 'longpress', time: 1000, threshold: 20}))
        this.mc.add(new ShortPress({event: 'shortpress', time: 300, timeout: 1000, threshold: 20}))

        var this_ = this;
        var zoom_start = undefined;

        function get_coord(e) {
            var cartesian = {x: e.center.x, y: e.center.y};
            cartesian.x -= this_.canvas.width / 2.0;
            cartesian.y -= this_.canvas.height / 2.0;
            var cart = this_.zoomFocus.to_cartesian(this_.hexRadius);
            cartesian.x += cart.x;
            cartesian.y += cart.y;
            return node.HexNode.from_cartesian(cartesian, this_.hexRadius);
        }

        if(events.press !== undefined) {
            this.mc.on('shortpress', function(e) {
                var coord = get_coord(e);
                if(this_.hexagons[coord] !== undefined) {
                    events.press(this_.hexagons[coord]);
                }
            });
        }


        this.mc.on('longpress', function(e) {
            var coord = get_coord(e);
            console.log('longpress', performance.now(), e, e.deltaTime)
            var rad = this_.zoomRadius;

            if(this_.hexagons[coord] === undefined)
                return;

            if(coord.__eq__(this_.zoomFocus)) {
                rad -= 1;
                if(rad < 0 )
                    rad = this_.radius + this_.radiusPadding;
                console.log("zoomRadius", rad);
            }
            this_.zoomTo(coord, rad);
            this_.render();
        });


        if(events.singletap !== undefined) {
            this.mc.on('singletap', function(e) {
                var coord = get_coord(e);
                if(this_.hexagons[coord] !== undefined) {
                    events.singletap(this_.hexagons[coord]);
                }
            });
        }

        if(events.doubletap !== undefined) {
            this.mc.on('doubletap', function(e) {
                var coord = get_coord(e);
                if(this_.hexagons[coord] !== undefined) {
                    events.doubletap(this_.hexagons[coord]);
                }
            });
        }

        window.addEventListener('resize', () => { this_.resize(); });
        this.resize();
    }

    resize() { 
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.render();
    }

    get hexRadius() {
        var n = (2 * (this.zoomRadius) + 1)
        var w = this.canvas.width / (0.5 + 1.5 * n);
        var h = this.canvas.height / (SQRT_3 * n);
        return Math.min(w, h);
    }

    zoomTo(coord, radius) {
        coord = coord === undefined ? new node.HexNode(0, 0) : coord;
        radius = radius === undefined ? this.radius + this.radiusPadding: radius;

        var this_ = this;
        if(this.zoomFocus !== undefined) {
            function lerpTo() {
                var t = ease(lerpTo.index);
                this_.zoomFocus = lerpTo.focusStart.lerp(lerpTo.focusGoal, t);
                this_.zoomRadius = (lerpTo.radiusGoal - lerpTo.radiusStart) * t * 1.0 + 1.0 * lerpTo.radiusStart;
                if(lerpTo.index < 1) {
                    lerpTo.index += lerpTo.step;
                    if(lerpTo.index >= 1)
                        lerpTo.index = 1;
                    this_.render();
                    requestAnimationFrame(lerpTo);
                }
            }
            lerpTo.focusGoal = coord;
            lerpTo.focusStart = this.zoomFocus;
            lerpTo.radiusGoal = radius;
            lerpTo.radiusStart = this.zoomRadius;

            lerpTo.index = 0;
            lerpTo.step = this.cameraSpeed;

            lerpTo()
        } else {
            this.zoomFocus = coord;
            this.zoomRadius = radius;
        }
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
        }).forEach(hexagon => {
            var cartesian = hexagon.node.subtract(this.zoomFocus).to_cartesian(this.hexRadius);
            cartesian.x += this.canvas.width / 2.0;
            cartesian.y += this.canvas.height / 2.0;

            this.renderFunction(this.ctx, cartesian, this.hexRadius, hexagon.state)
        });
    }
}

module.exports = HexGrid;

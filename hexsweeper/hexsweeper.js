var render = function(ctx, hexagon) {
    var cx = ctx.canvas.width / 2.0;
    var cy = ctx.canvas.height / 2.0;
    var pos = hexagon.node.to_cartesian(hexRadius);
    pos.x += cx;
    pos.y += cy;

    ctx.strokeStyle = styles[hexagon.state].stroke;
    ctx.fillStyle = styles[hexagon.state].fill;

    ctx.lineWidth = hexRadius / 25.0;
    ctx.lineJoin = "round"

    hex.fillHexagon(ctx, pos.x, pos.y, hexRadius * 0.9);
    hex.strokeHexagon(ctx, pos.x, pos.y, hexRadius * 0.9);
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    hexRadius = grid.calculate_hex_radius(canvas.width * 0.8, canvas.height * 0.8, grid.zoom);
    grid.render();
}

var prevDiff = undefined;
function pointermove(e) {
    var pos = { 
        x: e.clientX - canvas.width / 2.0,
        y: e.clientY - canvas.height / 2.0
    };

    for(var i=0; i<touches.length; i++) {
        var ev = touches[i];
        if(ev.identifier == e.identifier) {
            touches[i] = ev;
        }
    }

    Object.values(grid.hexagons)
          .filter(x => x.state & 1 == 1)
          .forEach(x => x.state -= 1)

    if(touches.length == 2) {
        var curDiff = Math.abs(touches[0].clientX - touches[1].clientX);
        if(prevDiff > 0) {
            if(curDiff > prevDiff) {
                zoomControl(3)
                //zoom in
            }
            if(curDiff < prevDiff) {
                zoomControl(-3)
                //zoom out
            }

        }
        prevDiff = curDiff;

    } else {
        var coord = hex.HexNode.from_cartesian(pos, hexRadius);
        var hexagon = grid.hexagons[coord];
        if(hexagon !== undefined) {
            hexagon.state += 1
        }
    }
    grid.render();
}

function pointerdown(e) {
    touches.push(e)
    grid.render();
}

function pointerup(e) {
    for(var i=0; i<touches.length; i++) {
        var ev = touches[i];
        if(ev.identifier == e.identifier) {
            touches.splice(i, 1);
        }
    }

    Object.values(grid.hexagons)
          .filter(x => x.state & 1 == 1)
          .forEach(x => x.state -= 1)

    grid.render();
}

function zoomControl(d) {
    grid.zoom -= d / 30.0;
    if(grid.zoom < 1)
        grid.zoom = 1
    resize();
}

var states = {
    'UNREVEALED': 0,
    'UNREVEALED_HOVER': 1,
    'UNREVEALED_ACTIVE': 2,
}

var styles = {
    0: {'stroke': '#000', 'fill': '#ccc'},
    1: {'stroke': '#222', 'fill': '#f00'},
    2: {'stroke': '#222', 'fill': '#0f0'},
}

var canvas = document.getElementById('game');
var grid = new hex.HexGrid(canvas, 2, render, {
    'tap': (h) => {console.log(h); h.state = 2; grid.render();},
    'pinch': (d) => {
        zoomControl(d);
    },
    'pan': (d) => {
    },
});

var hexRadius = grid.calculate_hex_radius(canvas.width, canvas.height, grid.zoom);

var touches = [];

/*
canvas.addEventListener('touchend', (e) => pointerup(e.changedTouches[0]), false);
canvas.addEventListener('touchcancel', e => pointerup(e.touches[0]), false);
canvas.addEventListener('mouseup', pointerup, false);

canvas.addEventListener('touchstart', e => pointerdown(e.touches[0]), false);
canvas.addEventListener('mousedown', pointerdown, false);

canvas.addEventListener('touchmove', e => pointermove(e.touches[0]), false);
canvas.addEventListener('mousemove', pointermove, false);
canvas.addEventListener('wheel', e => zoomControl(e.deltaY));
*/

window.addEventListener('resize', resize);

resize();

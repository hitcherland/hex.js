var render = function(hexagon) {
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
    hexRadius = grid.calculate_hex_radius(canvas.width * 0.8, canvas.height * 0.8, zoom);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.render();
}

var prevDiff = undefined;
var zoom = 1.0;
function pointermove(e) {
    var pos = { 
        x: e.clientX - canvas.width / 2.0,
        y: e.clientY - canvas.height / 2.0
    };

    for(var i=0; i<touches.length; i++) {
        var ev = touches[i];
        if(ev.pointerId == e.pointerId) {
            touches[i] = ev;
        }
    }

    Object.values(grid.hexagons).filter(x => x.state & 1 == 1).forEach(x => x.state -= 1)

    if(touches.length == 2) {
        var curDiff = Math.abs(touches[0].clientX - touches[1].clientX);
        if(prevDiff > 0) {
            if(curDiff > prevDiff) {
                console.log(curDiff);
                //zoom in
            }
            if(curDiff < prevDiff) {
                //zoom out
            }

        }
        prevDiff = curDiff;

    } else {

        var coord = hex.HexNode.from_cartesian(pos, hexRadius);
        var hexagon = grid.hexagons[coord];
        if(hexagon !== undefined) {
            hexagon.state += 1
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.render();
}

function pointerdown(e) {
    touches.push(e)
}

function pointerup(e) {
    for(var i=0; i<touches.length; i++) {
        var ev = touches[i];
        if(ev.pointerId == e.pointerId) {
            touches.splice(i, 1);
        }
    }
}



var states = {
    'UNREVEALED': 0,
    'UNREVEALED_HOVER': 1,
}

var styles = {
    0: {'stroke': '#000', 'fill': '#ccc'},
    1: {'stroke': '#222', 'fill': '#ddd'},
}

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var grid = new hex.HexGrid(2, render);
var hexRadius = grid.calculate_hex_radius(canvas.width, canvas.height, zoom);

var touches = [];

canvas.addEventListener('pointerdown', pointerdown);
canvas.addEventListener('pointermove', pointermove);
canvas.addEventListener('wheel', e => {
    zoom -= e.deltaY / 30.0;
    if(zoom < 0.1)
        zoom = 0.1
    resize();
});
window.addEventListener('resize', resize);

resize();

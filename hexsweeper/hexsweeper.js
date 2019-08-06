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
    hexRadius = grid.calculate_hex_radius(canvas.width * 0.8, canvas.height * 0.8);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.render();
}

function cursormove(e) {
    var pos = { 
        x: e.clientX - canvas.width / 2.0,
        y: e.clientY - canvas.height / 2.0
    };

    Object.values(grid.hexagons).filter(x => x.state & 1 == 1).forEach(x => x.state -= 1)

    var coord = hex.HexNode.from_cartesian(pos, hexRadius);
    var hexagon = grid.hexagons[coord];
    if(hexagon !== undefined) {
        hexagon.state += 1
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        grid.render();
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
var hexRadius = grid.calculate_hex_radius(canvas.width, canvas.height);

canvas.addEventListener('mousemove', cursormove);
canvas.addEventListener('touchmove', cursormove);
window.addEventListener('resize', resize);

resize();

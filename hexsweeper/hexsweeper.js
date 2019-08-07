function shuffle(arra1) {
    let ctr = arra1.length;
    let temp;
    let index;

    while (ctr > 0) {
        index = Math.floor(Math.random() * ctr);
        ctr--;
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    return arra1;
}

function render(ctx, pos, hexRadius, state) {
    var s = state === undefined ? 'unrevealed' : state.name;

    ctx.strokeStyle = styles[s].stroke;
    ctx.fillStyle = styles[s].fill;
    ctx.lineWidth = hexRadius / 15.0;
    ctx.lineJoin = "round"

    var H = hexRadius * 0.9;
    if(s == 'not_bomb' && state.bomb_count == 0) {
        H = hexRadius * 0.5;
    }

    if(game_over) {
        H *= 0.8;
    }

    hex.fillHexagon(ctx, pos.x, pos.y, H);
    hex.strokeHexagon(ctx, pos.x, pos.y, H);

    if(state !== undefined && state.flagged) {
        ctx.strokeStyle = styles['bomb'].stroke;
        ctx.beginPath();
        ctx.lineWidth = H / 10.0
        ctx.arc(pos.x, pos.y - H / 6.0 , H / 3.0, Math.PI, 0);
        ctx.lineTo(pos.x - H / 3.0, pos.y - H / 6.0);
        ctx.lineTo(pos.x - H / 3.0, pos.y + H / 3.0);
        ctx.lineTo(pos.x + H / 3.0, pos.y + H / 3.0);
        ctx.lineTo(pos.x + H / 3.0, pos.y - H / 6.0);
        ctx.lineTo(pos.x - H / 3.0, pos.y + H / 3.0);
        ctx.closePath();
        ctx.stroke();
    }



    if(s == 'unrevealed')
        return;

    var R = H * 0.1;
    var P = H * 0.6;
    ctx.fillStyle = styles['bomb'].fill;
    ctx.strokeStyle = styles['bomb'].stroke;
    ctx.lineWidth = H / 25.0;
    for(var i=0; i<state.bomb_count; i++) {
        ctx.beginPath();
        ctx.moveTo(R * Math.sin(Math.PI - Math.PI * i / 3.0) + pos.x,
                   R * Math.cos(Math.PI - Math.PI * i / 3.0) + pos.y)
        ctx.lineTo(P * Math.sin(Math.PI - Math.PI * i / 3.0 - Math.PI / 7) + pos.x,
                   P * Math.cos(Math.PI - Math.PI * i / 3.0 - Math.PI / 7) + pos.y)
        ctx.lineTo(P * Math.sin(Math.PI - Math.PI * i / 3.0 + Math.PI / 7) + pos.x,
                   P * Math.cos(Math.PI - Math.PI * i / 3.0 + Math.PI / 7) + pos.y)
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

};

function restart() {
    game_over = false;
    Object.values(grid.hexagons).forEach(x => x.state = {name: 'unrevealed', bomb_count: 0, flagged: false});
    var s = shuffle(Object.values(grid.hexagons));
    for(var i=0; i<s.length * 0.2; i++) {
        var h = s[i];
        h.state.bomb_count = -1;
        for(var n of h.node.neighbours()) {
            var N = grid.hexagons[n];
            if(N !== undefined && N.state.bomb_count >= 0)
                N.state.bomb_count += 1
        }
    }
    grid.render();
}

function is_game_over() {
    var hexagons = Object.values(grid.hexagons);
    var failed = hexagons.filter(h => h.state.name == 'bomb').length > 0;
    if(failed)
        return true;

    var win = hexagons.filter(h => h.state.name == 'unrevealed' && h.state.bomb_count >= 0).length == 0;
    if(win)
        return true;

    var other_win = hexagons.filter(h => (h.state.flagged && h.state.bomb_count >= 0)
                                    || (!h.state.flagged && h.state.bomb_count < 0)
                                   ).length == 0;

    if(other_win)
        return true;

    return false;
}

var styles = {
    'unrevealed': {'stroke': '#6251a9', 'fill': '#c8b7dd'},
    'not_bomb': {'stroke': '#322159', 'fill': '#c8b7dd'},
    'bomb': {'stroke': '#000', 'fill': '#f00'},
}

var canvas = document.getElementById('game');
canvas.style = 'background: #fff00f';

var game_over = false;
function reveal(h) {
    if(h.state.bomb_count < 0) {
        h.state.name = 'bomb'; 
    } else {
        h.state.name = 'not_bomb'; 
        if(h.state.bomb_count == 0) {
            for(var neighbour of h.node.neighbours()) {
                var N = grid.hexagons[neighbour];
                if(N !== undefined && N.state.name == 'unrevealed') {
                    reveal(N);
                }
            }
        }
    }
}

var grid = new hex.HexGrid(canvas, 2, render, {
    'press': (h) => {
        if(h.state.name == 'unrevealed') {
            h.state.flagged = ! h.state.flagged;
            grid.render();
        }
    },

    'doubletap': (h) => {
        console.log("double tap");
        if(h.state.name == 'unrevealed') {
            h.state.flagged = ! h.state.flagged;
            grid.render();
        }
    },
    'singletap': (h) => {
        if(game_over) {
            restart();
            return
        }

        if(h.state.name != 'unrevealed' || h.state.flagged)
            return;

        h.state.flagged = false;
        reveal(h);

        if(is_game_over()) {
            game_over = true;
            for(var h of Object.values(grid.hexagons).filter(h => h.state.name == 'unrevealed')) {
                if(h.state.name == 'unrevealed')
                    reveal(h);
            }
        }

        grid.render();
    },
});

restart();

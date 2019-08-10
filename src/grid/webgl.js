var base = require('./base.js')

import {
    OrthographicCamera, Scene, Camera,
    BoxGeometry, MeshNormalMaterial, Mesh,
    Shape, ExtrudeGeometry,
    WebGLRenderer, Vector3
} from "three";

function makeHexagonShape(radius) {
    var shape = new Shape();
    shape.moveTo(radius, 0);
    for(var i=1; i<6; i++) {
        shape.lineTo(radius * Math.cos(i * Math.PI / 3.0),
                     radius * Math.sin(i * Math.PI / 3.0));
    }
    return shape;
}

function makeHexoid(radius, height) {
    var shape = makeHexagonShape(radius * 0.8);
    return new ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: true,
        bevelSize: radius * 0.2,
        bevelThickness: height 
    });
}

class WebGLHexGrid extends base.BaseHexGrid {
   constructor(canvas, options={}) {
        super(options);

        this.canvas = canvas;
        this.last_update_time = 0;
        this.camera = new OrthographicCamera(-1, 1, -1, 1, 0.01, 6);
        this.camera.position.z = 1;

        this.scene = new Scene();
        this.camera.lookAt(this.focusPoint);
        this.renderer = new WebGLRenderer({canvas: this.canvas, antialias: true});

        this.hexagonMaterial = new MeshNormalMaterial();

        var this_ = this;
        if(this.autoResize) {
            this.resizeListener = window.addEventListener('resize', () => {
                this_.resize();
            });
        }

        var hR = this.hexagonRadius;
        this.preInitialise();
        for(var hexagon of Object.values(this.hexagons)) {
            var cartesian = hexagon.node.to_cartesian(hR);
            this.initialiseHexagon(hexagon.node, cartesian, hexagon.data);
        }
        this.postInitialise();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        var rect = this.canvas.getBoundingClientRect();
        var size = this.calculateGridWidth(this.hexagonRadius);
        var ratio = rect.width / rect.height;
        var w = Math.max(size.width, size.height);
        var h = w * ratio; 

        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.camera.aspect = rect.width / rect.height;

        this.camera.left = -w/2.0;
        this.camera.right = w/2.0;
        this.camera.top = -h/2.0;
        this.camera.bottom = h/2.0;

        this.camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height, false);
        this.render();
    }

    initialiseHexagon(node, position, data) {
        data.mesh = new Mesh(this.hexagonGeometry, this.hexagonMaterial);
        data.mesh.position.x = position.x;
        data.mesh.position.y = position.y;
        this.scene.add(data.mesh);
    }

    update() {
        var hR = this.hexagonRadius;
        this.preUpdate();
        for(var hexagon of Object.values(this.hexagons)) {
            var cartesian = hexagon.node.to_cartesian(hR);
            this.updateHexagon(hexagon.node, cartesian, hexagon.data);
        }
        this.postUpdate();
    }

    preUpdate() {}
    postUpdate() {}

    updateHexagon(node, position, data) {
        data.mesh.rotation.x = performance.now() * node.q / 2000.0;
        data.mesh.rotation.y = performance.now() * node.r / 2000.0;
        data.mesh.rotation.z = performance.now() * node.s / 2000.0;
    }



    animate() {
        var this_ = this;
        requestAnimationFrame(() => { this_.animate(); })
        this.update();
        var now = performance.now();
        if(now - this.last_update_time >= 1000.0 / this.fps) {
             this.last_update_time = now;
            this.render();
        }
    }
}

WebGLHexGrid.prototype.default_options = Object.assign(
    {},
    base.BaseHexGrid.prototype.default_options,
    {
        'focusPoint': new Vector3(0, 0, 0),
        'canvasPadding': {x: 0, y: 0},
        'autoResize': true,
        'fps': 60,
        'hexagonRadius': 0.2,
        'preInitialise': () => {},
        'postInitialise': () => {},
    }
)

export default {
    WebGLHexGrid: WebGLHexGrid,
    makeHexagonShape: makeHexagonShape,
    makeHexoid: makeHexoid
}

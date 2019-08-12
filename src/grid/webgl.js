/** A WebGL implementation of grid.base.BaseHexagonalGrid using three.js
 * @module hexgrid.grid.webgl
 */

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

class WebGLHexagonalGrid extends base.BaseHexagonalGrid {
   constructor(options={}) {
        super(options);
        this.last_update_time = 0;

        if(this.autoResize) {
            var this_ = this;
            this.resizeListener = window.addEventListener('resize', () => {
                this_.resize();
            });
            this.resize();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        var rect = this.canvas.getBoundingClientRect();
        var size = this.calculateGridWidth(this.nodeRadius);
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

    preInitialise() {
        super.preInitialise();
        this.camera = new OrthographicCamera(-1, 1, -1, 1, 0.01, 6);
        this.camera.position.z = 1;
        this.camera.lookAt(this.focusPoint);

        this.scene = new Scene();
        this.renderer = new WebGLRenderer({canvas: this.canvas, antialias: true});

        this.hexagonMaterial = new MeshNormalMaterial();
        this.hexagonGeometry = makeHexoid(this.nodeRadius * 0.8,
                                          this.nodeRadius / 5.0);


    }

    initialiseNode(node, data) {
        var position = node.to_cartesian(this.nodeRadius);
        data.mesh = new Mesh(this.hexagonGeometry, this.hexagonMaterial);
        data.mesh.position.x = position.x;
        data.mesh.position.y = position.y;
        this.scene.add(data.mesh);
    }

    updateNode(node, data) {
        data.mesh.rotation.x = performance.now() * node.q / 2000.0;
        data.mesh.rotation.y = performance.now() * node.r / 2000.0;
        data.mesh.rotation.z = performance.now() * node.s / 2000.0;
    }
}

WebGLHexagonalGrid.prototype.default_options = Object.assign(
    {},
    base.BaseHexagonalGrid.prototype.default_options,
    {
        'canvas': undefined,
        'focusPoint': new Vector3(0, 0, 0),
        'canvasPadding': {x: 0, y: 0},
        'autoResize': true,
        'nodeRadius': 0.2,
    }
)

export default {
    WebGLHexagonalGrid: WebGLHexagonalGrid,
    makeHexagonShape: makeHexagonShape,
    makeHexoid: makeHexoid
}

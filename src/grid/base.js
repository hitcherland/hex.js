/**
 * A base class that defines nodes and their positions in a hexagonal grid
 * pattern.
 * @module hexgrid.grid.base
 */

var node = require('../node.js')
const SQRT_3 = Math.sqrt(3.0);

/**
 * This is the base hexagonal grid, which supplies nodes in a hexagonal shape.
 */
class BaseHexagonalGrid {
    /**
     * Construct a basic hexagonal grid
     * @param {Object} options Optional values to define the grid
     * @param {HexNode} [options.center=HexNode(0, 0)]
     *     defines the center of the grid
     * @param {integer} [options.radius=5]
     *     defines how many "rings" surround the center node
     * @param {function} [options.preInitialise]
     *     overrides `BaseHexagonalGrid.preInitialise`
     * @param {function} [options.initialiseNode
     *     overrides `BaseHexagonalGrid.initialiseNode`
     * @param {function} [options.postInitialise]
     *     overrides `BaseHexagonalGrid.postInitialise`
     * @param {function} [options.preUpdate]
     *    overrides `BaseHexagonalGrid.preUpdate`
     * @param {function} [options.updateNode]
     *    overrides `BaseHexagonalGrid.updateNode`
     * @param {function} [options.postUpdate]
     *    overrides `BaseHexagonalGrid.postUpdate`
     * @param {function} [options.preRender]
     *    overrides `BaseHexagonalGrid.preRender`
     * @param {function} [options.renderNode]
     *    overrides `BaseHexagonalGrid.renderNode`
     * @param {function} [options.postRender]
     *    overrides `BaseHexagonalGrid.postRender`
     */

    constructor(options={}) {
        this.nodes = [];
        this.nodeData = {}
        this.last_update_time = 0;

        for(var key of Object.keys(this.default_options)) {
            if(options[key] !== undefined) {
                this[key] = options[key];
            } else if(this.default_options[key] !== undefined) {
                this[key] = this.default_options[key];
            }
        }

        ['preInitialise', 'postInitialise', 'initialiseNode'].forEach(x => {
            if(options[x] !== undefined)
                this[x] = this[x].bind(this, true);
        });

        this.initialise();
    }

    /**
     * Set the grid radius and regenerate nodes
     * @param {integer} radius The desired radius
     */
    setRadius(radius) {
        this.radius = radius;
        this.generateNodes();
    }

    /**
     * Calculates the maximum hexagonal radius for each node such that
     * all `radius` worth of nodes within `width` and `height`
     * @param {integer} [width=100] The width of the space to fill
     * @param {integer} [height=100] The height of the space to fill
     * @param {integer} [radius=BaseHexNode.radius] The grid radius that should be visible
     */
    calculateNodeRadius(width=100, height=100, radius=this.radius) {
        var n = 2 * radius + 1;
        var w = width / (0.5 + 1.5 * n);
        var h = height / (SQRT_3 * n);
        return Math.min(w, h);
    }

    /**
     * Calculates the minimum width and height needed to fit `radius` nodes
     * with a hexagonal radius of `hexagonalRadius`
     * @param {Number} hexagonalRadius The distance from the center of all nodes to the edge
     * @param {integer} [radius=BaseHexagonalGrid.radius] The grid radius that should be visible
     */
    calculateGridWidth(hexagonalRadius, radius=this.radius) {
        var n = 2 * radius + 1;
        var w = (0.5 + 1.5 * n) * hexagonalRadius;
        var h = SQRT_3 * n * hexagonalRadius;
        return {width: w, height: h}
    }

    __loop__(name) {
        var title = name.replace(/^\S/g, t => t.toUpperCase());
        var pre = this["pre" + title] !== undefined;
        var post = this["post" + title] !== undefined;
        var elementWise = this[name + "Node"] !== undefined; 

        var this_ = this;
        if(pre)
            this["pre" + title]();

        if(elementWise !== undefined) 
            this.nodes.forEach(n => this_[name + "Node"](n, this_.nodeData[n]));

        if(post !== undefined)
            this["post" + title]();
    }

    /**
     * Used to create and define nodes, called automatically one time when
     * class is instantiated. Calls `BaseHexagonalGrid.preInitialise()`,
     * then `BaseHexagonalGrid.initialiseNode(node, data) for each node`
     * and finally `BaseHexagonalGrid.postInitialise()`.
     */
    initialise() {
        this.__loop__('initialise');
    }

    /**
     * Used to update nodes, called automatically at the start of each 
     * `BaseHexagonalGrid.animate` call. Calls 
     * `BaseHexagonalGrid.preUpdate()`, then 
     * `BaseHexagonalGrid.updateNode(node, data) for each node`
     * and finally `BaseHexagonalGrid.postUpdate()`.
     */
    update() {
        this.__loop__('update');
    }

    /**
     * Used to update nodes, called automatically at the start of each 
     * `BaseHexagonalGrid.animate` call. Calls 
     * `BaseHexagonalGrid.preRender()`, then 
     * `BaseHexagonalGrid.renderNode(node, data) for each node`
     * and finally `BaseHexagonalGrid.postRender()`.
     */
    render() {
        this.__loop__('render');
    }

    /**
     * Used to update and render the grid once per frame, locked to run
     * at most `BaseHexagonalGrid.fps` frames per second.
     */
    animate() {
        var this_ = this;
        requestAnimationFrame(() => { this_.animate(); })

        var now = performance.now();
        if((now - this.last_update_time) >= 1000.0 / this.fps) {
            this.last_update_time = now;
            this.update();
            this.render();
        }
    }

    /**
     * An overridable function that is called at the beginning of
     * `BaseHexagonalGrid.initialise()`. Default behaviour is to 
     * populate `BaseHexagonalGrid.nodes` with with every node within 
     * `BaseHexagonalGrid.radius` of  `BaseHexagonalGrid.center`, and 
     * to define `BaseHexagonalGrid.nodeData[node] = {}` for each
     * node.
     */
    preInitialise() {
        this.nodes = this.center.area(this.radius);
        this.nodeData = this.nodes.reduce((o, x) => {
                            o[x] = {};
                            return o;
                        }, {});
    }

    /**
     * An overridable function that is called once for each node in
     * `BaseHexagonalGrid.nodes` during `BaseHexagonalGrid.initialise()`. 
     * Default behaviour is to do nothing. 
     */
    initialiseNode(node, data) {}

    /**
     * An overridable function that is called at the end of
     * `BaseHexagonalGrid.initialise()`. Default behaviour is to do nothing. 
     */
    postInitialise(node, data) {}

    /**
     * An overridable function that is called at the start of
     * `BaseHexagonalGrid.update()`. Default behaviour is to do nothing. 
     */
    preUpdate(node, data) {}

    /**
     * An overridable function that is called once for each node in
     * `BaseHexagonalGrid.nodes` during `BaseHexagonalGrid.update()`. 
     * Default behaviour is to do nothing. 
     */
    updateNode(node, data) {}

    /**
     * An overridable function that is called at the end of
     * `BaseHexagonalGrid.update()`. Default behaviour is to do nothing. 
     */
    postUpdate(node, data) {}

    /**
     * An overridable function that is called at the start of
     * `BaseHexagonalGrid.render()`. Default behaviour is to do nothing. 
     */
    preRender(node, data) {}

    /**
     * An overridable function that is called once for each node in
     * `BaseHexagonalGrid.nodes` during `BaseHexagonalGrid.render()`. 
     * Default behaviour is to do nothing. 
     */
    renderNode(node, data) {}

    /**
     * An overridable function that is called at the end of
     * `BaseHexagonalGrid.render()`. Default behaviour is to do nothing. 
     */
    postRender(node, data) {}
}

/**
 * Defines what the default values are for the options of this class when
 * instantiated, see `BaseHexagonalGrid.Constructor` for more details.
 */
BaseHexagonalGrid.prototype.default_options = {
    center: new node.HexNode(0, 0),
    radius: 5,
    fps: 60,
    preInitialise: undefined,
    initialiseNode: undefined,
    postInitialise: undefined,

    preUpdate: undefined,
    updateNode: undefined,
    postUpdate: undefined,

    preRender: undefined,
    renderNode: undefined,
    postRender: undefined,
}

module.exports = {
    BaseHexagonalGrid: BaseHexagonalGrid
}
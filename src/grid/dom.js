/** 
 * A html5 dom implementation of grid.base.BaseHexagonalGrid,
 * @module hexgrid.grid.dom
 */

var base = require('./base.js')

/**
 * A hexagonal grid with each node controlling the position of a dom element.
 * Extends `BaseHexagonalGrid`.
 */
class DOMHexagonalGrid extends base.BaseHexagonalGrid {
    /**
     * Construct a DOM-based hexagonal grid. See 
     * `BaseHexagonalGrid.constructor` for more valid options.
     * @param {Object} options Optional values
     * @param {DOMElement} [options.domParent=document.body] The dom element
     * that the children should be added to.
     * @param {boolean} [options.autoResize=true] Where to automatically resize
     * when the window size is adjusted.
     * @param {string} [options.elementType=div] The default tag type to create 
     * elements as
     */
   constructor(options={}) {
        super(options);

        var this_ = this;
        if(this.autoResize) {
            this.resizeListener = window.addEventListener('resize', () => {
                this_.resize();
            });
        }
    }

    /**
     * Dynamic getter that defines the radius of each node, based on the size
     * of `DOMHexagonalGrid.domParent`
     */
    get nodeRadius() {
        var rect = this.domParent.getBoundingClientRect();
        return this.calculateNodeRadius(
            rect.width,
            rect.height
        );
    }

    /**
     * Overridable function that is called at the start of 
     * `DOMHexagonalGrid.initialise()`. By default it gives the parent element
     * a unique attribute `data-hexgrid=performance.now()`, and records the
     * size of the element before new elements are added.
     */
    preInitialise() {
        super.preInitialise();
        this.domParent.dataset.hexgrid = performance.now()
        this._pre_rect = this.domParent.getBoundingClientRect();
    }

    /**
     * Overridable function that is called during
     * `DOMHexagonalGrid.initialise()`, once for each node in
     * `DOMHexagonalGrid.nodes`. By default it creates a new element of type 
     * `DOMHexagonalGrid.elementType`, and gives it the data attributes 
     * `data-hex_q=node.q` and `data-hex_r=node.r`, and appends it to
     * `DOMHexagonalGrid.domParent`.
     * @param {HexNode} node A hexagonal node
     * @param {Object} data The data stored relating to `node`.
     */
    initialiseNode(node, data) {
        data.element = document.createElement(this.elementType);
        data.element.className = 'node'
        data.element.dataset.hex_q = node.q;
        data.element.dataset.hex_r = node.r;
        this.domParent.appendChild(data.element);
    }

    /**
     * Overridable function that is called at the end of 
     * `DOMHexagonalGrid.initialise()`. By default it creates a style element
     * in `document.head`, that defines some positions and widths for each
     * node, using the class `node` and the data attributes `[data-hex_q]`,
     * `[data-hex_r]` and `[data-hexgrid]`.
     */
    postInitialise() {
        var rect = this._pre_rect;
        var hR = this.calculateNodeRadius(rect.width, rect.height);
        this.style = document.createElement('style');
        this.style.innerHTML = `[data-hexgrid="${this.domParent.dataset.hexgrid}"] .node { 
    position: absolute;
    transform: translate(-50%, -50%);
    width: ${2 * hR}px;
    height: ${Math.sqrt(3) * hR}px;
    text-align: center;
    line-height: ${Math.sqrt(3) * hR}px;
}

[data-hexgrid="${this.domParent.dataset.hexgrid}"] { 
    position: relative;
}`

        for(var node of this.nodes) {
            var cartesian = node.to_cartesian(hR);
            cartesian.x += rect.width / 2.0;
            cartesian.y += rect.height / 2.0;

            this.style.innerHTML += `

[data-hexgrid="${this.domParent.dataset.hexgrid}"] [data-hex_q="${node.q}"][data-hex_r="${node.r}"].node {
    left: ${cartesian.x}px;
    top: ${cartesian.y}px;
}`
        }
        document.head.appendChild(this.style);

    }

    /**
     * By default, removes the existing style element for this grid, and 
     * recalls `DOMHexagonalGrid.postInitialise()` to regenerate styles that
     * match the current document size.
     */
    resize() {
        this._pre_rect = this.domParent.getBoundingClientRect();
        document.head.removeChild(grid.style);
        this.postInitialise();
    }
}

/**
 * Defines what the default values are for the options of this class when
 * instantiated, see `DOMHexagonalGrid.Constructor` for more details.
 */
DOMHexagonalGrid.prototype.default_options = Object.assign(
    {},
    base.BaseHexagonalGrid.prototype.default_options,
    {
        'domParent': document.body,
        'autoResize': true,
        'elementType': 'div',
    }
)

module.exports = {
    DOMHexagonalGrid: DOMHexagonalGrid,
}

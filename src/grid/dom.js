/** 
 * A html5 dom implementation of grid.base.BaseHexagonalGrid,
 * @module grid.dom
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
     * @param {DOMElement} [options.domParent=document.body] The dom element that the children should
     * be added to.
     * @param {boolean} [options.autoResize=true] Where to automatically resize when
     * the window size is adjusted.
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
     * Dynamic getter that defines the radius of each node
     * `BaseHexagonalGrid.constructor` for more valid options.
     * @param {Object} options Optional values
     * @param {DOMElement} [options.domParent=document.body] The dom element that the children should
     * be added to.
     * @param {boolean} [options.autoResize=true] Where to automatically resize when
     * the window size is adjusted.
     */
    get nodeRadius() {
        var rect = this.domParent.getBoundingClientRect();
        return this.calculateNodeRadius(
            rect.width,
            rect.height
        );
    }

    preInitialise() {
        super.preInitialise();
        this.domParent.dataset.hexgrid = performance.now()
        this._pre_rect = this.domParent.getBoundingClientRect();
    }

    initialiseNode(node, data) {
        data.element = document.createElement(this.elementType);
        data.element.className = 'node'
        data.element.dataset.hex_q = node.q;
        data.element.dataset.hex_r = node.r;
        this.domParent.appendChild(data.element);
    }

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

    resize() {
        this._pre_rect = this.domParent.getBoundingClientRect();
        document.head.removeChild(grid.style);
        this.postInitialise();
        //this.render();
    }
}

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

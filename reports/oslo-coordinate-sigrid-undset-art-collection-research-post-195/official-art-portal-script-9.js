const EVENTS_KEY = '__vrsg__events';
const DATA = {};
const DATA_KEY = '__vrsg__data';
const UNDEFINED_RETURN_VALUE = undefined;
const CSS_PROPS_NO_DEFAULT = [
    'animationIterationCount',
    'columnCount',
    'fillOpacity',
    'flexGrow',
    'flexShrink',
    'fontWeight',
    'gridArea',
    'gridColumn',
    'gridColumnEnd',
    'gridColumnStart',
    'gridRow',
    'gridRowEnd',
    'gridRowStart',
    'lineHeight',
    'opacity',
    'order',
    'orphans',
    'widows',
    'zIndex',
    'zoom'
];

let DATA_KEY_INDEX = 1;

const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : (typeof b === 'string' ? b.split(/[ ,]+/) : b)), []);

class Dom {
    constructor(value) {
        if (value instanceof Dom) {
            return new Dom(value.get());
        } else if (Dom.isHtmlIterable(value)) {
            this.nodes = Array.from(value);
        } else if (Dom.isHtmlElement(value)) {
            this.nodes = [value];
        } else if (Dom.isString(value)) {
            this.nodes = Dom.getNodesFromString(value);
        } else {
            this.nodes = [];
        }
    }

    each(callback) {
        this.nodes.forEach(callback);
    }

    map(callback) {
        return this.nodes.map(callback);
    }

    // Selection & Traversion
    find(input) {
        let matches = [];
        if (Dom.isString(input)) {
            matches = this.map(node => Array.from(node.querySelectorAll(input)));
        }
        return new Dom([].concat(...matches));
    }

    filter(input) {
        let matches = [];
        if (Dom.isHtmlElement(input)) {
            matches = this.nodes.filter(node => node === input);
        } else if (Dom.isString(input)) {
            matches = this.nodes.filter(node => node.matches(input));
        } else if (Dom.isFunction(input)) {
            matches = this.nodes.filter(input);
        }
        return new Dom(matches);
    }

    has(input) {
        let matches = [];
        if (Dom.isHtmlElement(input)) {
            matches = this.nodes.filter(node => node.contains(input));
        } else if (Dom.isString(input)) {
            matches = this.nodes.filter(node => node.querySelectorAll(input).length > 0);
        }
        return new Dom(matches);
    }

    contains(input) {
        return this.has(input).length > 0;
    }

    is(input) {
        if (Dom.isHtmlElement(input)) {
            return this.nodes.some(node => node === input);
        } else if (Dom.isString(input)) {
            return this.nodes.some(node => node.matches(input));
        } else if (Dom.isFunction(input)) {
            return this.nodes.some(input);
        }
        return false;
    }

    not(input) {
        let matches = Array.from(this.nodes);
        if (Dom.isHtmlElement(input)) {
            matches = this.nodes.filter(node => node !== input);
        } else if (Dom.isString(input)) {
            matches = this.nodes.filter(node => !node.matches(input));
        } else if (Dom.isFunction(input)) {
            const itemsToRemove = this.nodes.filter(input);
            matches = this.nodes.filter(node => itemsToRemove.indexOf(node) === -1);
        }
        return new Dom(matches);
    }

    eq(index) {
        return new Dom(this.get(index));
    }

    index(input) {
        const node = this.filter(input).get(0);
        return this.nodes.indexOf(node);
    }

    first() {
        return this.length ? new Dom(this.get(0)) : new Dom();
    }

    last() {
        return this.length ? new Dom(this.get(this.length - 1)) : new Dom();
    }

    next() {
        return this.length ? new Dom(this.get(0).nextElementSibling) : new Dom();
    }

    prev() {
        return this.length ? new Dom(this.get(0).previousElementSibling) : new Dom();
    }

    previous() {
        return this.prev();
    }

    parent(input) {
        if (Dom.isUndefined(input)) {
            return new Dom(this.nodes.map(node => node.parentNode));
        } else if (Dom.isString(input)) {
            return new Dom(this.nodes.map(node => node.closest(input)).filter(node => node !== null));
        }
        return new Dom();
    }

    get(index) {
        if (Dom.isUndefined(index)) {
            return Array.from(this.nodes);
        } else if (this.indexWithinRange(index)) {
            return this.nodes[index];
        }
        return UNDEFINED_RETURN_VALUE;
    }

    slice(start, end) {
        return new Dom(this.nodes.slice(start, end));
    }

    reverse() {
        return new Dom(Array.from(this.nodes).reverse());
    }

    clone() {
        return new Dom(this.nodes.map(node => node.cloneNode(true)));
    }

    // Manipulation
    // Replicates http://api.jquery.com/append/ including cloning behaviour
    append(input) {
        const nodesToAdd = new Dom(input).get();
        this.each((node, i) => {
            nodesToAdd.forEach(nodeToAdd => {
                const shouldClone = Dom.isInDom(nodeToAdd) && i !== this.length - 1;
                node.appendChild(shouldClone ? nodeToAdd.cloneNode(true) : nodeToAdd);
            });
        });
        return this;
    }

    // Replicates http://api.jquery.com/prepend/ including cloning behaviour
    prepend(input) {
        const nodesToAdd = new Dom(input).reverse().get();
        this.each((node, i) => {
            nodesToAdd.forEach(nodeToAdd => {
                const shouldClone = Dom.isInDom(nodeToAdd) && i !== this.length - 1;
                node.insertBefore(shouldClone ? nodeToAdd.cloneNode(true) : nodeToAdd, node.firstChild);
            });
        });
        return this;
    }

    wrap(input) {
        const wrapper = new Dom(input).get(0);
        if (wrapper) {
            this.each(node => {
                const copy = wrapper.cloneNode(true);
                node.parentNode.insertBefore(copy, node);
                copy.appendChild(node);
            });
        }
        return this;
    }

    replaceWith(input) {
        const content = new Dom(input).get(0);
        if (content) {
            this.each(node => {
                node.parentNode.replaceChild(content.cloneNode(true), node);
            });
        }
        return this;
    }

    // Modifiers
    empty() {
        return this.html('');
    }

    remove() {
        this.off();
        this.each(node => {
            node.parentNode.removeChild(node);
        });
        return this;
    }

    // Event listeners
    on(events, selector, handler) {
        if (!Dom.isString(events) || (!Dom.isString(selector) && !Dom.isFunction(selector))) {
            throw (new Error('on() needs at least an event and a handler'));
        }
        this.each(node => {
            events.split(' ').forEach(event => Dom.listen(node, event, selector, handler));
        });
        return this;
    }

    static listen(node, event, selector, handler) {
        const listener = Dom.isString(selector) ? handler : selector;

        const callback = e => {
            if (Dom.isString(selector)) {
                const target = e.target || e.srcElement;
                const match = target.closest(selector);
                if (match) {
                    e.delegateTarget = node;
                    e.triggerTarget = match;
                    listener.call(match, e);
                }
            } else {
                e.delegateTarget = node;
                e.triggerTarget = node;
                listener.call(node, e);
            }
        };

        callback.original = listener;

        Dom.pushEventCache(node, event, selector, callback);
        node.addEventListener(event, callback);
    }

    static pushEventCache(node, event, selector, handler) {
        const cache = node[EVENTS_KEY] || [];

        if (!cache.some(item => (event === item.event && selector === item.selector && handler === item.handler))) {
            cache.push({
                event,
                selector,
                handler
            });
            node[EVENTS_KEY] = cache;
        }
    }

    off(events, handler) {
        if (Dom.isDefined(events) && !Dom.isString(events)) {
            throw (new Error('off() needs events as a string or nothing at all'));
        }
        if (Dom.isDefined(handler) && !Dom.isFunction(handler)) {
            throw (new Error('off() needs handler as a function or nothing at all'));
        }

        const eventsToRemove = Dom.isDefined(events) ? events.split(' ') : [undefined];

        this.each(node => {
            eventsToRemove.forEach(event => {
                Dom.pullEventCache(node, event, handler).forEach(item => {
                    node.removeEventListener(item.event, item.handler);
                });
            });
        });
        return this;
    }

    static pullEventCache(node, event, handler) {
        const cache = node[EVENTS_KEY] || [];
        const eventsToRemove = cache.filter(item => {
            if (Dom.isDefined(event) && Dom.isDefined(handler)) {
                return event === item.event && (handler === item.handler || handler === item.handler.original);
            } else if (Dom.isDefined(event)) {
                return item.event === event;
            }
            return true;
        });
        node[EVENTS_KEY] = cache.filter(item => eventsToRemove.indexOf(item) === -1);
        return eventsToRemove;
    }

    focus() {
        if (this.length) {
            this.get(0).focus();
        }
        return this;
    }

    blur() {
        if (this.length) {
            this.get(0).blur();
        }
        return this;
    }

    // Css
    addClass(...args) {
        const classes = flatten(args);
        this.each(node => {
            classes.forEach(className => {
                node.classList.add(className);
            });
        });
        return this;
    }

    hasClass(value) {
        return this.nodes.some(node => node.classList.contains(value));
    }

    toggleClass(...args) {
        this.each(node => {
            node.classList.toggle.apply(node.classList, args);
        });
        return this;
    }

    removeClass(...args) {
        const classes = flatten(args);
        this.each(node => {
            classes.forEach(className => {
                node.classList.remove(className);
            });
        });
        return this;
    }

    // Getters
    get length() {
        return this.nodes.length;
    }

    // Getters and Setters
    html(value) {
        if (Dom.isDefined(value)) {
            this.each(node => {
                node.innerHTML = value;
            });
            return this;
        }
        return this.length ? this.get(0).innerHTML : UNDEFINED_RETURN_VALUE;
    }

    text(value) {
        if (Dom.isDefined(value)) {
            this.each(node => {
                node.textContent = value;
            });
            return this;
        }
        return this.length ? this.get(0).textContent : UNDEFINED_RETURN_VALUE;
    }

    val(value) {
        if (Dom.isDefined(value)) {
            this.each(node => {
                node.value = value;
            });
            return this;
        }
        return this.length ? this.get(0).value : UNDEFINED_RETURN_VALUE;
    }

    width(value) {
        if (Dom.isDefined(value)) {
            return this.css('width', Dom.isString(value) ? value : `${value}px`);
        }
        return this.length ? this.get(0).offsetWidth : UNDEFINED_RETURN_VALUE;
    }

    height(value) {
        if (Dom.isDefined(value)) {
            return this.css('height', Dom.isString(value) ? value : `${value}px`);
        }
        return this.length ? this.get(0).offsetHeight : UNDEFINED_RETURN_VALUE;
    }

    attr(key, value) {
        const props = Dom.keyValueToProps(key, value);
        if (Dom.isObject(props)) {
            this.each(node => {
                Dom.eachObjectKey(props, (prop, val) => {
                    if (val === null) {
                        node.removeAttribute(prop);
                    } else {
                        node.setAttribute(prop, val);
                    }
                });
            });
            return this;
        } else if (Dom.isUndefined(props)) {
            return this.length ? Dom.namedNodeMapToObject(this.get(0).attributes) : UNDEFINED_RETURN_VALUE;
        }
        return this.length ? this.get(0).getAttribute(key) : UNDEFINED_RETURN_VALUE;
    }

    static addDefaultUnit(prop, value) {
        if (Dom.isNumber(value) && CSS_PROPS_NO_DEFAULT.indexOf(prop) === -1 && value !== 0) {
            return `${value}px`;
        }
        return value;
    }

    css(key, value) {
        const props = Dom.keyValueToProps(key, value);
        if (Dom.isObject(props)) {
            this.each(node => {
                Dom.eachObjectKey(props, (prop, val) => {
                    if (val === null) {
                        node.style.removeProperty(prop);
                    } else {
                        node.style[prop] = Dom.addDefaultUnit(prop, val);
                    }
                });
            });
            return this;
        } else if (Dom.isUndefined(props)) {
            return this.length ? getComputedStyle(this.get(0)) : UNDEFINED_RETURN_VALUE;
        }
        return this.length ? getComputedStyle(this.get(0))[key] : UNDEFINED_RETURN_VALUE;
    }

    data(key, value) {
        this.each(node => {
            Dom.parseDataAttributes(node);
        });
        const props = Dom.keyValueToProps(key, value);
        if (Dom.isObject(props)) {
            this.each(node => {
                const data = DATA[node[DATA_KEY]];
                Dom.eachObjectKey(props, (prop, val) => {
                    if (val === null) {
                        delete data[prop];
                    } else {
                        data[prop] = val;
                    }
                });
            });
            return this;
        } else if (Dom.isUndefined(props)) {
            return this.length ? DATA[this.get(0)[DATA_KEY]] : UNDEFINED_RETURN_VALUE;
        }
        return this.length ? DATA[this.get(0)[DATA_KEY]][key] : UNDEFINED_RETURN_VALUE;
    }

    offset() {
        if (!this.length) {
            return UNDEFINED_RETURN_VALUE;
        }
        const rect = this.get(0).getBoundingClientRect();
        return {
            top: rect.top + ((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop),
            left: rect.left + ((window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft)
        };
    }

    position() {
        if (!this.length) {
            return UNDEFINED_RETURN_VALUE;
        }
        const el = this.get(0);
        return {
            top: el.offsetTop,
            left: el.offsetLeft
        };
    }

    // Helper methods
    indexWithinRange(index) {
        return (typeof index === 'number' && index >= 0 && index < this.length);
    }

    // Static helper methods
    static isUndefined(value) {
        return typeof value === 'undefined';
    }

    static isDefined(value) {
        return typeof value !== 'undefined';
    }

    static isNumber(value) {
        return typeof value === 'number';
    }

    static isString(value) {
        return typeof value === 'string';
    }

    static isFunction(value) {
        return typeof value === 'function';
    }

    static isObject(value) {
        return value === Object(value);
    }

    static isHtmlElement(value) {
        return value instanceof HTMLElement || value instanceof SVGElement;
    }

    static isHtmlIterable(value) {
        return value instanceof NodeList || value instanceof HTMLCollection || value instanceof Array;
    }

    static isInDom(node) {
        return (node === document.body) ? false : document.body.contains(node);
    }

    static startsWith(str, search) {
        return str.slice(0, search.length) === search;
    }

    static getNodesFromString(str) {
        const trimmed = str.trim();
        if (trimmed === '') {
            return [];
        }
        let childNodes = [];
        try {
            const doc = new DOMParser().parseFromString(trimmed, 'text/html');
            const hasElementNodes = doc && doc.body ? Array.from(doc.body.childNodes).some(node => node.nodeType === 1) : false;
            childNodes = hasElementNodes ? Array.from(doc.body.childNodes) : [];
        } catch (e) {
            childNodes = [];
        }
        return childNodes.length ? childNodes : Array.from(document.querySelectorAll(trimmed));
    }

    static keyValueToProps(key, value) {
        if (Dom.isObject(key)) {
            return key;
        } else if (Dom.isString(key) && Dom.isDefined(value)) {
            const props = {};
            props[key] = value;
            return props;
        } else if (Dom.isString(key)) {
            return false;
        }
        return undefined;
        // throw (new Error('attr() first argument must be a string or object.'));
    }

    static eachObjectKey(object, callback) {
        Object.keys(object)
            .forEach(key => {
                callback(key, object[key]);
            });
    }

    static parseDataAttributes(node) {
        if (!node[DATA_KEY]) {
            const data = {};
            const key = `${DATA_KEY}__${DATA_KEY_INDEX}`;

            Array.from(node.attributes)
                .forEach(item => {
                    if (Dom.startsWith(item.name, 'data-')) {
                        const prop = item.name.substr(5, item.name.length);
                        data[prop] = Dom.parseJson(item.value);
                    }
                });

            node[DATA_KEY] = key;
            DATA[key] = data;
            DATA_KEY_INDEX += 1;
        }
    }

    static namedNodeMapToObject(namedNodeMap) {
        const object = {};
        Array.from(namedNodeMap)
            .forEach(item => {
                object[item.name] = item.value;
            });
        return object;
    }

    static parseJson(value) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
}

function $(value) {
    return new Dom(value);
}

//export default $;

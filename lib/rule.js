/*jshint node: true */
"use strict";

import { isNonEmptyString, isArrayOfOnly, unique, isStringOfAtLeast, generateAbbr, RequiredParameter, ValueError, re } from './utils.js';


/**@description: this creates a CSS rule using className as CSS selector and props as CSS properties*/
class rule {
    /**
     * @param {String} selector: the css selector to render 
     * @param {Object<string,*>} props: css properties mapping
     * @param {{className:string}}*/
    constructor(selector, props, {className}={}) {
        RequiredParameter('rule', { selector, props });
        if (className) this.className = className;
        this.props = props;
        this.selector = selector;
    }

    class
    

    /**@type {string} */
    get className() { return this._classname; }

    /** @param {string} value * @returns {rule}*/
    set className(value) {
        if (!isNonEmptyString(value)) { ValueError('rule', 'className should be a non-empty string'); }
        if (value.search('<abbr>') == -1) { ValueError('rule', 'className must contain "<abbr>" or it would be too generic '); }
        if (value.replace('<abbr>', 'foo').search(/^[a-z\-\_]+$/) == -1) { ValueError('rule', 'className contains unallowed characters.\n\tallowed characters => alphabets, underscores and dashes.'); } this._class = value; return this;
    }

    /**
     * @param {string} abbr: abbreviated name of the color or mode
     * @param {string} color: the value of the color, this can be hex. rgba, hsla, etc...
     * @param {{prefix:string,pretty:Boolean}} param2
     * @returns {string}: it returns a string formatted as a css block
     * @example '.selector {property-name: property-value}'*/
    render(abbr, color, { prefix = '', pretty = true } = {}) {
        prefix = (!isNonEmptyString(prefix) || prefix.endsWith('-'))?prefix:prefix + '-';
        var class_ = prefix + this.className.replace('<abbr>', abbr);
        var props_ = [];
        for (var key of Object.keys(this.props)) {
            var val = this.props[key];
            if (pretty) {
                props_.push(
                    `\t${key}: ${typeof val == 'string' ? val.replace('<abbr>', abbr).replace('<color>', color) : val}`
                );
            } else {
                props_.push(
                    `${key}:${typeof val == 'string' ? val.replace('<abbr>', abbr).replace('<color>', color) : val}`
                );
            }
        }
        return pretty ? `.${class_} {\n${props_.join(';\n')}\n}` : `.${class_} {${props_.join(';')}}`;
    }

}

const rules = [
    new rule('<abbr>', { color: 'var(--<abbr>, <color>)' }),
    new rule('bg-<abbr>', { 'background-color': 'var(--<abbr>, <color>)' }),
];

class hasRule {
    /**@param {Array<rule>} rules */
    constructor(rules) {
        RequiredParameter(this.constructor.name, { rules });
        this.rules = rules;
    }

    /**@type {Array<rule>}*/
    get rules() { return this._rules; }

    /***@param {Array<rule>} value */
    set rules(value) {
        if (!isArrayOfOnly(rule, value)) {
            throw TypeError(`[${this.constructor.name}] rules must be an Array containing only rule objects`);
        }
        this._rules = value.length ? unique(value) : []; return this;
    }
}

class hasNameAbbrRule extends hasRule {
    /**
     * @param {string} name 
     * @param {Array<rule>} rules 
     * @param {string} abbr*/
    constructor(name, rules, abbr) {
        super(rules);
        RequiredParameter(this.constructor.name, { name });
        this.name = name; this.abbr = abbr;
    }

    /** @type {String}*/
    get name() { return this._name; }

    /** @param {String} value*/
    set name(value) {
        if (!isStringOfAtLeast(2, value)) ValueError(this.constructor.name,
            'name should be a string of at least 2 characters');
        this._name = value; return this;
    }

    /** @type {String}*/
    get abbr() { return this._abbr; }

    /** @param {String} value*/
    set abbr(value) {
        var val = value ? value : generateAbbr(this.name);
        if (!isNonEmptyString(val)) ValueError(this.constructor.name, "abbr should be a non-empty string");
        this._abbr = val; return this;
    }
}

export { rule, hasRule, hasNameAbbrRule, rules };
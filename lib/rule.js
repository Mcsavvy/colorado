/*jshint node: true */
"use strict";

import {
    isNonEmptyString, isArrayOfOnly,
    unique, isStringOfAtLeast, generateAbbr,
    RequiredParameter, ValueError, re
} from './utils.js';

import {selector, at, ct, tokenize, is_token} from './selector.js';


/**@description: this creates a CSS rule using className as CSS className and props as CSS properties*/
class rule {
    /**
     * @param {String} selector: a valid css selector containing <abbr/>
     * @param {Object<string,string>} props: css properties mapping*/
    constructor(selector, props) {
        RequiredParameter('rule', { selector, props });
        this.props = props;
        this.selector = selector;
    }

    /**@type {string} abbr */
    get selector() {
        return this._selector;
    }

    /**@param {string} value*/
    set selector(value){
        this._selectors = selector(value);
        this._selector = value;
    }

    /**@param {string} value */
    selectors(abbr) {
        RequiredParameter('rule.selectors', {abbr});
        return selector(this.selector.replace(RegExp(at, 'g'), abbr), true);}

    /**
     * @param {Object<string,string} vars
     * @returns {rule}}*/
    renderWith(vars) {
        var clone = new rule(this.selector, Object.assign({}, this.props)), props = clone.props;
        for (var k in vars) {
            var key = tokenize(k);
            for (var p in props) {
                var v = props[p];
                if (v.search(key) !== -1) {
                    props[p] = v.replace(new RegExp(key, 'g'), vars[k]);
                }
            }
        } return clone;
    }

    get update(){
        var self = this;
        return {
            selector: value => {
                RequiredParameter('rule.replace.selector', {value});
                self.selector = value;
                return self;
            },
            props: (value, replace=false) => {
                RequiredParameter('rule.replace.props', {value});
                self.props = replace? value : Object.assign(this.props, value);
                return self;
            }
        };
    }

    /**
     * @param {string} abbr: abbreviated name of the color or mode
     * @param {string} color: the value of the color, this can be hex. rgba, hsla, etc...
     * @param {{prefix:string,pretty:Boolean}} param2
     * @returns {string}: it returns a string formatted as a css block
     * @example '.className {property-name: property-value}'*/
    render(abbr, color, { prefix = '', pretty = true } = {}) {
        RequiredParameter('rule.render', {abbr,color});
        prefix = (!isNonEmptyString(prefix) || prefix.endsWith('-')) ? prefix : prefix + '-';
        var selector = this.selector.replace(RegExp(at, 'g'), '.'+prefix+abbr);
        var props = [], unresolved = [];
        for (var key of Object.keys(this.props)) {
            var val = this.props[key].toString(),
            u = val.match(RegExp(re.tmpvr, 'g'));
            if (u) unresolved.push(...u.filter(v => v !== ct));
            if (pretty) {
                props.push(`\t${key}: ${typeof val == 'string' ? val.replace(at, abbr).replace(ct, color) : val}`);
            } else {
                props.push(`${key}:${typeof val == 'string' ? val.replace(at, abbr).replace(ct, color) : val}`);
            }
        } unresolved = unique(unresolved); if (unresolved.length)
            console.warn(`rule(${this.selectors(abbr).string}): Unresolved template variables detected [ ${unresolved.join(', ')} ]`);
        return pretty ? `${selector} {\n${props.join(';\n')}\n}` : `${selector} {${props.join(';')}}`;
    }
}

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
        if (!re.abbr(val)) ValueError(this.constructor.name, "abbr is wrongly formatted");
        this._abbr = val; return this;
    }
}

export { rule, hasRule, hasNameAbbrRule };
/*jshint node: true */
"use strict";

import {
    isNonEmptyString, isArrayOfOnly,
    unique, isStringOfAtLeast, generateAbbr, insert,
    RequiredParameter, ValueError, re, isArrayOfAtLeastOne, mergeObjects
} from './utils.js';

import {
    parse as Parse, tokenize as Tokenize, TOKENS
} from './parsel.js';


var abbr_token = 'abbr', at = tokenize(abbr_token);

/**@param {string} value*/
function tokenize(value) { return is_token(value) ? value : `<${value}/>`; }

/**@param {string} value*/
function un_tokenize(value) { return is_token(value) ? re.tmpvr.exec(value).groups['name'] : value }

/**@param {string} value*/
function is_token(value) { return re.tmpvr.test(value); }


insert(
    TOKENS, {
    before: 'attribute',
    property: 'colorado-class',
    value: /(@\[)?(?<prefix>[-\w]*)<abbr\/>(?<suffix>[-\w]*)]?/gi
}
);

/**
 * @param {string} propName
 * @param {Object<string,string>} values
 * @returns {Object<string,string>}
 */
function unNest(propName, values) {
    RequiredParameter('rule', { propName, values })
    var props = Object.create(null);
    for (var key in values) {
        var v = values[key];
        if (typeof v === 'object') Object.assign(props, unNest(key, v));
        else props[
            (propName.endsWith('-') || key.startsWith('-')) ?
                propName + key
                : propName + '-' + key
        ] = (typeof v === 'function')? v : String(v);
    }return props;
}

/**@description: this creates a CSS rule using className as CSS className and props as CSS properties*/
class rule {
    #selector;
    #props;
    #changes = {
        selector: [],
        props: [],
        variables: []
    };

    /**
     * @param {string} abbr
     * @returns {{string:string,tokens:Array<{type:string,content:string,pos:[number,number]}>,
     * tree:{type:'list'|'complex'|'compound',list:Array,combinator:string,
     * left:{type:'list'|'complex'|'compound',list:Array,combinator:string,
     * left:{},right:{}},right:{type:'list'|'complex'|'compound',list:Array,combinator:string,
     * left:{},right:{}}}}}
    */
    #resolveSelector(abbr) {
        RequiredParameter('rule.getSelector', { abbr });
        var tokens = Array.from(this.selector.tokens);
        abbr = abbr.startsWith('.') ? abbr.slice(1) : abbr
        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (t.type === 'colorado-class') {
                tokens[i].content = '.'+t.content.replace(/[{@;}]/g, '').replace(at, abbr);
            }
        }
        var string = tokens.map(item => item.content).join('')
        return {
            string,
            tokens,
            tree: Parse(tokens)
        };
    }



     /**
     * @param {Object<string,string>} vars
     * @param {Object<string,string>} props
     * @param {Array<{name:string,vars:Array<{name:string,repr:string,loc:[number,number]}>}>} unresolved
     * @returns {Object<string,string>}}*/
      #resolveTemplateVars(vars, props, unresolved) {
        RequiredParameter('rule.resolveTemplateVars', { vars });
        props = Object.assign(Object.create(null), props);
        var templateVars = RegExp(re.tmpvr, 'g');
        for (var property in props) {
            var hasUnresolved = false, unresolvedIdx;
            if (typeof props[property] !== 'string') continue;
            props[property] = props[property].replace(templateVars, function (substring, name, start) {
                var name = un_tokenize(substring), ret = substring;
                if (name in vars) ret = vars[name];
                else if (substring in vars) ret = vars[substring];
                else if (Array.isArray(unresolved)) {
                    var item;
                    // report unresolved variables
                    if (hasUnresolved) item = unresolved[unresolvedIdx];
                    else {
                        unresolvedIdx = unresolved.push({ name: property, vars: [] }) - 1
                        item = unresolved[unresolvedIdx]; hasUnresolved = true;
                    }
                    item.vars.push({ name, repr: substring, loc: [start, start + (substring.length - 1)] });
                }
                return ret;
            });
        } return props;
    }

    /**
     * @param {Object<string,string|Function>} props
     * @param {Array<{name:string,expressions:Array<{expression:string,repr:string,
     * loc:[number,number],error:Error|string}>}>} errors
     * @param {Object<string,*>} variables
     * @returns {Object<string,string>}}*/
    #resolveExpressions(props, errors, variables) {
        RequiredParameter('rule.resolveTemplateVars', { props });
        props = Object.assign(Object.create(null), props ? props : this.props);
        var expression =
            /\$(?:{(.+?)}|\[(.+?)\]|\((.+?)\))/g;
        for (var property in props) {
            var v = props[property];
            if (typeof v === 'function'){
                try {
                    var res = v.bind(mergeObjects(
                        {selector:this.selector},
                        props, variables
                    ))();
                    props[property] = String(res);
                } catch (error) {
                    console.error(
                        `The following error occurred while trying to evaluate the "${property}" property of rule(${this.selector.string})`
                    ); throw error;
                }
                

            }
            else {
                var hasError = false, errorIdx;
                props[property] = v.replace(expression, function (substring, m1, m2, m3, start) {
                    var expr = m1 || m2 || m3;
                    try {
                        var fn = new Function((expr.search(/return\s/) !== -1) ? expr : 'return ' + expr).bind(mergeObjects(
                            {selector:this.selector},
                            props, variables
                        ));
                        return fn().toString();
                    } catch (err) {
                        var item;
                        if (Array.isArray(errors)) {
                            if (hasError) item = errors[errorIdx];
                            else {
                                errorIdx = errors.push({ name: property, expressions: [] }) - 1;
                                item = errors[errorIdx]; hasError = true;
                            }
                            item.expressions.push({
                                expression: expr, repr: substring,
                                loc: [start, start + (substring.length - 1)], error: err
                            });
                        }return substring;
                    }
                }.bind(this));
            }
        } return props;
    }

    /**
     * @param {String} selector: a valid css selector containing <abbr/>
     * @param {Object<string,string>} props: css properties mapping*/
    constructor(selector, props) {
        RequiredParameter('rule', { selector, props });
        this.props = props;
        this.selector = selector;
    }

    /**
     * @type {{string:string,tokens:Array<{type:string,content:string,pos:[number,number]}>,
     * tree:{type:'list'|'complex'|'compound',list:Array,combinator:string,
     * left:{type:'list'|'complex'|'compound',list:Array,combinator:string,
     * left:{},right:{}},right:{type:'list'|'complex'|'compound',list:Array,combinator:string,
     * left:{},right:{}}}}}
     * */
    get selector(){ return this.#selector; }

    /**@param {string} value*/
    set selector(value) {
        RequiredParameter('selector', { selector: value });
        if (!isNonEmptyString(value)) ValueError('rule', 'selector expects a css-selector string');
        this.#selector = {
            string: value,
            tokens: Tokenize(value),
            tree: Parse(value)
        }; this.changes.selector.push(this.#selector); return this;
    }

    /**@type {Object<string,string|Function>} */
    get props() { return this.#props }

    set props(value) {
        RequiredParameter('rule', { props: value })
        var p = Object.create(null);
        for (var k in value) {
            if (k in Object) continue; var v = value[k];
            if (typeof v === 'object') Object.assign(p, unNest(k, v));
            else p[k] = (typeof v === 'function')? v : String(v);
        } this.#props = p; this.changes.props.push(p); return this;
    }

    /**
     * @param {string} abbr 
     * @returns {Array<string>}*/
    classnames(abbr){
        abbr = abbr || at;
        var selector = this.#resolveSelector(abbr);
        return selector.tokens.filter(
            i => (i.type==="class"||i.type==="colorado-class") && i.content.search(abbr) !== -1).map(
            i => i.content)
    }
    
    /**
     * @type {{selector:Array<{string:string,tokens:Array<{type:string,content:string,pos:[number,number]}>,
     * tree:{type:'list'|'complex'|'compound',list:Array,combinator:string,
     * left:{type:'list'|'complex'|'compound',list:Array,combinator:string,
     * left:{},right:{}},right:{type:'list'|'complex'|'compound',list:Array,combinator:string,
     * left:{},right:{}}}}>,props:Array<Object<string,string|Function>>,variables:Array<Object<string,string>}
     * */
    get changes(){return this.#changes;}

    set changes(value){
        RequiredParameter('rule.changes', {value})
        for (var i in ['selector', 'props', 'variables']){
            if (!i in value) ValueError('rule.changes', `${i} is a required property`);
            if (!Array.isArray(value)) ValueError('rule.changes', `${i} must be an array`);
        }this.#changes = value;
    }
        

    /**@type {rule} */
    get extend() {
        return new rule(this.selector.string, this.props);
    }

    /**@param {Array<string>|Function} remover*/
    remove(remover) {
        var props = Object.create(null);
        RequiredParameter('rule.remove', { remover });
        if (Array.isArray(remover)) {
            if (isArrayOfAtLeastOne("string", remover)) return this.remove(
                key => remover.filter(item => key === item).length);
            else ValueError('rule.remove', 'remove should be an array of only strings');
        }
        else if (typeof remover.valueOf() === 'function') {
            for (var key in this.props) {
                if (!remover(key, this.props[key])) props[key] = this.props[key];
            }
            this.props = props; return this;
        } else ValueError('rule.remove', 'remover should be an array of a function');
    }

    /**
     * @param {Object<string,string} vars
     * @returns {rule}}*/
    renderWith(vars) {
        this.props = this.#resolveTemplateVars(vars, this.props);
        this.changes.variables.push(vars);
        return this;
    }

    get update() {
        var self = this;
        return {
            selector: value => {
                RequiredParameter('rule.replace.selector', { value });
                self.selector = value;
                return self;
            },
            props: (value, replace = false) => {
                RequiredParameter('rule.replace.props', { value });
                self.props = (replace === true) ? value : Object.assign(self.props, value);
                return self;
            }
        };
    } 

    /**
     * @param {string} abbr: abbreviated name of the component
     * @param {Object<string,string>} properties: key:value pairs
     * @param {{prefix:string,pretty:Boolean}} param2
     * @returns {string}: it returns a string formatted as a css block
     * @example '.className {property-name: property-value}'*/
    render(abbr, properties, { prefix = '', pretty = true } = {}) {
        if (this.classnames().length > 0){
            RequiredParameter('rule.render', { abbr });
            if (!isStringOfAtLeast(2, abbr)){
                ValueError('rule.render', 'abbr should be a string of at least two chars');
            }
        }
        var nabbr = ((!isNonEmptyString(prefix) || prefix.endsWith('-')) ? prefix : prefix + '-') + abbr;
        var selector = this.#resolveSelector(nabbr), block = [], vars = {var:`var(--${nabbr})`};
        var classnames = selector.tokens.filter(
            i => (i.type==="class"||i.type==="colorado-class") && i.content.search(nabbr) !== -1).map(
            i => i.content);
        classnames.forEach((v,i)=>{vars[`var-${i+1}`] = `var(--${v.slice(1)})`});
        /**@type {Array<{name:string,vars:Array<{name:string,repr:string,loc:[number,number]}>}>}*/
        var unresolved = [], errors = [];
        /**
         * @type {Array<{name:string,expressions:Array<{expression:string,repr:string,
         * loc:[number,number],error:Error|string}>}>}
         * */
        var props = this.#resolveExpressions(
                this.#resolveTemplateVars(
                    Object.assign(
                        {abbr}, vars, properties
                    ), this.props, unresolved
                ), errors, mergeObjects({classnames}, ...this.changes.variables));
        for (var key in props) {
            if (pretty) block.push(`    ${key}: ${props[key]}`);
            else block.push(`${key}:${props[key]}`);
        }
        for (var u of unresolved) {
            var msg = [`The following template variable${(u.vars.length > 1) ? 's' : ''} remained unresolved in property "${u.name}"`];
            for (var i = 0; i < u.vars.length; i++) {
                var v = u.vars[i];
                msg.push(`\t${i + 1}. variable: "${v.name}"; repr: "${v.repr}" ; index-location: ${v.loc.join(' - ')}`);
            } console.warn(msg.join('\n'));
        }
        for (var e of errors) {
            var msg = [`The followings error${(e.expressions.length > 1) ? 's were' : ' was'} encountered in property "${e.name}"`];
            for (var i = 0; i < e.expressions.length; i++) {
                var ex = e.expressions[i];
                msg.push(`\t${i + 1}. expression: "${ex.expression}"; repr: "${ex.repr}" ; error: "${ex.error}" index-location: ${ex.loc.join(' - ')}`);
            } console.warn(msg.join('\n'));
        }
        return pretty ? `${selector.string} {\n${block.join(';\n')}\n}` : `${selector.string} {${block.join(';')}}`;
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
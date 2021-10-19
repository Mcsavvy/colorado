/*jshint node: true */
"use strict";

import { RequiredParameter, uuidv4, defaults, isStringOfAtLeast, ValueError, unique, isArrayOfAtLeastOne, isNonEmptyString } from './utils.js';

import { mode } from './mode.js';
import { hasRule } from './rule.js';


class theme extends hasRule {
    /**
     * @param {Array<mode>} modes: an array of modes
     * @param {string|number|mode} active: the current mode to set
     * @param {{reversedAbbr:string,rules:Array<rule>}} param2
     * @returns {theme}*/
    constructor(modes, active, { reversedAbbr, rules = [] } = {}) {
        RequiredParameter('theme', { modes, active });
        super(rules); this.__uuid = uuidv4('cxy-lxy-oxy-rxy-axy-dxy-oxy');
        this.modes = modes; this.active = active;
        this.rabbr = reversedAbbr || defaults.rabbr;
    }

    /**@type {mode} */
    get active() { return this._active; }

    /**@param {string|mode|number} */
    set active(value) {
        if (value instanceof mode) {
            if (this.modes.indexOf(value) !== -1) this._active = value;
            else ValueError('duo', 'active is not a member');
        } else if (isStringOfAtLeast(2, value)) {
            var t = this.modes.find(item => item.name == value);
            this._active = t ? t : ValueError('duo', 'active is not the name of a member');
        } else if (typeof value.valueOf() === 'number') {
            if (value > this.modes.length || value < 0)
                ValueError('duo', `active expects an index between 0 and ${this.modes.length - 1} inclusive`);
            this._active = (value.valueOf() == 1) ? this.modes[1] : this.modes[0];
        } else ValueError('duo', 'active expects a member, member\'s name, or member\'s index');
        return this;
    }


    /**@property {Array<mode,duo>}*/
    get modes() {
        return unique(this._modes.flatMap(item => item.flippable() ? [item, item.reverse] : [item]));
    }

    /**@param {Array<mode>} value*/
    set modes(value) {
        if (!isArrayOfAtLeastOne(mode, value)) { throw ValueError('theme', "modes should be an Array of only and at least one mode object"); }
        this._modes = unique(value); return this;
    }

    /**@type {string} */
    get rabbr() { return this._rabbr; }

    /**@param {string} value */
    set rabbr(value) {
        if (!isNonEmptyString(value)) { ValueError('theme', 'rabbr should be a non-empty string'); }
        if (value.search(/^[a-z][a-z_]*$/i) === -1) { ValueError('theme', 'rabbr should only contains alphabets and underscores'); }
        this._rabbr = value; return this;
    }

    /**
     * @type {{classes:Array<string>,styles:Array<string>,
     * variables:Object<string,string>, style:string,vars:string}}
     */
    get css() {
        var classes = [], styles = [], variables = {};
        for (var m of this.modes) {
            var css = mode.makeCss({
                colors: m.colors,
                rules: this.rules.concat(m.rules),
                abbr: m.abbr,
                rabbr: this.rabbr,
                active: m.isActive,
                pretty: true
            });
            classes.push(...css.classes);
            styles.push(css.style);
            Object.assign(variables, css.variables);
            if (m.flippable()) {
                var r = m.reverse,
                    rcss = mode.makeCss({
                        colors: r.colors,
                        rules: this.rules.concat(r.rules),
                        abbr: r.abbr,
                        rabbr: this.rabbr,
                        active: r.isActive,
                        pretty: true
                    });
                classes.push(...rcss.classes);
                styles.push(rcss.style);
                Object.assign(variables, rcss.variables);
            }
        }
        classes = unique(classes); styles = unique(styles);
        return { classes, styles, variables, style: styles.join('\n'), vars: Object.keys(variables) };
    }

    insertStyleSheet() {


    }
}

export {theme};

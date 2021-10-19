/*jshint node: true */
"use strict";

import { RequiredParameter, isArrayOfAtLeastOne, defaults, isStringOfAtLeast, unique, isArrayOfAtLeast, ValueError, isNonEmptyString } from './utils.js';


import { color } from './color.js';
import { rule, hasNameAbbrRule } from './rule.js';


/** @description this creates an objects that represents a single mode with one or more colors in it, think of **DarkMode** */
class mode extends hasNameAbbrRule {
	/**
	 * @param {String} name
	 * @param {String} abbr
	 * @param {Array<color>} colors
	 * @param {mode} reverse
	 * @param {Array<rule>} rules
	 * @param {string} reversedAbbr*/
	constructor(name, colors, { reverse, rules = [], abbr } = {}) {
		super(name, rules, abbr);
		RequiredParameter('mode', { colors });
		this.colors = colors;
		if (reverse != null) { this.reverse = reverse; }
	}

	/**
	 * @param {HTMLElement} target
	 * @param {String} abbr
	 * @param {String} value
	 * @returns {mode}*/
	setVar(target, abbr, value) {
		target.style.setProperty(`--${abbr}`, value); return this;
	}

	/**@returns {Boolean} */
	flippable() { return this.reverse ? true : false; }

	/**@type {string} */
	get rabbr() { return this._rabbr || defaults.rabbr; }

	/**
	 * @param {string} value
	 * @returns {mode}*/
	set rabbr(value) {
		if (!isStringOfAtLeast(1, value)) { ValueError('mode', 'rabbr should be a string which is at least 1 character long'); }
		this._rabbr = value; return this;
	}

	/**@return {Boolean} */
	get isLoaded() { return this._isLoaded; }

	set isLoaded(value) {
		value = Boolean(value);
		this.isActive = value;
		this._isLoaded = value; this.reverse._isLoaded = !value;
	}

	/**@type {boolean} */
	get isActive() { return this.flippable() ? this._isActive : true; }

	set isActive(value) {
		value = Boolean(value);
		if (!this.flippable()) return;
		this._isActive = value; this.reverse._isActive = !value;
		return this;
	}

	/**
	 * @type {{classes:Array<string>,styles:Array<string>,
	 * variables:Object<string,string>, style:string,vars:string}}
	 */
	get css() {
		return mode.makeCss({
			colors: this.colors,
			active: this.isActive,
			rules: this.rules,
			abbr: this.abbr,
			rabbr: this.rabbr
		});
	}

	/**
	 * @param {{colors:Array<color>,rules:Array<rule>,abbr:string,
	 * rabbr:string,active:boolean,pretty:boolean,$abbr:string}}
	 * @returns {{classes:Array<string>,styles:Array<string>,
	 * variables:Object<string,string>, style:string,vars:string}}
	 */
	static makeCss({ colors, rules, abbr, rabbr, active, pretty, $abbr } = {}) {
		var classes = [], styles = [], variables = Object.create(null);
		for (var c of colors) {
			var css1 = color.makeCss({
				rules: rules.concat(c.rules),
				value: c.value,
				abbr: c.abbr,
				$abbr: abbr,
				pretty,
			}),
			css2 = active ?
				color.makeCss({
					rules: rules.concat(c.rules),
					value: c.value,
					abbr: c.abbr,
					$abbr: $abbr,
					pretty,
				})
				:
				color.makeCss({
					rules: rules.concat(c.rules),
					value: c.value,
					abbr: c.abbr,
					$abbr: rabbr,
					pretty,
				});
			classes.push(...css1.classes, ...css2.classes);
			styles.push(css1.style, css2.style);
			Object.assign(variables, css1.variables, css2.variables);
		}
		classes = unique(classes); styles = unique(styles);
		return { classes, styles, variables, style: styles.join('\n'), vars: Object.keys(variables) };
	}

	/**
	 * @param {HTMLElement} target
	 * @param {String} reversedAbbr
	 * @returns {Promise<string>|undefined}*/
	load(target) {
		for (var c of this.colors) {
			this.setVar(target, c.abbr, c.value);
			this.setVar(target, `${this.abbr}-${c.abbr}`, c.value);
		}
		this.isLoaded = true;
		if (this.flippable()) {
			return new Promise((resolve, reject) => {
				try {
					this.reverse.unload(target);
					resolve((this.name.search(/(?:mode|theme)$/) == -1) ? `${this.name}-mode` : this.name);
				} catch (err) {
					reject(err);
				}
			});
		} return undefined;
	}

	/**
	 * @param {HTMLElement} target
	 * @param {String} reversedAbbr
	 * @returns {mode}*/
	unload(target) {
		for (var c of this.colors) {
			this.setVar(target, `${this.abbr}-${c.abbr}`, c.value);
			this.setVar(target, `${this.rabbr}-${c.abbr}`, c.value);
		} this.isLoaded = false; return this;
	}

	/**@type {mode} */
	get reverse() { return this._revr; }

	set reverse(value) {
		if (!(value instanceof mode)) { throw TypeError('[mode] reverse should be another mode'); }
		if (value === this) { ValueError('mode', 'cannot use itself as reverse'); }
		this._revr = value;
		if (value._revr !== this) value._revr = this;
		value.rabbr = this.rabbr; this.isActive = true; return true;
	}

	/**@type {Array<color>} */
	get colors() { return this._colors; }

	/*** @param {Array<color>} value */
	set colors(value) {
		if (!isArrayOfAtLeastOne(color, value)) { throw TypeError('[mode] colors should be an Array containing only and at least one color'); }
		this._colors = unique(value); return this;
	}
}


class duo extends hasNameAbbrRule {
	/**
	 * @param {string} name 
	 * @param {[mode,mode]} members 
	 * @param {string|number|mode} active
	 * @param {{abbr:string,rules:Array<rule>,rabbr:string}}*/
	constructor(name, members, active, { abbr, rules = [], rabbr } = {}) {
		super(name, rules, abbr);
		RequiredParameter('mode', { members, active });
		if (rabbr) { this.rabbr = rabbr; }
		this.members = members; this.active = active;
	}

	/**@type {[mode,mode]} */
	get members() {
		if (this._modes.length !== 2) throw "RuntimeError: [duo] members have changed size";
		return this._modes;
	}

	set members(value) {
		if (!isArrayOfAtLeast(2, mode, value)) ValueError('duo', 'modes expects an array of two modes');
		if (unique(value).length > 2) ValueError('duo', 'only two modes would be accepted');
		this._modes = unique(value); return this;
	}

	/**@type {mode} */
	get active() { return this._active; }

	/**@param {string|mode|number} */
	set active(value) {
		if (value instanceof mode) {
			if (this.members.indexOf(value) !== -1) this._active = value;
			else ValueError('duo', 'active is not a member');
		} else if (isStringOfAtLeast(2, value)) {
			var t = this.members.find(item => item.name == value);
			this._active = t ? t : ValueError('duo', 'active is not the name of a member');
		} else if (typeof value.valueOf() === 'number') {
			if (value > 1 || value < 0) ValueError('duo', 'active expects 0 or 1');
			this._active = (value.valueOf() == 1) ? this.members[1] : this.members[0];
		} else ValueError('duo', 'active expects a member, member\'s name, or member\'s index');
		return this;
	}

	get css() {
		return duo.makeCss({
			modes: this.members,
			active: this.active,
			rules: this.rules,
			pretty: true,
			rabbr: `${this.abbr}-${defaults.rabbr}`,
			abbr: this.abbr,
		});
	}

	/**
	 * @param {{modes:[mode,mode],active:mode,rules:Array<rule>,pretty:boolean,
	 * rabbr:string,abbr:string}}
	 * @returns {{classes:Array<string>,styles:Array<string>,
	 * variables:Object<string,string>, style:string,vars:string}}
	 */
	static makeCss({ modes, active, rules, pretty, rabbr, abbr } = {}) {
		var am = modes.find(item => item === active);
		var im = modes.find(item => item !== active);
		if (!am) ValueError('duo', 'active is not in members');
		var classes = [], styles = [], variables = Object.create(null),
		css1 = mode.makeCss({
			colors: am.colors, rules: rules.concat(am.rules),
			abbr: `${abbr}-${am.abbr}`, active: true, pretty, $abbr: abbr}),
		css2 = mode.makeCss({
			colors: im.colors, rules: rules.concat(im.rules),
			abbr: `${abbr}-${im.abbr}`, rabbr, active: false, pretty});
		classes.push(...css1.classes, ...css2.classes);
		styles.push(css1.style, css2.style);
		Object.assign(variables, css1.variables, css2.variables);
		classes = unique(classes); styles = unique(styles);
		return { classes, styles, variables, style: styles.join('\n'), vars: Object.keys(variables) };
	}



}

export {
	mode, duo
};

/*
mode re-renders color because
1. it adds it's abbr first
2. when it's inactive, it adds it's rabbr

color can accept $abbr to add in front of it
color can

*/
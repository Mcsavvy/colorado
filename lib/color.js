/*jshint node: true */
"use strict";

import { hasNameAbbrRule, rule } from './rule.js';
import { RequiredParameter, isNonEmptyString, ValueError, unique } from './utils.js';

/** @description this creates an object that represents a single color*/
class color extends hasNameAbbrRule {
    /**
    * @param {String} name: the name of the color
    * @param {String} value: the color value, this can be hex, rgba, etc...
    * @param {{abbr:string,rules:Array<rule>}}*/
    constructor(name, value, { abbr, rules = [] } = {}) {
      super(name,rules,abbr);
      RequiredParameter('color', {value});this.value = value;
    }
  
  
  
    /**@type {{classes:Array<string>,styles:Array<string>,
     * variables:Object<string,string>, style:string,vars:string}}*/
    get css() {return color.makeCss({
        rules:this.rules,abbr:this.abbr,value:this.value
      });}
  
    /**
     * @param {{rules:Array<rule>,abbr:string,value:string,$abbr:string,pretty:boolean
     * }}
     * @returns {{classes:Array<string>,styles:Array<string>,
     * variables:Object<string,string>, style:string,vars:string}}
     */
    static makeCss({rules,abbr,value,$abbr,pretty=true}={}){
      var classes = [], styles = [], variables = Object.create(null);
      var nabbr = $abbr?$abbr + '-' + abbr:abbr;
      variables[nabbr] = value;
      for (var rule of rules) {
        styles.push(rule.render(abbr, value, {prefix:$abbr||'',pretty}));
        classes.push(...rule.selectors(nabbr).regular_classes);
      } classes = unique(classes); styles = unique(styles);
      return { classes, styles, variables, style: styles.join('\n'), vars: Object.keys(variables) };
    }
  
  
    /*** @type {String}*/
    get value() { return this._val; }
  
    /**
     * @param {String} value
     * @returns {color}*/
    set value(value) {
      if (!isNonEmptyString(value)) { ValueError('color', "value should be a non-empty string"); }
      this._val = value; return this;
    }
  }

export {color};
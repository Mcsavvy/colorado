"use strict";

var colorado = {
  abbr: {
    backgroundColor: 'bg',
    borderColor: 'bd',
    reversed: 'r'
  }
};

class hasRule {
  /**@type {Array<rule>}*/
  get rules() { return this._rules; }

  /***@param {Array<rule>} value */
  set rules(value) {
    if (!isArrayOfOnly(rule, value)) { 
      console.log(value);
      throw TypeError(`[${this.constructor.name}] rules must be an Array containing only rule objects`); }
    this._rules = value.length ? unique(value) : []; return this;
  }
}

class hasNameAbbrRule extends hasRule {
  constructor() { super(); }

  /** @type {String}*/
  get name() { return this._name; }

  /** @param {String} value*/
  set name(value) {
    if(!isStringOfAtLeast(2,value)) ValueError(this.constructor.name,
      'name should be a string of at least 2 characters');
    this._name = value; return this;
  }

  /** @type {String}*/
  get abbr() { return this._abbr; }

  /** @param {String} value*/
  set abbr(value) {
    var val = value ? value : generateAbbr(this.name);
    if(!isNonEmmptyString(val)) ValueError(this.constructor.name, "abbr should be a non-empty string");
    this._abbr = val; return this;
  }
}

/**
   * @param {Array} arr
   * @returns {Array}*/
function unique(arr) {
  var prims = { boolean: {}, number: {}, string: {} }, objs = [];
  return arr.filter((item) => {
    var type = typeof item;
    if (type in prims) {
      return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
    } else {
      return objs.indexOf(item) >= 0 ? false : objs.push(item);
    }
  });
}


/**
 * @param {string} caller 
 * @param {Object<string,*>} pairs
 * @return {RequiredParameter}*/
var RequiredParameter = (caller, pairs = {}) => {
  var arr = [];
  for (var key in pairs) {
    if (pairs[key] == null) { arr.push(key); }
  }
  if (arr.length) {
    throw (1 in arr) ?
      `ParameterError: [${caller}] (${arr.slice(0, -1).join(', ')} and ${arr.slice(-1)}) are required parameters`
      : `ParameterError: [${caller}] "${arr[0]}" is a required parameter`;
  } return RequiredParameter;
};


/**
 * @param {string} caller
 * @param {string} msg*/
var ValueError = (caller, msg) => {
  throw `ValueError: [${caller}] ${msg}`;
};


/**
 * @param {object} type
 * @param {Array} array
 * @return {Boolean}*/
const isArrayOfOnly = (type, array) =>
  Array.isArray(array) &&
  !array.filter(item => !(item instanceof type)).length;


/***
 * @param {number} count
 * @param {object} type
 * @param {Array} array*/
const isArrayOfAtLeast = (count, type, array) =>
  isArrayOfOnly(type, array) && array.length >= count;

/***
 * @param {object} type
 * @param {Array} array*/
const isArrayOfAtLeastOne = (type, array) =>
  isArrayOfAtLeast(1, type, array);

/**@param {Array} */
const mergeArrays = (...arrays) => {
  const array = [];
  arrays.forEach(item => array.push(...item));
  return array;
};

/**@returns {Object<string,*>}*/
const mergeObjects = (...objects) => Object.assign({}, ...objects);

const zip = (...arrays) => {
  var shortest = arrays.sort((a,b) => a.length - b.length)[0];
  return shortest.map((item,index) => arrays.map(value => value[index]));
};

/**@param {string} value */
const isNonEmmptyString = (value) =>
  value != null &&
  (typeof value.valueOf() === 'string') &&
  value.length;

/**@param {number} count @param {string} value */
const isStringOfAtLeast = (count, value) =>
  isNonEmmptyString(value) &&
  value.length >= count;

/*** @param {String} string*/
function uuidv4(string) {
  return string.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * @param {String} name : This is the string you want to abbreviate
 * @description : This function is expected to generate an abbreviated string of the param
 * @example const result=generateAbbr('black');
 * [output]=bk
 * @returns {String}*/
function generateAbbr(name) {
  // for generating abbreviations internally
  // check if name is not truthy or name is not a string or name 
  // does contain at least 2 chars
  if (!isStringOfAtLeast(2, name)) { ValueError('generateAbbr', 'name should be a string of at least 2 characters'); }
  var ar = [],
    vowels = 'aeiou',
    str = name.toLowerCase(),
    char;
  for (char of str) {
    if (vowels.search(char) == -1) ar.push(char);
  }
  if (ar.length > 1) {
    let consonants = ar.join('');
    return consonants.slice(0, 1) + consonants.slice(-1);
  } return str.slice(0, 1) + str.slice(-1);
}

/**@description: this creates a CSS rule using className as CSS selector and props as CSS properties*/
class rule {
  /**
   * @param {String} className: name of css class to create 
   * @param {Object<string,*>} props: css properties mapping*/
  constructor(className, props) {
    RequiredParameter('rule', { className, props });
    this.className = className; this.props = props;
  }

  /**@type {string} */
  get className() { return this._class; }

  /** @param {string} value * @returns {rule}*/
  set className(value) {
    if (!isNonEmmptyString(value)) { ValueError('rule', 'className should be a non-empty string'); }
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


/** @description this creates an object that represents a single color*/
class color extends hasNameAbbrRule {
  /**
  * @param {String} name: the name of the color
  * @param {String} value: the color value, this can be hex, rgba, etc...
  * @param {{abbr:string,rules:Array<rule>}}*/
  constructor(name, value, { abbr, rules = [] } = {}) {
    RequiredParameter('color', { name, value }); super();
    this.name = name; this.abbr = abbr; this.value = value;
    this.rules = rules;
  }



  /**@type {{classes:Array<string>,styles:Array<string>,
   * variables:Object<string,string>, style:string,vars:string}}*/
  get css() {return color.makeCss({
      rules:this.rules,abbr:this.abbr,value:this.value
    });}

  /**
   * @param {{rules:Array<rule>,abbr:string,value:string,prefix:string,pretty:boolean}}
   * @returns {{classes:Array<string>,styles:Array<string>,
   * variables:Object<string,string>, style:string,vars:string}}
   */
  static makeCss({rules,abbr,value,prefix='',pretty=true}){
    var classes = [], styles = [], variables = {};
    variables[abbr] = value;
    for (var rule of rules) {
      var rclass = rule.className.replace('<abbr>', abbr);
      styles.push(rule.render(abbr, value, {prefix,pretty}));
      classes.push(rclass);
    } return { classes, styles, variables, style: styles.join('\n'), vars: Object.keys(variables) };
  }


  /*** @type {String}*/
  get value() { return this._val; }

  /**
   * @param {String} value
   * @returns {color}*/
  set value(value) {
    if (!isNonEmmptyString(value)) { ValueError('color', "value should be a non-empty string"); }
    this._val = value; return this;
  }
}


/** @description this creates an objects that represents a single mode with one or more colors in it, think of **DarkMode** */
class mode extends hasNameAbbrRule {
  /**
   * @param {String} name
   * @param {String} abbr
   * @param {Array<color>} colors
   * @param {mode} reverse
   * @param {Array<rule>} rules
   * @param {string} reversedAbbr*/
  constructor(name, colors, { reverse, rules=[], abbr } = {}) {
    RequiredParameter('mode', { name, colors });
    super();
    this.name = name;
    this.colors = colors;
    this.abbr = abbr;
    this.rules = rules;
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
  get rabbr() { return this._rabbr || colorado.abbr.reversed; }

  /**
   * @param {string} value
   * @returns {mode}*/
  set rabbr(value) {
    if (!isStringOfAtLeast(1, value)) { ValueError('mode', 'rabbr should be a string which is at least 1 character long'); }
    this._rabbr = value; return this;
  }

  /**@return {Boolean} */
  get isLoaded() {return this._isLoaded;}

  set isLoaded(value){
    value = Boolean(value);
    this.isActive = value;
    this._isLoaded = value;this.reverse._isLoaded = !value;
  }

  /**@type {boolean} */
  get isActive() {return this.flippable()?this._isActive:true;}

  set isActive(value){
    value = Boolean(value);
    if (!this.flippable()) return;
    this._isActive = value;this.reverse._isActive = !value;
    return this;
  }

  /**
   * @type {{classes:Array<string>,styles:Array<string>,
   * variables:Object<string,string>, style:string,vars:string}}
   */
  get css() {
    return mode.makeCss({
      colors:this.colors,
      active:this.isActive,
      rules:this.rules,
      abbr:this.abbr,
      rabbr:this.rabbr
    });
  }

  /**
   * @param {{colors:Array<color>,rules:Array<rule>,abbr:string,
   * rabbr:string,active:boolean,pretty:boolean}} props
   * @returns {{classes:Array<string>,styles:Array<string>,
   * variables:Object<string,string>, style:string,vars:string}}
   */
  static makeCss({colors,rules,abbr,rabbr,active,pretty}={}){
      var classes = [], styles = [], variables = {};
      for (var c of colors) {
        variables[`--${abbr}-${c.abbr}`] = c.value;
        for (var r of unique(rules.concat(c.rules))) {
          var rclass = r.className.replace('<abbr>', c.abbr);
          styles.push(r.render(c.abbr, c.value, { prefix: abbr + '-' }));
          classes.push(`${abbr}-${rclass}`);
          if (active) {
            variables[`--${c.abbr}`] = c.value;
            styles.push(r.render(c.abbr, c.value));
            classes.push(rclass);
          } else {
            variables[`--${rabbr}-${c.abbr}`] = c.value;
            styles.push(r.render(c.abbr, c.value, { prefix: rabbr + '-' }));
            classes.push(`${rabbr}-${rclass}`);
          }
        }
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
    if (value === this){ValueError('mode','cannot use itself as reverse');}
    this._revr = value;
    if (value._revr !== this) value._revr = this;
    value.rabbr = this.rabbr;this.isActive = true;return true;
  }

  /**@type {Array<color>} */
  get colors() { return this._colors; }

  /*** @param {Array<color>} value */
  set colors(value) {
    if (!isArrayOfAtLeastOne(color, value)) { throw TypeError('[mode] colors should be an Array containing only and at least one color'); }
    this._colors = unique(value); return this;
  }
}

class theme extends hasRule {
  /**
   * @param {Array<mode>} modes: an array of modes
   * @param {mode|string} currentMode: the current mode to set
   * @param {{reversedAbbr:string,rules:Array<rule>}} param2
   * @returns {theme}*/
  constructor(modes, currentmode, { reversedAbbr, rules = [] } = {}) {
    RequiredParameter('theme', { modes, currentmode });
    super();
    this.__uuid = uuidv4('cxy-lxy-oxy-rxy-axy-dxy-oxy');
    this.modes = modes;
    this.currentmode = currentmode;
    this.revr = reversedAbbr || colorado.abbr.reversed;
    this.rules = rules;
  }

  /**@type {mode} */
  get currentmode(){return this._current;}

  set currentmode(value){
    if (
      !(isStringOfAtLeast(2,value) ||
      value instanceof mode)
    ) ValueError('theme', 'currentMode expects a mode or it\'s name');
    if (value instanceof mode){
      if (this._modes.indexOf(value) == -1) ValueError('theme', 'currentmode is not in modes');
      this._current = value;
    } else {
      var choices = this.modes.filter(item => item.name === value);
      if (!choices.length) ValueError('theme', 'currentmode is not the name of any mode in modes');
      this._current = choices[0]
    }
  }


  /**@property {Array<mode>}*/
  get modes() {
    return unique(this._modes.flatMap(item => item.flippable()?[item,item.reverse]:[item]));
  }

  /**@param {Array<mode>} value*/
  set modes(value) {
    if (!isArrayOfAtLeastOne(mode, value)) { throw ValueError('theme', "modes should be an Array of only and at least one mode object"); }
    this._modes = unique(value); return this;
  }

  /**@type {string} */
  get revr() { return this._revr; }

  /**@param {string} value */
  set revr(value) {
    if (!isNonEmmptyString(value)) { ValueError('theme', 'revr should be a non-empty string'); }
    if (value.search(/^[a-z][a-z_]*$/i) === -1) { ValueError('theme','revr should only contains alphabets and underscores'); }
    this._revr = value; return this;
  }

  /**
   * @type {{classes:Array<string>,styles:Array<string>,
   * variables:Object<string,string>, style:string,vars:string}}
   */
  get css() {
    var classes=[],styles=[],variables={};
    for (var m of this.modes){
      var css = mode.makeCss({
        colors:m.colors,
        rules:this.rules.concat(m.rules),
        abbr:m.abbr,
        rabbr:this.revr,
        active:m.isActive,
        pretty:true
      });
      classes.push(...css.classes);
      styles.push(css.style);
      Object.assign(variables, css.variables);
      if (m.flippable()){
        var r = m.reverse,
            rcss = mode.makeCss({
              colors:r.colors,
              rules:this.rules.concat(r.rules),
              abbr:r.abbr,
              rabbr:this.revr,
              active:r.isActive,
              pretty:true
            });
        classes.push(...rcss.classes);
        styles.push(rcss.style);
        Object.assign(variables, rcss.variables);
      }
    }
    classes = unique(classes); styles = unique(styles);
    return { classes, styles, variables, style: styles.join('\n'), vars: Object.keys(variables) }
  }

  insertStyleSheet() {
    

  }
}



/**
 * create different colors
 * create different modes using the colors
 * create a theme using the modes
 * swap modes using theme.toggle(modeName)
 * flip current mode to it's reverse by doing theme.flip()
 * activate a mode using theme.switchTo(modeName)
 * add a new mode using theme.add(mode)
 * remove a mode by doing theme.remove(modeName)
 * load the theme on an element using theme.load(element)
 * get css classes using theme.classes
 */

// RANDOM
// const red = new color({name:'color1',value:'red',rules:rules});
// const blue = new color({name:'color2',value:'blue',rules:rules});
// const green = new color({name:'color3',value:'green',rules:rules});
// const white = new color({name:'color1',value:'white',rules:rules});
// const black = new color({name:'color2',value:'black',rules:rules});
// const gray = new color({name:'color3',value:'gray',rules:rules});
// const rbg = new mode({name:'primary',abbr:'pm',colors:[red,blue,green]});
// const wbg = new mode({name:'neutral',abbr:'nt',colors:[white,black,gray],reverse:rbg});

// RULE DOC
// const backgroundColor = new rule('<abbr>-bg',{'background-color':'<color>'});
// console.log(backgroundColor.render('dark', '#00000'));
const card = new rule('<abbr>-card', {
  'background-color': '<color>',
  'border-radius': '1rem',
  'font-size': '1.5rem',
  'padding': '5px'
});

// console.log(card.render("dark", "#00000"));

// COLOR DOC
// const lightblue = new color('blue', 'lightblue', { rules: [card] });
// const darkblue = new color('blue', 'lightblue', { rules: [card] });
// console.log(lightblue.css.classes);
// console.log(darkblue.css.style);


// MODE DOC
const lightblue = new color('blue', 'lightblue');
const darkblue = new color('blue', 'darkblue');
const lightmode = new mode('light', [lightblue]);
const darkmode = new mode('dark', [darkblue], {reverse: lightmode });
// console.log(darkmode.css.variables);
// console.log(lightmode.css.variables);
// console.log(darkmode.css.vars);
// console.log(darkmode.css.style);
const main = new theme([lightmode,darkmode],'dark', {rules:[card]});
console.log(main.__uuid);

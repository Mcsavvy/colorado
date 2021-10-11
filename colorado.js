/*
Give your page a different feel using **Colorado**
This is by far the easiest theming tool which gives you full control
over the colors on your page in an exciting way

This tool makes use of jQuery if available, if not, it sticks to vanilla js

important classes and functions::

 function colorado(?node, ?theme)

 class theme([array[mode]] modes, [array[rule]] rules, [string] reversedAbbr)

 class mode([string] name, [string] abbr, [array[color]] colors)

 class color([string] abbr, [Object] attrs)

*/
"use strict";
globalThis.colorado = {
  abbr: {
    backgroundColor: 'bg',
    borderColor: 'bd',
    reversed: 'r'
  }
}

class NameAndAbbrMixin{
    /**
   * @type {String}
   */
  get name() { return this._name }

  /**
   * @param {String} value
   */
  set name(value) {
    if (typeof value !== 'string') { throw TypeError('[color] name should be a string') }
    else if (!value.length) { ValueError('color','name cannot be an empty string') }
    this._name = value;return this
  }

  /**
   * @type {String}
   */
  get abbr() { return this._abbr }

  /**
   * @param {String} value
   */
  set abbr(value) {
    var val = value ? value : generateAbbr(this.name)
    if (typeof val !== 'string') { throw TypeError('[color] abbr should be a string') }
    else if (!val.length) { ValueError('color','abbr cannot be an empty string') }
    this._abbr = val;return this
  }
}


/**
   * @param {Array} arr
   * @returns {Array}*/
function unique(arr){
  var prims = {boolean:{},number:{},string:{}}, objs = []
  return arr.filter((item) => {
    var type = typeof item
    if (type in prims){
      return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true)
    } else {
      return objs.indexOf(item) >= 0 ? false : objs.push(item)
    }
  })
}


/**
 * @param {string} caller 
 * @param {Object<string,*>} pairs
 * @return {RequiredParameter}*/
const RequiredParameter = (caller, pairs={}) => {
  var arr = []
  for (var key in pairs){
    if (pairs[key] == null){arr.push(key)}
  }
  if (arr.length){
    throw (1 in arr)
    ?`ParameterError: [${caller}] (${arr.slice(0,-1).join(', ')} and ${arr.slice(-1)}) are required parameters`
    : `ParameterError: [${caller}] "${arr[0]}" is a required parameter`
  } return RequiredParameter
}


/**
 * @param {string} caller
 * @param {string} msg*/
const ValueError = (caller, msg) => {
  throw `ValueError: [${caller}] ${msg}` }


/**
 * @param {object} type
 * @param {Array} array
 * @return {Boolean}*/
const isArrayOfOnly = (type,array) =>  (
    !Array.isArray(array) || 
    array.filter(item => !(item instanceof type)).length
  )?false:true


/***
 * @param {number} count
 * @param {object} type
 * @param {Array} array*/
const isArrayOfAtLeast = (count,type,array) => (
  isArrayOfOnly(type,array) && array.length >= count
)?true:false


/***
 * @param {object} type
 * @param {Array} array*/
const isArrayOfAtLeastOne = (type,array) => (
  isArrayOfAtLeast(1,type,array)
)?true:false

/**@param {string} value */
const isNonEmmptyString = (value) => (
  !(typeof value.valueOf() === 'string') ||
  !value.length
)?false:true

/**@param {number} count @param {string} value */
const isStringOfAtLeast = (count, value) => (
  isNonEmmptyString(value) &&
  value.length >= count
)

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
  if (!isStringOfAtLeast(2,name))
  {ValueError('generateAbbr', 'name should be a string of at least 2 characters')}
  var ar = [],
    vowels = 'aeiou',
    str = name.toLowerCase(),
    char
  for (char of str) {
    (vowels.search(char) == -1)? ar.push(char):null
  }
  if (ar.length > 1) {
    let consonants = ar.join('')
    return consonants.slice(0, 1) + consonants.slice(-1)
  } return str.slice(0, 1) + str.slice(-1)
}

/**@description: this creates a CSS rule using className as CSS selector and props as CSS properties*/
class rule{
  /**
   * @param {String} className: name of css class to create 
   * @param {Object<string,*>} props: css properties mapping*/
  constructor(className, props){
    RequiredParameter('rule', {className,props})
    this.className = className
    this.props = props
  }

  /**@type {string} */
  get className(){return this._class}

  /**
   * @param {string} value
   * @returns {rule}*/
  set className(value){
    if (!isNonEmmptyString(value)){ValueError('rule', 'className should be a non-empty string')}
    if (value.search('<abbr>') == -1){ValueError('rule','className must contain "<abbr>" or it would be too generic ')}
    if (value.replace('<abbr>', 'foo').search(/^[a-z\-\_]+$/) == -1){ValueError('rule','className contains unallowed characters.\n\tallowed characters => alphabets, underscores and dashes.')}
    this._class = value;return this
  }

  /**
   * @param {string} abbr: abbreviated name of the color or mode
   * @param {string} color: the value of the color, this can be hex. rgba, hsla, etc...
   * @returns {string}: it returns a string formatted as a css block
   * @example '.selector {property-name: property-value}'*/
  render(abbr, color, {prefix='',pretty=true}={}){
    var class_ = prefix + this.className.replace('<abbr>', abbr)
    var props_ = []
    for (var key of Object.keys(this.props)){
      var val = this.props[key]
      if (pretty){
        props_.push(
          `\t${key}: ${typeof val == 'string'?val.replace('<abbr>', abbr).replace('<color>',color):vall}`
        )
      } else {
        props_.push(
          `${key}:${typeof val == 'string'?val.replace('<abbr>', abbr).replace('<color>',color):vall}`
        )
      }
    }
    return pretty?`.${class_} {\n${props_.join(';\n')}\n}`:`.${class_} {${props_.join(';')}}`
  }

}

const rules = [
  new rule('<abbr>', {color:'var(--<abbr>, <color>)'}),
  new rule('bg-<abbr>', {'background-color':'var(--<abbr>, <color>)'}),
]


/** @description this creates an object that represents a single color*/
class color extends NameAndAbbrMixin {
  /**
  * @param {String} name: the name of the color
  * @param {String} abbr: the abbreviated name of the color (if none is specified, it is generated from the color name)
  * @param {String} value: the color value, this can be hex, rgba, etc...
  * @param {Array<rule>} rules: array of functions, each function in the array is passed two parameters - abbr and color*/
  constructor(name,value,{abbr,rules=[]}={}) {
    RequiredParameter('color', {name,value})
    super()
    this.name = name
    this.abbr = abbr
    this.value = value
    this.rules = rules
  }

  /**@type {Object<string,*>} */
  get css(){
    var classes = [], styles = [];
    for (var rule of this.rules){
      styles.push(rule.render(this.abbr, this.value));
      classes.push(rule.className.replace('<abbr>', this.abbr))
    };return {classes,styles,style:styles.join('\n')}
  }
  

  /**
   * @type {String}
   */
  get value() { return this._val }

  /**
   * @param {String} value
   * @returns {color}*/
  set value(value) {
    if (!isNonEmmptyString(value)) {ValueError('color', "value should be a non-empty string")}
    this._val = value;return this
  }

  /***@type {Array<rule>}*/
  get rules() { return this._rules }

  /*** @param {Array<rule>} value: array of rules*/
  set rules(value) {
    if (!isArrayOfOnly(rule,value))
    { throw TypeError('[color] rules should be an Array containig only rules') }
    this._rules = unique(value);return this
  }
}


/** @description this creates an objects that represents a single mode with one or more colors in it, think of **DarkMode** */
class mode extends NameAndAbbrMixin {
  /**
   * @param {String} name
   * @param {String} abbr
   * @param {Array<color>} colors
   * @param {mode} reverse
   * @param {Array<rule>} rules
   * @param {string} reversedAbbr*/
  constructor(name,colors,{reverse,rules,abbr}={}) {
    RequiredParameter('mode', {name,colors})
    super()
    this.name = name
    this.colors = colors
    this.abbr = abbr
    this.rules = rules
    reverse ? this.reverse = reverse : null
  }

  /**
   * @param {HTMLElement} target
   * @param {String} abbr
   * @param {String} value
   * @returns {mode}*/
  setVar(target, abbr, value){
    target.style.setProperty(`--${abbr}`, value);return this }

  /**@returns {Boolean} */
  flippable(){return this.reverse?true:false}

  /**@type {string} */
  get rabbr(){return this._rabbr || colorado.abbr.reversed}

  /**
   * @param {string} value
   * @returns {mode}*/
  set rabbr(value){
    if (!isStringOfAtLeast(1,value))
    {ValueError('mode','rabbr should be a string which is at least 1 character long')}
    this._rabbr = value;return this
  }

  /**@return {true|false|null} */
  active(checkreverse=true){
    if (!this.flippable()){return this._isLoaded?true:null}
    if (this._isLoaded){return true}
    if (this.flippable()&&checkreverse){
      return this.reverse.active(checkreverse=false)?false:null
    } return null
  }

  /**@type {Object<string,any>}*/
  get css(){
    const classes=[],styles=[],variables={}
    for (var c of this.colors){
      variables[`--${this.abbr}-${c.abbr}`] = c.value;
      for (var r of unique(this.rules.concat(c.rules))){
        var rclass = r.className.replace('<abbr>', c.abbr);
        styles.push(r.render(c.abbr, c.value, {prefix:this.abbr+'-'}));
        classes.push(`${this.abbr}-${rclass}`);
        const active = this.active(true);
        if (active === true || active === null){
          variables[`--${c.abbr}`] = c.value;
          styles.push(r.render(c.abbr, c.value));
          classes.push(rclass)
        } else if (active === false){
          variables[`--${this.rabbr}-${c.abbr}`] = c.value;
          styles.push(r.render(c.abbr, c.value, {prefix:this.rabbr+'-'}));
          classes.push(`${this.rabbr}-${rclass}`)
        }
      }
    }
    return {classes,styles,variables,style:styles.join('\n'),vars:Object.keys(variables)}
  }

  /**
   * @param {HTMLElement} target
   * @param {String} reversedAbbr
   * @returns {Promise<string>|undefined}*/
  load(target) {
    for (c of this.colors) {
      this.setVar(target, c.abbr, c.value)
      this.setVar(target, `${this.abbr}-${c.abbr}`, c.value)
    }
    this._isLoaded = true
    if (this.flippable()) {
      return new Promise((resolve, reject) => {
        try {
          this.reverse.unload(target)
          resolve((this.name.search(/(?:mode|theme)$/) == -1) ? `${this.name}-mode` : this.name)
        } catch (err) {
          reject(err)
        }
      })
    } return undefined
  }

  /**
   * @param {HTMLElement} target
   * @param {String} reversedAbbr
   * @returns {mode}*/
  unload(target) {
    for (c of this.colors) {
      this.setVar(target, `${this.abbr}-${c.abbr}`, c.value)
      this.setVar(target, `${this.rabbr}-${c.abbr}`, c.value)
    };this._isLoaded = null; return this
  };

  /*** @type {mode} */
  get reverse() { return this._revr}

  /*** @param {mode} value*/
  set reverse(value) {
    if (!(value instanceof mode)) { throw TypeError('[mode] reverse should be another mode') };
    this._revr = value;
    value._revr === this?null:value._revr=this;
    value.rabbr = this.rabbr;return this
  }

  /**@type {Array<color>} */
  get colors() { return this._colors }

  /*** @param {Array<color>} value */
  set colors(value) {
    if (!isArrayOfAtLeastOne(color,value))
    {throw TypeError('[mode] colors should be an Array containing only and at least one color') }
    this._colors = unique(value);return this
  }

  /*** @type {Array<rule>}*/
  get rules() {return this._rules;}

  /***
   * @param {Array<rule>} value
   * @returns {theme}*/
  set rules(value) {
    if (!isArrayOfOnly(rule,value))
    {throw TypeError("[theme] rules must be an Array containing only rule objects")}
    this._rules = value.length?unique(value):[]; return this
  }
}

class theme {
  /**
   * @param {Array<mode>} modes: an array of modes
   * @param {Array<rule>} rules: an array of rules
   * @param {mode|string} currentMode: the current mode to set 
   * @returns {theme}*/
  constructor(modes,currentMode,{reversedAbbr,rules}={}){
    RequiredParameter('theme',{modes,currentMode})
    this.currentMode = currentMode;
    this.modes = modes;
    this.revr = reversedAbbr || colorado.abbr.reversed;
    this.rules = rules;
  }

  /*** @type {Array<mode>}*/
  get modes() {
    return this._modes;
  }

  /*** @param {Array<mode>} value*/
  set modes(value) {
    if (!isArrayOfAtLeastOne(mode, value))
    {throw ValueError('theme',"modes should be an Array of only and at least one mode object")}
  }

  /*** @type {Array<rule>}*/
  get rules() {return this._rules;}

  /***
   * @param {Array<rule>} value
   * @returns {theme}*/
  set rules(value) {
    if (!isArrayOfOnly(rule, value))
    {throw TypeError("[theme] rules must be an Array of only rule objects");}
    this._rules = value; return this
  }

  insertRules() {

  }
}

module.exports = {
  generateAbbr,
};


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

"RANDOM"
// const red = new color({name:'color1',value:'red',rules:rules})
// const blue = new color({name:'color2',value:'blue',rules:rules})
// const green = new color({name:'color3',value:'green',rules:rules})
// const white = new color({name:'color1',value:'white',rules:rules})
// const black = new color({name:'color2',value:'black',rules:rules})
// const gray = new color({name:'color3',value:'gray',rules:rules})
// const rbg = new mode({name:'primary',abbr:'pm',colors:[red,blue,green]})
// const wbg = new mode({name:'neutral',abbr:'nt',colors:[white,black,gray],reverse:rbg})

"RULE DOC"
// const backgroundColor = new rule('<abbr>-bg',{'background-color':'<color>'})
// console.log(backgroundColor.render('dark', '#00000'))
const card = new rule('<abbr>-card', {
  'background-color': '<color>',
  'border-radius': '1rem',
  'font-size': '1.5rem',
  'padding':'5px'
})

// console.log(card.render("dark", "#00000"))

"COLOR DOC"
const lightblue = new color('blue', 'lightblue',{rules:[card]})
const darkblue = new color('blue', 'lightblue',{rules:[card]})
// console.log(lightblue.css.classes)
// console.log(darkblue.css.style)

"MODE DOC"
// const lightblue = new color('blue', 'lightblue')
// const darkblue = new color('blue', 'lightblue')
const lightmode = new mode('light', [lightblue], { rules:[card] })
const darkmode = new mode('dark', [darkblue], { rules:[card], reverse:lightmode })
console.log(lightmode.css.classes)
console.log(darkmode.css.classes)
console.log(darkmode.css.vars)
console.log(lightmode.css.style)
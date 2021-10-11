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
    backgroundColor: "bg",
    borderColor: "bd",
    reversed: "rv",
  },
};

const RequiredParameter = (name) => {
  throw `ParameterError: "${name}" is a required parameter`;
};
const ValueError = (msg) => {
  throw `ValueError: ${msg}`;
};

/**
 * @param {String} string
 * @returns {String}
 */
function uuidv4(string) {
  return string.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 *
 * @param {String} name : This is the string you want to abbreviate
 * @description : This function is expected to generate and abbrevated string of the param
 * @example const result=generateAbbr('black');
 * [output]=bk
 * @returns {String}
 */
const generateAbbr = (name) => {
  // for generating abbreviations internally
  if (!name) {
    throw "ValueError: name is missing or is an empty string";
  } else if (typeof name !== "string") {
    throw TypeError("name should be a string");
  }
  var ar = [],
    vowels = "aeiou",
    str = name.toLowerCase(),
    char;
  for (char of str) {
    if (vowels.search(char) == -1) {
      ar.push(char);
    }
  }
  if (ar.length) {
    let consonants = ar.join("");
    return consonants.slice(0, 1) + consonants.slice(-1);
  }
  return str.slice(0, 1) + str.slice(-1);
};
/**
 *
 * @param {Object} props
 */

var rules = {
  /**
     * @param {string} abbr: the abbreviated name of the color
     * @param {string} color: the color's value (this can be hex, rgba, etc...)
     * @returns {String}: the returned string must be formatted as a CSS block, eg:
     <span>
        .abbr {
            color: color
            font-weight: 20px
        }
     </span>
    */
  backgroundColor: (abbr, color) => {
    return `.${colorado.abbr.backgroundColor}-${abbr} {background-color:${color}}`;
  },
  /**
     * @param {string} abbr: the abbreviated name of the color
     * @param {string} color: the color's value (this can be hex, rgba, etc...)
     * @returns {String}: the returned string must be formatted as a CSS block, eg:
     <span>
        .abbr {
            color: color
            font-weight: 20px
        }
     </span>
    */
  color: (abbr, color) => {
    return `.${abbr} {color:${color}}`;
  },
};

class color {
  /**
   * @param {String} name: the name of the color
   * @param {String} abbr: the abbreviated name of the color (if none is specified, it is generated from the color name)
   * @param {String} value: the color value, this can be hex, rgba, etc...
   * @param {Array} rules: array of functions, each function in the array is passed two parameters - abbr and color
   */
  constructor({ name, abbr, value, rules = [] } = {}) {
    var attrs = { name, value };
    for (let key in attrs) {
      attrs[key] ? null : RequiredParameter(key);
    }
    this.name = attrs.name;
    this.abbr = abbr;
    this.value = attrs.value;
    this.rules = rules;
  }

  /**
   * @type {String}
   */
  get name() {
    return this._name;
  }

  /**
   * @param {String} value
   */
  set name(value) {
    if (typeof value !== "string") {
      throw TypeError("color name should be a string");
    } else if (!value.length) {
      ValueError("color name cannot be an empty string");
    }
    this._name = value;
  }

  /**
   * @type {String}
   */
  get abbr() {
    return this._abbr;
  }

  /**
   * @param {String} value
   */
  set abbr(value) {
    var val = value ? value : generateAbbr(this.abbr);
    if (typeof val !== "string") {
      throw TypeError("color abbr should be a string");
    } else if (!val.length) {
      ValueError("color abbr cannot be an empty string");
    }
    this._abbr = val;
  }

  /**
   * @type {String}
   */
  get value() {
    return this._val;
  }

  /**
   * @param {String} value
   */
  set value(value) {
    if (typeof value !== "string") {
      throw TypeError("color value should be a string");
    } else if (!val.length) {
      ValueError("color value cannot be an empty string");
    }
    this._val = val;
  }

  /**
   * @type {[...Function(abbr, color)]}
   */
  get rules() {
    return this._rules;
  }

  /**
   * @param {Array} value: array of functions
   */
  set rules(value) {
    if (!value instanceof Array) {
      throw TypeError("color rules should be an Array");
    } else {
      for (const i of value) {
        if (typeof i !== "function") {
          ValueError("rules contains a non-function object");
        }
      }
    }
    this._rules = value;
  }
}

class mode {
  /**
   * @param {String} name
   * @param {String} abbr
   * @param {[color]} colors
   * @param {mode} reverse
   */
  constructor(name, abbr, colors, reverse) {
    name ? null : RequiredParameter("name");
    colors ? null : RequiredParameter("colors");
    if (!Array.isArray(colors)) {
      throw TypeError("'colors' should be an array of color");
    }
    this.name = name;
    this.colors = colors;
    this.abbr = abbr || generateAbbr(name);
    reverse ? (this.revr = reverse) : null;
  }

  /**
   * @param {Element} target
   * @param {String} abbr
   * @param {String} value
   * @returns {void}
   */
  setVar(target, abbr, value) {
    target.style.setProperty(`--${abbr}`, value);
  }

  /**
   * @param {Element} target
   * @param {String} reversedAbbr
   * @returns {Promise|undefined}
   * */
  load(target, reversedAbbr) {
    /**
     * @type {color} c
     */
    var c;
    for (c of this.colors) {
      this.setVar(target, c.abbr, c.value);
      this.setVar(target, `${this.abbr}-${c.abbr}`, c.value);
    }
    if (this.reverse) {
      return new Promise((resolve, reject) => {
        try {
          this.reverse.unload(target, reversedAbbr);
          resolve(
            this.name.search(/(?:mode|theme)$/) == -1
              ? `${this.name}-mode`
              : this.name
          );
        } catch (err) {
          reject(err);
        }
      });
    }
    return undefined;
  }

  /**
   * @param {Element} target
   * @param {String} reversedAbbr
   * @returns {Promise|undefined}
   * */
  unload(target, reversedAbbr) {
    /**
     * @type {color} c
     */
    var c;
    for (c of this.colors) {
      this.setVar(target, `${this.abbr}-${c.abbr}`, c.value);
      this.setVar(target, `${reversedAbbr}-${c.abbr}`, c.value);
    }
  }

  /**
   * @type {String}
   */
  get name() {
    return this._name;
  }

  /**
   * @param {String} value
   */
  set name(value) {
    if (typeof value !== "string") {
      throw TypeError("mode name should be a string");
    } else if (!value.length) {
      ValueError("mode name cannot be an empty string");
    }
    this._name = value;
  }

  /**
   * @type {String}
   */
  get abbr() {
    return this._abbr;
  }

  /**
   * @param {String} value
   */
  set abbr(value) {
    var val = value ? value : generateAbbr(this.abbr);
    if (typeof val !== "string") {
      throw TypeError("mode abbr should be a string");
    } else if (!val.length) {
      ValueError("mode abbr cannot be an empty string");
    }
    this._abbr = val;
  }

  /**
   * @type {mode | undefined}
   */
  get reverse() {
    return this._revr;
  }

  /**
   * @param {mode | undefined} value
   */
  set reverse(value) {
    if (!value instanceof mode) {
      throw TypeError("mode reverse should be another mode");
    }
    this._revr = value;
    value.reverse = this;
  }

  /**@type {Array} */
  get colors() {
    return this._colors;
  }

  /**
   * @param {Array} value
   */
  set colors(value) {
    if (!value instanceof Array) {
      throw TypeError("mode colors should be an Array");
    }
    if (!value.length) {
      throw Error("mode colors should contain at least one color");
    }
    for (const i of value) {
      if (!i instanceof color) {
        ValueError("mode colors contains a non-color object");
      }
    }
    this._colors = value;
  }
}

class theme {
  /**
   *
   * @param {[...mode]} modes: an array of modes
   * @param {[...rule]} rules: an array of rules
   * @returns {theme}
   */
  constructor(
    modes = [],
    rules = [rules.backgroundColor, rules.color],
    reversedAbbr = globalThis.colorado.abbr.reversed
  ) {
    this.modes = modes;
    this.revr = reversedAbbr;
    this.rules = rules;
  }

  /**
   * @type {[...mode]}
   */
  get modes() {
    return this._modes;
  }

  /**
   * @param {[...mode]} value
   */
  set modes(value) {
    if (!value instanceof Array) {
      throw TypeError("theme mode must be an array");
    }
    if (!value.length) {
      throw Error("theme modes should contain at least one mode");
    }
    for (var m of value) {
      if (!m instanceof mode) {
        throw TypeError("theme mode contains non-mode objects");
      }
    }
  }

  /**
   * @type {[...function(abbr, color)]}
   */
  get rules() {
    return this._rules;
  }

  /**
   * @param {[...mode]} value
   */
  set rules(value) {
    if (!value instanceof Array) {
      throw TypeError("theme rules must be an array");
    }
    for (var m of value) {
      if (!m instanceof Function) {
        throw TypeError("theme rules contains non-function objects");
      }
    }
    this._rules = value;
  }
}
module.exports = {
  generateAbbr,
};

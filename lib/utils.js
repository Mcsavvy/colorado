/*jshint node: true */
var defaults = {
    rabbr: 'rv',
    
    /**@type {string} */
    get joiner(){return this._joiner;},

    /**@param {string} */
    set joiner(value){
        if (isNonEmptyString(value) && value.match(/^-|_$/i)){
            this._joiner = value;
        }
    },
    join(...strings){
        return strings.join(this.joiner);
    }
};

defaults.joiner = '-';

var re = {
    /**@param {string} value */
    'css-class-name': value => 
        Boolean(value.match(/^(?!\d)(?:\-(?!\-|\d)|[a-z_])$/i)),
};

/**
 * @param {string} caller
 * @param {string} msg*/
 function ValueError(caller, msg) {
    throw `ValueError: [${caller}] ${msg}`;
}

/**
 * @param {string} caller 
 * @param {Object<string,*>} pairs
 * @return {RequiredParameter}*/
 function RequiredParameter(caller, pairs = {}) {
    var arr = [];
    for (var key in pairs) {
        if (pairs[key] == null) { arr.push(key); }
    }
    if (arr.length) {
        throw (1 in arr) ?
            `ParameterError: [${caller}] (${arr.slice(0, -1).join(', ')} and ${arr.slice(-1)}) are required parameters`
            : `ParameterError: [${caller}] "${arr[0]}" is a required parameter`;
    } return RequiredParameter;
}


/**
   * @param {Array} arr
   * @returns {Array}*/
function unique(arr) {
    var prims = {
        boolean: {},
        number: {},
        string: {}
    }, objs = [];
    return arr.filter((item) => {
        var type = typeof item;
        // console.log({type,item,arr});
        if (type in prims) {
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        } else {
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
        }
    });
}

/**
 * @param {object} type
 * @param {Array} array
 * @return {Boolean}*/
function isArrayOfOnly(type, array) {
    return Array.isArray(array) &&
        !array.filter(item => !(item instanceof type)).length;
}


/***
 * @param {number} count
 * @param {object} type
 * @param {Array} array*/
function isArrayOfAtLeast(count, type, array) {
    return isArrayOfOnly(type, array) && unique(array).length >= count;
}

/***
 * @param {object} type
 * @param {Array} array*/
function isArrayOfAtLeastOne(type, array) {
    return isArrayOfAtLeast(1, type, array);
}

/**@param {Array} */
function mergeArrays(...arrays) {
    const array = [];
    arrays.forEach(item => array.push(...item));
    return array;
}

/**@returns {Object<string,*>}*/
function mergeObjects(...objects) { return Object.assign(Object.create(null), ...objects); }

function zip(...arrays) {
    var shortest = arrays.sort((a, b) => a.length - b.length)[0];
    return shortest.map((item, index) => arrays.map(value => value[index]));
}

/**@param {string} value */
function isNonEmptyString(value) {
    return (value != null &&
        (typeof value.valueOf() === 'string') &&
        value.length >= 1);
}

/**@param {number} count @param {string} value */
function isStringOfAtLeast(count, value) {
    return isNonEmptyString(value) &&
        value.length >= count;
}

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


export {
    unique, RequiredParameter,
    generateAbbr,uuidv4,isArrayOfAtLeast,
    isArrayOfOnly,isNonEmptyString,
    isStringOfAtLeast,isArrayOfAtLeastOne,
    defaults, ValueError
};
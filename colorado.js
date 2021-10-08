/*
Give your page a different feel using **Colorado**
This is by far the easiest theming tool which gives you full control
over the colors on your page in an exciting way

This tool makes use of jQuery if available, if not, it sticks to vanilla js
This tool is built firmly around css variables::

CSS VARIABLES
=============
set a variable inside a css block, e.g:

body {
    --color: #ea22f4
    --height: 5rem
}

then you can refer to the variable in any css block using "var", eg:

ul {
    background: var(--color)
    min-height: var(--height)
}



*/
"use strict";
globalThis.colorado = {
    abbr: {
        backgroundColor: 'bg',
        borderColor: 'bd',
        reversed: 'rv'
    }
}

var RequiredParameter = (name) => {throw `ParameterError: "${name}" is a required parameter`}
var ValueError = (msg) => {throw `ValueError: ${msg}`}

function generateAbbr(name) {
    // for generating abbreviations internally
    if (!name){
        throw "ValueError: name is missing or is an empty string"
    } else if (typeof name !== "string") {
        throw TypeError("name should be a string")
    }
    var ar = [],
        vowels = 'aeiou',
        str = name.toLowerCase(),
        char
    for (char of str){
        if (vowels.search(char) == -1){ar.push(char)}
    }
    if (ar.length){
        let consonants = ar.join('')
        return consonants.slice(0,1) + consonants.slice(-1)
    } return str.slice(0,1) + str.slice(-1)
}

var rules = {
    /*
    each rule should be a function which would be passed two parameters
    @param {string} abbr: the abbreviated name of the color
    @param {string} color: the color's value (this can be hex, rgba, etc...)

    each rule is expected to return a css block using <abbr> as css class name, e.g
    .<abbr> {
        css goes here...
    }
    */
    backgroundColor: (abbr, color) => {
        return `.${colorado.abbr.backgroundColor}-${abbr} {background-color:${color}}`},
    color: (abbr, color) => {
        return `.${abbr} {color:${color}}`},
}


class color {
    constructor({name,abbr,value,rules=[]}={}){
        var attrs = {name,value}
        for (let key in attrs){
            attrs[key]?null:RequiredParameter(key)
        }
        this._name = attrs.name
        this._abbr = abbr || generateAbbr(attrs.name)
        this._val = attrs.value
        this._rules = rules
    }

    get name(){return this._name}
    set name(value){
        if (typeof value !== 'string'){
            throw TypeError('color name should be a string')
        } else if (!value.length){
            throw Error('color name cannot be an empty string')
        }
    }
}


class mode {
    constructor({name,abbr,colors,reverse}={}){
        name?null:RequiredParameter('name')
        colors?null:RequiredParameter('colors')
        if (!Array.isArray(colors)){throw TypeError("'colors' should be an array of color")}
        this._name = name
        this._colors = colors
        this._abbr = abbr || generateAbbr(name)
        reverse? this._revr = reverse: null
    }

    set(abbr, color){
        abbr?null:RequiredParameter('abbr')
        color?null:RequiredParameter('color')
    }
}


console.log(generateAbbr('dark'))
 
var nC = new color({name:'primary'})
console.log(nC)
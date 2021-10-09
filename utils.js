/**
 * 
 * @param {function(...args)} fn: the function recieving the arguments
 * @param {[...'parameter']} paramOrder: the order of parameter, from first to last
 * @param {{'parameter':'default-value'}} defaults: the default values arguments
 * @param {[...'parameter']} required: required parameter names
 * @returns {function(...args)}
 * 
 * this is very useful in a function which has default arguments an expects arguments to be supplied positionally or using keywords
 * 
EXAMPLE
 
function foo(a=1,b=2,c=3) { do something... }

we can easily call our function like this foo() or foo(3,2,1)

but what happen when we want to supply only one argument - c ?

that where this function comes into play
 * 
 */
function deconstruct_arguments(fn, paramOrder=[], defaults={}, required=[]) {
    for (var key in defaults){
        if (required.find(i => i == key)){
            throw Error(`"${key}" cannot be required when it has a default value`)
        }
        if (!paramOrder.find(i => i == key)){
            throw Error(`"${key}" was not included in paramOrder but has a default value`)
        }
    }
    function inner(...args) {
        if (!args.length){
            return fn.call(this, paramOrder.map(value => defaults[value]))
        } else if (args.length == 1){
            if (typeof args[0] === 'object'){
                var arg$ = args[0]
                var mapping = new Map()
                for (var param of paramOrder){
                    if ((!param in arg$) && required.find(value => value == param)){
                        throw Error(`"${param}" is a required parameter`)
                    } mapping[param] = arg$[param] || defaults[param]
                }
                return fn.call(this, Object.values(m))
            } else {
                // only one argument was supplied, lets check if the others are required
                for (var param of required){
                    if (param == paramOrder[0]){
                        continue
                    }
                    throw Error(`"${param}" is a required parameter`)
                }
                // no other parameter is required
                return fn.call(this, paramOrder.map(value => value=paramOrder[0]?args[0]:defaults[value]))
            }
        } else {
            var $arguments = new Array(paramOrder.length)
            for (var index in paramOrder){
                if ((!index in args) && required.find(value => value == paramOrder[index])){
                    throw Error(`"${paramOrder[index]}" is a required parameter`)
                }
                var value = index in args?args[index]:defaults[paramOrder[index]]
                $arguments.push(value)
            }
            return fn.call(this, arguments)
        }
    } return inner
}

module.exports = {deconstruct_arguments}
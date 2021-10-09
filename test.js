function decorator() {
    console.log(arguments)
}

@decorator
function foo(params) {
    
}

console.log(foo())
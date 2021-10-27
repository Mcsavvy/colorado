# **Rules**

## **To build this, we first have to break it down** 📜

A rule is syntactically similar to a regular css block with a few key differences.

* Rules are dynamic and change based on what they render.
* Rules are very adaptive
* Rules can be reused

## Guidelines

### Arguments

1. selector {`string`} [Required]: a valid css-selector for the rule, which can contain [`<abbr/>`](#dynamic-selectors).

2. props {`object`} [Required]: an `Object` containing `property:value` pairs. Each value may contain `<abbr/>`, `<color/>`, `<var/>` or as many [template variables](#building-dynamic-properties).

### Basic Usage

```javascript
const backgroundColor = new rule(
    '.bg', {
        'background-color': '<abbr/><color/>'
    });

// we set the selector to "<abbr/>-bg"
// then we added only one property:value pair "background-color:<abbr/>"

// NOTE:
// * <abbr/> would be replace with the first value we pass to render
// * <color/> would be replaced with the second value we pass to render


console.log(backgroundColor.render("dark", {color: "blue")});
```

```css
.bg {
    background-color: darkblue
}

/* Hold up, there's MORE! */
```

### Multiple CSS Properties

> Life Is Really Simple, But We Insist On Making It Complicated

You can specify an **unlimited** number of CSS properties at creation. The rendering works the same.

```javascript
const card = new rule(
    '.card', {
        'color': '<abbr/><color/>',
        'font-weight': 400,
        'font-size': '1.5rem',
        'font-family': 'Arial, Helvetica, sans-serif'
    });

console.log(card.render('light', {color: 'blue')});
```

```css
.card {
    color: lightblue;
    font-weight: 400;
    font-size: 1.5rem;
    font-family: "Arial, Helvetica, sans-serif"
}
```

**Voila!** Notice there a couple of properties prefixed with "font", we could save a few keystrokes by writing this instead

```javascript
const card = new rule(
    '.card', {
        color: '<abbr/><color/>',
        font: {
            weight: 400,
            size: '1.5rem',
            family: 'Arial, Helvetica, sans-serif'
        }
    });

console.log(card.render('light', {color: 'blue')});
```

```css
.card {
    color: lightblue;
    font-weight: 400;
    font-size: 1.5rem;
    font-family: "Arial, Helvetica, sans-serif"
}
```

### CSS Selectors?

> A Mind That Is Stretched By A New Experience Can Never Go Back To It's Old Dimensions

***Absolutely!*** Go crazy with it, Colorado doesn't give a sh*t. Just be sure you know what you're doing :)

```javascript
const Rule = new rule(
    ".class#id:not([attr^='foo']) ~ span > strong", {
        ...
    }
)
```

### Dynamic Selectors

> Talk Is Cheap; Show Me The Code

Adding `<abbr/>` (_notice the forward slash right before the closing angle bracket_) to a rule's selector automagically makes it a dynamic selector. Dynamic selectors change based on how a rule is rendered.

#### Colorado Classes

Every rule's selector is broken down into tokens which are like tiny css selectors that can stand on their own. A few tokens are

* Element Selectors e.g `p`, `body`, `span`
* ID Selectors e.g `#submit-button`, `#menu`
* Class Selectors e.g `.btn`, `.text-red`
* *Colorado Class Selectors* : This type of selector is specific to colorado, it looks like a normal class selector except that it does start with a dot `.` and it contains the `<abbr/>` template variable. e.g `<abbr/>-btn` `lg-<abbr/>-400`

> A Comprehensive List Of CSS Selectors And Their Usage Can Be Found [Here](https://www.lambdatest.com/blog/css-selctors-cheat-sheet/amp/)

```javascript
// let's reuse an old example

const card = new rule(
    // this card contains only one colorado-class
    '<abbr/>-card', {
        color: '<abbr/><color/>',
        font: {
            weight: 400,
            size: '1.5rem',
            family: 'Arial, Helvetica, sans-serif'
        }
    });
console.log(
    card.render('light', {color: 'blue'}),
    card.render('dark', {color: 'blue'})
)
```

```css
.light-card {
    color: lightblue;
    font-weight: 400;
    font-size: 1.5rem;
    font-family: "Arial, Helvetica, sans-serif"
}

.dark-card {
    color: darkblue;
    font-weight: 400;
    font-size: 1.5rem;
    font-family: "Arial, Helvetica, sans-serif"
}
```

With this kind of power, you can now confidently use `class="dark-card"` and `class="light-card"` in your markup knowing your elements would be styled accordingly. You skip to [color](color.md) to start using rules straight away.

### Template Variables

> Time Is Too Slow For Those Who Wait

In practice, we observed that you tend to repeat yourself a lot of times when handling CSS. It could be that different elements would be using a particular color, font and margin. It could also be that you want an element styled differently when it's in different states e.g `:hover`, `:active`, `:focus`. In each case, you would have to create different css rules for each element or each state.

**Colorado** fully supports the [**DRY**](https://en.wikipedia.org/wiki/Don%2527t_repeat_yourself&sa=U&ved=2ahUKEwiW04fWuOjzAhWil2oFHaREAggQFnoECAcQAg&usg=AOvVaw23MTerJDqlmY-XwkCNMAPC) principle so we added TEMPLATE VARIABLE syntax which allows you to use "placeholder values" to be substituted at your-time.
The syntax is simple, just wrap the property-name with `</>` e.g `<font/>`.

Colorado provides a few template variables out-of-the-box!

* ***abbr*** (`<abbr/>`) : This can be used in your selector and in your property values too.
* ***var*** (`<var/>`) : This is almost always the same as `var(--<abbr/>)`
* ***var-N*** (`<var-N/>`): For every [colorado-class](#colorado-classes) you specify in a selector, there's a corresponding `<var-N/>` for it, where `N` is the id of the colorado-class. Here's what I mean

    ```javascript
    const Rule = new rule('.menu<abbr/>bg <abbr/>:active ~ body > text-<abbr/>', ...)
    // this selector has 3 colorado classes so there'll be <var-1/>, <var-2/> and <var-3/>
    ```

### Building Dynamic Properties

> You Must Be The Change Wish For

The `render` method is not meant to be used by you, it was created for internal use; we only use it for the purpose of viewing what our styles would look like if they are actually rendered by colorado.

Here's what you need do to start using template variables: **NOTHING!**

Just create and use them.

```javascript
const card = new rule(
        '<abbr/>-card', {
        'background-color': '<color/>',
        'font-size': '<size/>',
        'text-align':'<text/>',
    });

// now just call render with the values you want to use replace the template variables
// remember to reference them by their names e.i reference "<size/>" using "size"

console.log(
    card.render('dark', {
        color: 'black',
        size: '14px',
        text: 'left'
    }),
);
```

```css
.dark-card {
    background-color: black;
    font-size: 14px;
    text-align: left
}
```

But since in a real scenario, we'll never get to call `render`, how do we control rendering?

### Controlled Rendering</h4>

All rules would appropriately replace  `<abbr/>`, `<var/>` and `<var-N/>` when rendered internally but ignore all other template variables; this is a feature not a bug. Rules provide a `renderWith` method that give you control over the rendering process. This was in fact created for your use **only**. This method takes only one argument, which is the values you want to use to replace the template variables and it returns the rule bak to you so it's a very convenient method for [chaining](#chaining-methods).

```javascript
const card = new rule(
        '<abbr/>-card', {
        'background-color': '<color/>',
        'font-size': '<size/>',
        'text-align':'<text/>',
    });

card.renderWith({size:'16px',text:'center'});
console.log(
    card.render('dark', {color: 'black'}),
);
```

```css
.dark-card {
    background-color: black;
    font-size: 16px;
    text-align: center
}
```

### Chaining Methods

For convenience sake, all methods that make changes to a `rule` would **always** return the `rule`.
This can be especially very useful in connecting methods; making your code look clean and straight forward. Now instead of writing

```javascript
rule.selector = '...';
rule.renderWith(...);
rule.render(...)
```

You should write

```javascript
(rule.selector = "...").renderWith(...).render(...)

// instead of using parenthesis to wrap an assignment, use the "update" method
```

### Updating Properties

Rules have an `update` property that can be used to update both it's `selector` and it's `props`.
This method is so useful because it allows you to chain other methods. Watch how it was used alongside `renderWith`.

```javascript
// first we make a reusable template named node
var node = new rule(
    '#generic', {
        background: {color: '<bg/>'},
        font: {
            family:'<font/>',
            size: '<size/>',
        },
        color: '<color/>',
        padding: '<padding/>',
        margin: '<margin/>',
        height: '<height/>',
    }
);

var Box = node.renderWith({
    bg: '<abbr/>blue',
    font: 'Monospace',
    size: '14px',
    padding: '1rem',
    margin: '2px',
    height: '5rem',
}).update.selector('<abbr/>-box').update.props({
    border: {
        color: '<color/>',
        style: 'solid',
        radius: '20%'
    },
    height: 'max-content',
})
console.log(Box.render('dark', 'blue'));
```

```css
.dark-box {
    background-color: darkblue;
    font-family: Monospace;
    font-size: 14px;
    color: blue;
    padding: 1rem;
    margin: 2px;
    height: max-content;
    border-color: blue;
    border-style: solid;
    border-radius: 20%
}
```

But I did not live up to my word - `node` is no longer reuseable. It got changed when we called `renderWith`. 

```javascript
console.log(node.render('dark', 'blue'));
```

```css
.dark-box {
    background-color: darkblue;
    font-family: Monospace;
    font-size: 14px;
    color: blue;
    ...
}
```

### Extending The Rules

The solution to the above problem lies in a single method - `extend`
Extend creates a twin rule on the spot and returns it.

We should refactor the `Box` to be an extension of `node`

```javascript
var Box = node.extend.renderWith({
    bg: '<abbr/>blue',
    font: 'Monospace',
    size: '14px',
    padding: '1rem',
    margin: '2px',
    height: '5rem',
}).update.selector('<abbr/>-box').update.props({
    border: {
        color: '<color/>',
        style: 'solid',
        radius: '20%'
    },
    height: 'max-content',
})
console.log(
    Box.render('dark', 'blue'),
    node.render('dark', 'blue'),
);
```

```css
.dark-box {
    background-color: darkblue;
    font-family: Monospace;
    font-size: 14px;
    color: blue;
    padding: 1rem;
    margin: 2px;
    height: max-content;
    border-color: blue;
    border-style: solid;
    border-radius: 20%
}
#generic {
    background-color: <bg/>;
    font-family: <font/>;
    font-size: <size/>;
    color: blue;
    padding: <padding/>;
    margin: <margin/>;
    height: <height/>
}
```

### There's more !!! 🤭

I left the best for the last minute and since you're still here, you earned it.

#### Going Too Dynamic

The `value` in each `property:value` pair can have multiple template variables, can even contain javascript expressions or can be functions. Using `<tm1/> <tm2> <tmp3/>` for template variables, `${expression...} $[expression...] $(expression...)` for template literals, or specifying a function; your values don't have to be static.

When you use either a template literal or a function, you have access to `this` which would contain all the `property: value` pairs, the [classnames]() and also contain the [parsed selector]().

```js
const btn = new rule('btn', {
    'line-height': '1.5',
    size: '<size/>', // variable to lookout for
    font: {
        weight: '400',
        size: '<size/>rem',
    },
    border: {
        style: 'solid',
        width: '1px',
        radius: function(){
            if (this.size < 0.9) return '0.2rem';
            else if (this.size > 1.2) return '0.3rem';
            else return '0.25rem';
        },
    },
    padding: function(){
        if (this.size < 0.9) return '0.25rem 0.5rem';
        else if (this.size > 1.2) return '0.5rem 1rem';
        else return '0.357rem 0.75rem';
    }
})

const largeBtn = btn.extend.renderWith({size: 1.25}).update.selector('btn-lg');
const mediumBtn = btn.extend.renderWith({size:1}).update.selector('btn-md');
const smallBtn = btn.extend.renderWith({size:0.875}).update.selector('btn-sm');

console.log(
    largeBtn.render(),
    mediumBtn.render(),
    smallBtn.render()
);
```

```css
btn-lg {
    line-height: 1.5;
    size: 1.25;
    font-weight: 400;
    font-size: 1.25rem;
    border-style: solid;
    border-width: 1px;
    border-radius: 0.3rem;
    padding: 0.5rem 1rem
}
btn-md {
    line-height: 1.5;
    size: 1;
    font-weight: 400;
    font-size: 1rem;
    border-style: solid;
    border-width: 1px;
    border-radius: 0.25rem;
    padding: 0.357rem 0.75rem
}
btn-sm {
    line-height: 1.5;
    size: 0.875;
    font-weight: 400;
    font-size: 0.875rem;
    border-style: solid;
    border-width: 1px;
    border-radius: 0.2rem;
    padding: 0.25rem 0.5rem
}
```

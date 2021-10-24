# COLORADO

## Goodbye to CSS IN JS?

### with the recent advancements in web development technologies, it has become kinda obsolate to use the **dang 'ol stylesheet** -- _well that is if you don't want to be left behind..._

Different Libraries and Frameworks  like **React**, **VUE**, **Angular** and  **Emotion**  have greatly simplified the styling process for us but sometimes we might not need that much  configuration and setup, this is the point where you need to consider **colorado**

## HOW TO CLONE PROJECT

```bash
~$ mkdir colorado
~$ cd colorado
~/colorado$ git clone https://github.com/Mcsavvy/colorado.git

```

## HOW TO START

```bash
npm install
npm start
```

## HOW TO TEST

```bash
npm test
```

The greens shows that the function or utility has passed the test.

## USAGE

Colorado comes packed with these five ( _maybe four_ ) high-level classes for handling CSS-IN-JS the easiest and most elegant ways. Say goodbye to CSS preprocessors.

* [**rule**](#rules)
* [**color**](#colors)
* [**mode**](#modes)
* [**duo**](#duo)
* [**theme**](#themes)

## NOTE

* **required arguments should be supplied in the order they are listed, optional arguments should be supplied as options after the required arguments. ie:**

```javascript
`
component has 4 parameters

1. a [Required]: ...
2. b [Required]: ...
3. c [Optional]: ...
4. d [Optional]: ...
`
// Don't do this
const comp = component('A', 'B', 'C')

// Do this instead
const comp = component('A', 'B', {'c':'C'})

// This is wrong
const comp = component('B', 'A')

// This is correct
const comp = component('A', 'B', {'d':'D','c':'C'})

// Optional Arguments can be ignored
const comp = component('A', 'B')
```

* **you can access the values of any component using the same names in the component's parameters i.e**

```javascript
> comp.a
'A'

// if you supplied "c"
> comp.c
'C'

// if you didn't supply "d"
> comp.d
undefined
```

* **you can modify the values of any component using the same names in the component's parameters i.e**

```javascript
> comp.a = 'new value'; comp.a
'new value'


// you can still modify "d"  even if you didn't supply it
> comp.d = "D"; comp.d
"D"
```

* **make sure the argument type matches the one specified in curly braces else an error would be throw:**

```javascript
`
component has 4 parameters

1. a {string} [Required]: ...
2. b {array of string} [Required]: ...
3. c {array of string} [Optional]: ...
4. d {boolean} [Optional]: ...
`
// if the type is an array and the parameter is required, the array must contain at least one item
// if the type is an array and the parameter is optional, the array can be empty


// Raises an error cos b is empty
const comp = component('A', [])

// Raises an error cos c is not an array even though it is optional
const comp = component('A', ['B'], {'c':'C'})

// This is correct even though c is empty, cos c is optional
const comp = component('A', ['B'], {'c':[]})

// These are the correct types
const comp = component('A', ['B'], {'c':[],d:true})
```

## **Rules**

### **To build this, we first have to break it down** 📜

You want to style, use CSS, want to style fast? Use rules

Call them css rulesets, called them color templates. Rule dynamically change based on what they render and like most colorado components, they are 100% reusable

### Arguments

1. selector {`string`} [Required]: a valid css-selector for the rule, with `<abbr/>` in it. _Notice the forward-slash before the closing angle bracket_.
2. props {`object`} [Required]: an `Object` containing `property:value` pairs. Each value may contain `<abbr/>`, `<color/>` or as many [template variables](#dynamic-css-ruling).

### Usage

```javascript
const backgroundColor = new rule(
    '<abbr/>-bg', {
        'background-color': '<abbr/><color/>'
    });

`
we set the selector to "<abbr/>-bg"
then we added only one property:value pair "background-color:<abbr/>-<color/>"

NOTE: <abbr/> would be replace with the first value we pass to render
                          &
    <color/> would be replaced with the second value we pass to render
`

console.log(backgroundColor.render("dark", "blue"));
```

```css
.dark-bg {
    background-color: darkblue
}

/* This was MAGICALLY EASY right? */
```

### Multiple CSS Properties

You can specify an **unlimited** number of CSS properties at creation. The rendering works the same.

```javascript
const card = new rule(
    '<abbr/>-card', {
        'background-color': '<color/>',
        'border-radius': '1rem',
        'font-size': '1.5rem',
        'padding':'5px'
    });

console.log(card.render('dark', 'black'));
```

```css
.dark-card {
    background-color: black;
    border-radius: 1rem;
    font-size: 1.5rem;
    padding: 5px
}
```

### Dynamic CSS Ruling

In practice, we observed that you tend to repeat yourself a lot of times when handling CSS. It could be that different elements would be using a particular color, font and margin. It could also be that you want an element styled differently when it's in different states e.g `:hover`, `:active`, `:focus`. In each case, you would have to create different css rules for each element or each state.

**Colorado** fully supports the Do-Not-Repeat-Yourself (**DRY**) principle so we added TEMPLATE VARIABLE syntax which allows you to use "placeholder values" to be substituted at your-time.

The syntax is simple, just wrap the placeholder with angle brackets `</>` i.e `<variable-name/>` - _notice the forward-slash before the closing angle bracket_.

So far we already know two template variables; _`<color/>`_ and _`<abbr/>`_, but these are handled automatically when the rule renders, what happens to the others?!

### Rendering With

All rules would appropriately replace  _`<color/>`_ and _`<abbr/>`_ when rendered but ignore all other template variables; this is a feature not a bug. Rules provide a `renderWith` method that returns a clone of the rule that called it, only difference is "All Placeholders Would Now Hold Real Values". This method takes only one argument, which is an `Object` containing `placeholder: value` pairs.

```javascript
const card = new rule(
        '<abbr/>-card', {
        'background-color': '<color/>',
        'font-size': '<size/>',
        'text-align':'<text/>',
    });

const centerCard = card.renderWith({size:'16px',text:'center'});
const rightCard = card.renderWith({size:'18px',text:'right'});

console.log(
    card.render('dark', 'black'),
    centerCard.render('dark', 'black'),
    rightCard.render('dark', 'black')
);
```

```css
/* card */
.dark-card {
    background-color: black;
    font-size: <size/>;
    text-align: <text/>
}

/* centerCard */
.dark-card {
    background-color: black;
    font-size: 16px;
    text-align: center
}

/* rightCard */
.dark-card {
    background-color: black;
    font-size: 18px;
    text-align: right
}
```

### Updating Properties

Rules have an `update` property that can be used to update both it's `selector` and it's `props`.
This method is so useful because it allows you to chain other methods. This promotes clean & concise code. Watch how it was used alongside `renderWith`.

```javascript
// first we make a reusable template named node
var node = new rule(
    '<abbr/>',
    {
        'background-color': '<bg/>',
        'font-family': '<font/>',
        'font-size': '<size/>',
        'color': '<color/>',
        'padding': '<padding/>',
        'margin': '<margin/>',
        'height': '<height/>',
    }
);
var Box = node.renderWith({
    bg: '<abbr/>blue',
    font: 'Monospace',
    size: '14px',
    padding: '1rem',
    margin: '2px',
    height: '5rem',
}).update.selector(
    '<abbr/>-box'
);


// then we make a different type of box from Box
// I tricked it into creating a clone by invoking renderWith :)
var roundBox = Box.renderWith().update.selector(
    '<abbr/>-round-box'
).update.props({
    'border-color': '<color/>',
    'height': 'max-content',
    'border-style':'solid',
    'border-radius': '20%'
});


console.log(
    Box.render('light', 'blue'),
    roundBox.render('light', 'blue')
);
```

```css
.light-box {
        background-color: lightblue;
        font-family: Monospace;
        font-size: 14px;
        color: blue;
        padding: 1rem;
        margin: 2px;
        height: 5rem
}
.light-round-box {
        background-color: lightblue;
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

`renderWith` creates a new rule and returns it, so I used it to clone `Box`. `update` updates the rule in-place and returns it. Both can be used anywhere a rule is required.

### A Word On CSS Selectors

Rules support a wide-range of css-selector; as long as they contain `<abbr/>`, they are valid. At the same time we have excluded some generic and uncommon css-selectors, selectors like `:not`, `:is` & `*` would not work currently. Use selectors as you would use them in regular stylesheets.

```javascript
// don't use the * selector.
var r = new rule('*:active', ...);

// don't use the :not or :is
// don't forget to add <abbr/>
var r = new rule(':not(:checked)', ...);
var r = new rule('input:is(:checked)', ...);

// all other selectors can be mixed
var r = new rule('<abbr/>card:active > ul.menu > li.menu-item:first-child', ...);

// selector can be seperated by commas
var r = new rule('<abbr/>card, #submitBtn, span::after', ...);
```

## **Colors**

### **NEVER repeat yourself; twice**🔖

### the `color` class is used to create a single color that would probably get used a couple of times, save you copy and paste time and like most colorado components, it is 100% reuseable

> color accepts two required arguments and two optional arguments at initialization.

1. **name {`string`} [Required]: the name of the color**

2. **value {`string`} [Required]: the value of the color, this can be hex, rgba, hsla, etc...**

3. **abbr {`string`} [Optional]: the abbreviated name of the color e.g, `red -> rd`**

4. **rules {`array` of `rule`} [Optional]: rules that would be used to render this color**

> colors intuitively know the following

* the css classes they would be bound to `color.css.classes`
* how they would render on stylesheets `color.css.style`
* the css variables they would create `color.css.vars`

```javascript
const lightblue = new color('blue', 'lightblue',{rules:[card]})
const darkblue = new color('blue', 'lightblue',{rules:[card]})

> lightblue.css.classes
['bl-card']

> lightblue.css.vars
['--bl']

> darkblue.css.style
```

```css
.bl-card {
    background-color: darkblue;
    border-radius: 1rem;
    font-size: 1.5rem;
    padding: 5px
}
```

## **Modes**

### **This just keeps getting better**🌚

### modes are basically a color scheme consisting of different color combinations. nowadays darkmodes are a requirements for every UI, some UIs give you many more modes, for example light, dark and classic-dark. Like most colorado components... _you know the rest_

> modes take two required arguments and three optional arguments at initialization

1. **name {`string`} [Required]: name of the mode**
2. **colors {`array` of `color`} [Required]: colors that are part of this colorscheme**
3. **abbr {`string`} [Optional]: abbreviated name of this mode e.g `classicdark -> c-dk`**
4. **rules {`array` of `rule`} [Optional]: rules that would be used to render this mode**
5. **reverse {`mode`} [Optional]: another mode representing the direct reverse of this mode e.g `light -> dark`**

> modes intuitively know the following

* **the css classes they would be bound to `mode.css.classes`**
* **how they would render on stylesheets `mode.css.style`**
* **the css variables they would create `mode.css.vars`**

```javascript

const lightblue = new color('blue', 'lightblue')
const darkblue = new color('blue', 'lightblue')

// these two colors needed to be recreated without the rules
// specifying the rules on the mode would be more efficient

const lightmode = new mode('light', [lightblue], { rules:[card] })
const darkmode = new mode('dark', [darkblue], { rules:[card], reverse:lightmode })

// making lightmode the reverse of darkmode automagically makes darkmode the reverse of light mode


> lightmode.css.classes
['lt-bl-card', 'rv-bl-card']

> darkmode.css.classes
['dk-bl-card', 'bl-card']

> lightmode.css.vars
['--lt-bl', '--rv-bl']

> darkmode.css.vars
['--dk-bl', '--bl']

// we would user array.join('\n') to view the two styles together
> [darkmode.css.style, lightmode.css.style].join('\n')
```

```css
/* darkmode */
.dk-bl-card {
    background-color: darkblue;
    ...
}
.bl-card {
    background-color: darkblue;
    ...
}

/* lightmode */
.lt-bl-card {
    background-color: lightblue;
    ...
}
.rv-bl-card {
    background-color: lightblue;
    ...
}
```

### If you paid attention to the snippet above you would notice that `lightmode` doesn't render `bl` anymore, instead it renders `rv-bl` (_`rv` is abbreviation for reverse_). This is because `lightmode` knows that

* It is the reverse of `darkmode`.
* `darkmode` is active ( _confirm with `mode.isActive`_ )
* Rendering two different `bl` would confuse you and regress your stylesheet.

## **Duo**

**Two heads are better than one - _sometimes_** 👥

### Just as the name suggests, a `duo` is A PAIR. Duos are used to pair up different modes especially in a situation where you have different modes with the same name. Now you can have different darkmodes active on the same page without every bothering about a clash. There'll be no mistakes

> modes take two required arguments and three optional arguments at initialization

1. **name {`string`} [Required]: name of the mode**
2. **colors {`array` of `color`} [Required]: colors that are part of this colorscheme**
3. **abbr {`string`} [Optional]: abbreviated name of this mode e.g `classicdark -> c-dk`**
4. **rules {`array` of `rule`} [Optional]: rules that would be used to render this mode**
5. **reverse {`mode`} [Optional]: another mode representing the direct reverse of this mode e.g `light -> dark`**

> modes intuitively know the following

* **the css classes they would be bound to `mode.css.classes`**
* **how they would render on stylesheets `mode.css.style`**
* **the css variables they would create `mode.css.vars`**

    THEMES
    ˈ   ˈ
    ˈ   MODES
    ˈ   ˈ   ˈ
    ˈ   ˈ   COLORS
    ˈ   ˈ   ˈ    ˈ
    ˈ---ˈ---ˈ--- RULES

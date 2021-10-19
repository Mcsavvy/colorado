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

### rule accepts two required arguments

1. className {`string`} [Required]: a css classname for the rule, with `<abbr>` in it.
2. props {`object`} [Required]: a css properties with `key:value` pairs. Each value can optionally  contain `<abbr>` or `<color>`

```javascript
const backgroundColor = new rule(
    '<abbr>-bg',
    { 'background-color': '<attr><color>' }
)


/*
we just set the classname to "<abbr>-bg".
[this would be changed when the rule is rendered]
[it would be changed to the first value we pass to render]

we added only one key:value pair "background-color:<abbr>-<color>"
[abbr would be replace with the first value we pass to render]
[color would be replaced with the second value we pass to render]
*/

backgroundColor.render("dark", "blue")
```

```css
.dark-bg {
    background-color: darkblue
}

/* This was EASY right? */
```

```javascript

// multiple css properties can be specified - the sky is your limit

const card = new rule(
    '<abbr>-card',
    {
    'background-color': '<color>',
    'border-radius': '1rem',
    'font-size': '1.5rem',
    'padding':'5px'
    }
)

> card.render('dark', '#00000')
```

```css
.dark-card {
    background-color: #00000;
    border-radius: 1rem;
    font-size: 1.5rem;
    padding: 5px
}
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

## COLORADO

Welcome to a javascript theming libary built elegantly around CSS3

### HOW TO CLONE PROJECT

```bash
mkdir Colorado
cd Colorado
git init
git clone https://github.com/Mcsavvy/colorado.git

```

### HOW TO START

```bash
npm install
npm start
```

### HOW TO TEST

> npm test

<p>The greens shows that the function or utility has passed the presribed test it was tested for.</p>

### USAGE
Colorado comes packed with these four high-level classes for handling **first-class** theming with CSS
* **rule**
* **color**
* **mode**
* **theme**

> NOTE: required arguments should be supllied it the order the appear here, optional arguments should be 
supplied as options i.e {name:value} after the required arguments.

### **rules** - *sometimes conventions are boring*
> rules are very similar to css rulesets, they dynamically change based on what they render and like most colorado components, they are 100% reusable

```javascript
/*
* you want to style your page? use css.
* you want to style fast? use rules.
*/

`
rules are basically css templates that are elegantly written and super reuseable

rule accepts two required arguments
* className: the css class-name of the rule, with <abbr> in it.
* props: a css properties with key=value pairs, the values can contain <abbr> and <color>
`

const backgroundColor = new rule('<abbr>-bg',{'background-color':'<color>'})

`
this is the most basic rule we could create
rules allow you to render them using custom value
`
// first value passed to render would be used to replace "<abbr>"
// the second woould be used to replace "<color>"

> backgroundColor.render("dark", "#00000")
```
```css
.dark-bg {
    background-color: #00000
}
```
```javascript

// multiple css properties can be specified - the sky is your limit

const card = new rule('<abbr>-card', {
    'background-color': '<color>',
    'border-radius': '1rem',
    'font-size': '1.5rem',
    'padding':'5px'
})

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

### **colors** - *the building blocks of colorado*
> colors provides a way to quicky specify a color that would get used across your whole page and like most colorado componnts, they are 100% reusable

```javascript
`
color accepts two required arguments and two optional arguments at initialization

* name [Required]: the name of the color
* value [Required]: the value of the color, this can be hex, rgba, hsla, etc...
* abbr [Optional]: the abbreviated name of the color e.g, red -> rd
* rules [Optional]: an Array of rules that apply to this color
`

const lightblue = new color('blue', 'lightblue',{rules:[card]})
const darkblue = new color('blue', 'lightblue',{rules:[card]})



`
colors intuitively know the following:
* the css classes they would be bound to [color.css.classes]
* how the would be rendered by their rules [color.css.style]
`

> lightblue.css.classes
['bl-card']

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

### **modes** - *this just keeps getting better*
> modes focus on letting you create unique color palettes that can be flipped (think of lightmode & darkmode) and
like most colorado components...

>you know the rest.
```javascript
`
modes take two required arguments and three optional arguments at initialization

* name [Required]: name of the mode
* colors [Required]: an Array of colors belonging to this mode
* abbr [Optional]: abbreviated name of this mode e.g classicdark -> c-dk
* rules [Optional]: an Array of rules belonging to every color in this mode
* reverse [Optional]: another mode that this can be interchanged with
`
const lightblue = new color('blue', 'lightblue')
const darkblue = new color('blue', 'lightblue')

// these two colors needed to be recreated without the rules
// specifying the rules on the mode would be more efficient

const lightmode = new mode('light', [lightblue], { rules:[card] })
const darkmode = new mode('dark', [darkblue], { rules:[card], reverse:lightmode })

// making lightmode the reverse of darkmode automagically makes darkmode the reverse of light mode


`
modes intuitively know the following:
* the css classes it would be bound to [mode.css.classes]
* the css variable it would create [mode.css.vars]
* how it would be rendered by it's rules [mode.css.style]
`

> lightmode.css.classes
['lt-bl-card', 'bl-card']

> darkmode.css.classes
['dk-bl-card', 'bl-card']

> darkmode.css.vars
['--dk-bl', '--bl']

> lightmode.css.style
```
```css
.lt-bl-card {
    background-color: lightblue;
    ...
}
.bl-card {
    background-color: lightblue;
    ...
}


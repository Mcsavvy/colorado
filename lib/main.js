/*jshint node: true */

"use strict";

const html = `
<!DOCTYPE html>
<html>
  <body>
    <div id="div1">
      <div id="div1-ch1"></div>
      <div id="div1-ch2"></div>
    </div>
    <div id="div2">
      <div id="div2-ch1"></div>
      <div id="div2-ch2"></div>
    </div>
  </body>
</html>
`;

import { JSDOM } from 'jsdom';
const { document } = new JSDOM(html).window;
import { rule } from './rule.js';
import { color } from './color.js';
import { mode, duo } from './mode.js';
import { theme } from './theme.js';

var colorado = {
  abbr: {
    backgroundColor: 'bg',
    borderColor: 'bd',
    reversed: 'r'
  }
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

// RANDOM
// const red = new color({name:'color1',value:'red',rules:rules});
// const blue = new color({name:'color2',value:'blue',rules:rules});
// const green = new color({name:'color3',value:'green',rules:rules});
// const white = new color({name:'color1',value:'white',rules:rules});
// const black = new color({name:'color2',value:'black',rules:rules});
// const gray = new color({name:'color3',value:'gray',rules:rules});
// const rbg = new mode({name:'primary',abbr:'pm',colors:[red,blue,green]});
// const wbg = new mode({name:'neutral',abbr:'nt',colors:[white,black,gray],reverse:rbg});

// RULE DOC
// const backgroundColor = new rule('<abbr>-bg',{'background-color':'<color>'});
// console.log(backgroundColor.render('dark', '#00000'));
const card = new rule('<abbr>-card', {
  'background-color': '<color>',
  'border-radius': '1rem',
  'font-size': '1.5rem',
  'padding': '5px'
});

// console.log(card.render("dark", "#00000"));

// COLOR DOC
// const lightblue = new color('blue', 'lightblue', { rules: [card] });
// const darkblue = new color('blue', 'lightblue', { rules: [card] });
// console.log(lightblue.css.classes);
// console.log(darkblue.css.style);


// MODE DOC
const lightblue = new color('blue', 'lightblue');
const darkblue = new color('blue', 'darkblue');
const lightmode = new mode('light', [lightblue]);
const darkmode = new mode('dark', [darkblue]);
const classic = new duo('classic', [lightmode,darkmode], 0, {abbr:'cl',rules:[card]});
// console.log(darkmode.css.variables);
// console.log(lightmode.css.variables);
console.log(classic.css.style);
// console.log(darkmode.css.vars);
// console.log(darkmode.css.style);
// const main = new duo('regular',[lightmode,darkmode], 0, {rules:[card],abbr:'reg'});
// console.log(main.css);
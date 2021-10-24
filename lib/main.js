/*jshint node: true */

"use strict";

// const html = `
// <!DOCTYPE html>
// <html>
//   <body>
//     <div id="div1">
//       <div id="div1-ch1"></div>
//       <div id="div1-ch2"></div>
//     </div>
//     <div id="div2">
//       <div id="div2-ch1"></div>
//       <div id="div2-ch2"></div>
//     </div>
//   </body>
// </html>
// `;

// import { JSDOM } from 'jsdom';
// const { document } = new JSDOM(html).window;
import { rule } from './rule.js';
import { color } from './color.js';
import { mode, duo } from './mode.js';
import { theme } from './theme.js';


var rules = [
    new rule('<abbr/>', { color: 'var(--<abbr/>, <color/>)' }),
    new rule('bg-<abbr/>', { 'background-color': 'var(--<abbr/>, <color/>)' }),
];


export {rule, color, mode, duo, theme};
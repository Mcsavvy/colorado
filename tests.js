import {rule, color, mode, duo, theme} from './lib/main.js';
import { re } from './lib/utils.js';
import {is_not} from './lib/selector.js';



// TEST RULE EXAMPLES IN DOCUMENTATION
// const backgroundColor = new rule(
//     '<abbr/>-bg', {
//         'background-color': '<abbr/><color/>'
//     });
// console.log(backgroundColor.render("dark", "blue"));

// const card = new rule(
//     '<abbr/>-card', {
//         'background-color': '<color/>',
//         'border-radius': '1rem',
//         'font-size': '1.5rem',
//         'padding':'5px'
//     });
// console.log(card.render('dark', 'black'));

// const card = new rule(
//     '<abbr/>.card', {
//     'background-color': '<color/>',
//     'font-size': '<size/>',
//     'text-align':'<text/>',
// });
// const centerCard = card.renderWith({size:'16px',text:'center'});
// const rightCard = card.renderWith({size:'18px',text:'right'});
// console.log(
//     card.render('dark', 'black'),
//     centerCard.render('dark', 'black'),
//     rightCard.render('dark', 'black')
// );
// var node = new rule(
//     '<abbr/>',
//     {
//         'background-color': '<bg/>',
//         'font-family': '<font/>',
//         'font-size': '<size/>',
//         'color': '<color/>',
//         'padding': '<padding/>',
//         'margin': '<margin/>',
//         'height': '<height/>',
//     }
// );
// var Box = node.renderWith({
//     bg: '<abbr/>blue',
//     font: 'Monospace',
//     size: '14px',
//     padding: '1rem',
//     margin: '2px',
//     height: '5rem',
// }).update.selector(
//     '<abbr/>-box'
// );


// // then we make a different rule for box when it is being hovered
// var roundBox = Box.renderWith().update.selector(
//     '<abbr/>-round-box'
// ).update.props({
//     'border-color': '<color/>',
//     'height': 'max-content',
//     'border-style':'solid',
//     'border-radius': '20%'
// });


// console.log(
//     Box.render('light', 'blue'),
//     roundBox.render('light', 'blue')
// );

// // all other selectors can be mixed
// var r = new rule('<abbr/>card:active > ul.menu > li.menu-item:first-child', {});


// // selector can be seperated by commas
var r = new rule('<abbr/>card, #submitBtn, span::after', {});
console.log(r.selectors('dark'));
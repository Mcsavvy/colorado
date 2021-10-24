
import { isNonEmptyString, isStringOfAtLeast, RequiredParameter, ValueError, re, unique } from './utils.js';

/**@param {string} value*/
function tokenize(value) { return is_token(value) ? value : `<${value}/>`; }

/**@param {string} value*/
function is_token(value) { return re.tmpvr.test(value); }

const
    psuedo_element = /::(after|b[ae](ckdrop|fore)|cue(-region)?|first-l(etter|ine)|placeholder|selection|(grammar|spelling)-error|target-text)/,
    psuedo_class = /:(a(ctive|ny(-link)?)|checked|d(efault|i(r\((ltr|rtl)\)|sabled))|e(mpty|nabled)|f(irst(-(child|of-type))*|ullscreen|ocus)|hover|in(determinate|valid|-range)|la(ng\([a-zA-Z]{1,3}\)|(st-(child|of-type)))|l(eft|ink)|n(th-((last-)*(child|of-type)\((odd|even|(-?(n|\dn)([+\-]\d)?|\d))\)))|o(nly-(child|of-type)|ptional|ut-of-range)|r(e(ad-(only|write)|quired)|ight)|scope|target|v(alid|isited))/,
    regular_class = /[a-z]([a-z0-9-]+)?(__([a-z0-9]+-?)+)?(--([a-z0-9]+-?)+){0,2}/i,
    attribute_selector = /\[[\w\-]{2,}([~|^$*]?=("[^\n\t"]+"|'[^\n\t']+'|[^\n\t\]]+)(\s[sSiI])?)?]/,
    id_selector = /#[a-z]([a-z0-9-]+)?(__([a-z0-9]+-?)+)?(--([a-z0-9]+-?)+){0,2}/i,
    css_class = /\.[a-z]([a-z0-9-]+)?(__([a-z0-9]+-?)+)?(--([a-z0-9]+-?)+){0,2}/i,
    is_not = /:(?<class>is|not)\((?<selector>.+)\)/,
    abbr_token = 'abbr', color_token = 'color', at = tokenize(abbr_token), ct = tokenize(color_token), rdm = 'abz',
    split_at = /(?:\s>\s|\s*,+\s*|\s+)/,
unallowed = [':is', ':not'];

function SelectorError(msg=''){throw `SelectorError: ${msg}`;}

/**
 * @param {string} selector_string
 * @param {Array<string>} arr
 * @throws {SelectorError}
 */
function check_for_unallowed(selector_string, arr=unallowed){
    var detected = arr.filter(v => selector_string.search(v) !== -1);
    if (detected.length > 0)
    SelectorError(`selector contains the following unsupported css-selectors [ ${detected.join(', ')} ]`);
}

/**
 * @param {string} selector_string
 * @returns {{attribute_selectors:Array<string>,css_classes:Array<string>,element_selectors:Array<string>,
 * id_selectors:Array<string>,psuedo_classes:Array<string>,psuedo_elements:Array<string>,regular_classes:Array<string>,string:string}}
 * */
function selector(selector_string, ignore_at=false) {
    check_for_unallowed(selector_string);
    RequiredParameter('selector', { selector_string });
    if (!isStringOfAtLeast(at.length, selector_string)) SelectorError('selector too short to contain ' + at + '.');
    // split the selector_string it multiple selectors
    if (selector_string.search(at) === -1 && !ignore_at) SelectorError(`css-selector "${selector_string}" must contain ${at}`);
    var
        selectors = selector_string.split(split_at),
        dict = { attribute_selectors: [], css_classes: [], element_selectors: [], id_selectors: [], psuedo_classes: [], psuedo_elements: [], regular_classes: [] };
    for (var s of selectors) {
        var $ = s.replace(new RegExp(at, 'g'), rdm);
        // Regular Classes
        if ($ === rdm) {
            dict.regular_classes.push(s);
            $ = '';
        }
        else {
            // Attributes
            $ = $.replace(RegExp(attribute_selector, 'g'), match => {
                dict.attribute_selectors.push(match.replace(RegExp(rdm, 'g'), at)); return '';
            });
            // PsuedoElements
            $ = $.replace(RegExp(psuedo_element, 'g'), match => {
                dict.psuedo_elements.push(match.replace(RegExp(rdm, 'g'), at)); return '';
            });
            // PsuedoClasses
            $ = $.replace(RegExp(psuedo_class, 'g'), match => {
                dict.psuedo_classes.push(match.replace(RegExp(rdm, 'g'), at)); return '';
            });
            // CSS Classes
            $ = $.replace(RegExp(css_class, 'g'), match => {
                dict.css_classes.push(match.replace(RegExp(rdm, 'g'), at)); return '';
            });
            // ID Selector
            $ = $.replace(RegExp(id_selector, 'g'), match => {
                dict.id_selectors.push(match.replace(RegExp(rdm, 'g'), at)); return '';
            });
            $ = $.replace(RegExp(regular_class, 'ig'), match => {
                var has_rdm = match.search(rdm) !== -1;
                if (!has_rdm) dict.element_selectors.push(match);
                dict.regular_classes.push(match.replace(RegExp(rdm, 'g'), at)); return "";
            });
        } if (isNonEmptyString($)) SelectorError(`could not parse "${$}" into any valid css-selector type`);
    } Object.keys(dict).forEach(key => dict[key] = unique(dict[key])); return Object.assign(dict, {string:selector_string});
}

export {
    selector, at, ct, rdm, tokenize, is_token,
    is_not
};
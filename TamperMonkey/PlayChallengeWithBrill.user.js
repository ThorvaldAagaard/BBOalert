// ==UserScript==
// @name         Play BBO challenges with Brill
// @namespace    https://github.com/ThorvaldAagaard/BBOalert
// @version      0.1.0
// @description  Plays BBO robot challenges with Brill. Standalone - does NOT need the BBOalert extension.
// @match        *://www.bridgebase.com/v3/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
//
// GENERATED FILE - do not edit. Run: node Scripts/build-challenge-userscript.js
// Sources: src/iframe/*, TamperMonkey/src/shim.js, TamperMonkey/src/lobby.js,
//          Custom/PlayWithBrill.js
//
// @grant none keeps this in page context, the same reason CuebidsWithBrill.user.js needs it:
// under a sandbox, `window` is a wrapper and the page's own globals are invisible.
//
// NOT 'use strict' - deliberately. PlayWithBrill's blocks pass state between hooks via
// implicit globals (`newdeal = true` with no var), which strict mode turns into errors.
//
// SAFETY: the lobby driver only ever enters a challenge whose c_challenge_style is
// ARENA_ROBOT. See TamperMonkey/BBO-lobby-protocol.md.

// --- vendored jQuery 3.5.1 (src/jquery-3.5.1.min.js) ------------------------------
/*! jQuery v3.5.1 | (c) JS Foundation and other contributors | jquery.org/license */
!function(e,t){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof window?window:this,function(C,e){"use strict";var t=[],r=Object.getPrototypeOf,s=t.slice,g=t.flat?function(e){return t.flat.call(e)}:function(e){return t.concat.apply([],e)},u=t.push,i=t.indexOf,n={},o=n.toString,v=n.hasOwnProperty,a=v.toString,l=a.call(Object),y={},m=function(e){return"function"==typeof e&&"number"!=typeof e.nodeType},x=function(e){return null!=e&&e===e.window},E=C.document,c={type:!0,src:!0,nonce:!0,noModule:!0};function b(e,t,n){var r,i,o=(n=n||E).createElement("script");if(o.text=e,t)for(r in c)(i=t[r]||t.getAttribute&&t.getAttribute(r))&&o.setAttribute(r,i);n.head.appendChild(o).parentNode.removeChild(o)}function w(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?n[o.call(e)]||"object":typeof e}var f="3.5.1",S=function(e,t){return new S.fn.init(e,t)};function p(e){var t=!!e&&"length"in e&&e.length,n=w(e);return!m(e)&&!x(e)&&("array"===n||0===t||"number"==typeof t&&0<t&&t-1 in e)}S.fn=S.prototype={jquery:f,constructor:S,length:0,toArray:function(){return s.call(this)},get:function(e){return null==e?s.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=S.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return S.each(this,e)},map:function(n){return this.pushStack(S.map(this,function(e,t){return n.call(e,t,e)}))},slice:function(){return this.pushStack(s.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(S.grep(this,function(e,t){return(t+1)%2}))},odd:function(){return this.pushStack(S.grep(this,function(e,t){return t%2}))},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(0<=n&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:u,sort:t.sort,splice:t.splice},S.extend=S.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,l=!1;for("boolean"==typeof a&&(l=a,a=arguments[s]||{},s++),"object"==typeof a||m(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)r=e[t],"__proto__"!==t&&a!==r&&(l&&r&&(S.isPlainObject(r)||(i=Array.isArray(r)))?(n=a[t],o=i&&!Array.isArray(n)?[]:i||S.isPlainObject(n)?n:{},i=!1,a[t]=S.extend(l,o,r)):void 0!==r&&(a[t]=r));return a},S.extend({expando:"jQuery"+(f+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==o.call(e))&&(!(t=r(e))||"function"==typeof(n=v.call(t,"constructor")&&t.constructor)&&a.call(n)===l)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e,t,n){b(e,{nonce:t&&t.nonce},n)},each:function(e,t){var n,r=0;if(p(e)){for(n=e.length;r<n;r++)if(!1===t.call(e[r],r,e[r]))break}else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},makeArray:function(e,t){var n=t||[];return null!=e&&(p(Object(e))?S.merge(n,"string"==typeof e?[e]:e):u.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:i.call(t,e,n)},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r=[],i=0,o=e.length,a=!n;i<o;i++)!t(e[i],i)!==a&&r.push(e[i]);return r},map:function(e,t,n){var r,i,o=0,a=[];if(p(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&a.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&a.push(i);return g(a)},guid:1,support:y}),"function"==typeof Symbol&&(S.fn[Symbol.iterator]=t[Symbol.iterator]),S.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){n["[object "+t+"]"]=t.toLowerCase()});var d=function(n){var e,d,b,o,i,h,f,g,w,u,l,T,C,a,E,v,s,c,y,S="sizzle"+1*new Date,p=n.document,k=0,r=0,m=ue(),x=ue(),A=ue(),N=ue(),D=function(e,t){return e===t&&(l=!0),0},j={}.hasOwnProperty,t=[],q=t.pop,L=t.push,H=t.push,O=t.slice,P=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return-1},R="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",I="(?:\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",W="\\["+M+"*("+I+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+I+"))|)"+M+"*\\]",F=":("+I+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+W+")*)|.*)\\)|)",B=new RegExp(M+"+","g"),$=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),_=new RegExp("^"+M+"*,"+M+"*"),z=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),U=new RegExp(M+"|>"),X=new RegExp(F),V=new RegExp("^"+I+"$"),G={ID:new RegExp("^#("+I+")"),CLASS:new RegExp("^\\.("+I+")"),TAG:new RegExp("^("+I+"|[*])"),ATTR:new RegExp("^"+W),PSEUDO:new RegExp("^"+F),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+R+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Y=/HTML$/i,Q=/^(?:input|select|textarea|button)$/i,J=/^h\d$/i,K=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ee=/[+~]/,te=new RegExp("\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\([^\\r\\n\\f])","g"),ne=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},re=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ie=function(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},oe=function(){T()},ae=be(function(e){return!0===e.disabled&&"fieldset"===e.nodeName.toLowerCase()},{dir:"parentNode",next:"legend"});try{H.apply(t=O.call(p.childNodes),p.childNodes),t[p.childNodes.length].nodeType}catch(e){H={apply:t.length?function(e,t){L.apply(e,O.call(t))}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1}}}function se(t,e,n,r){var i,o,a,s,u,l,c,f=e&&e.ownerDocument,p=e?e.nodeType:9;if(n=n||[],"string"!=typeof t||!t||1!==p&&9!==p&&11!==p)return n;if(!r&&(T(e),e=e||C,E)){if(11!==p&&(u=Z.exec(t)))if(i=u[1]){if(9===p){if(!(a=e.getElementById(i)))return n;if(a.id===i)return n.push(a),n}else if(f&&(a=f.getElementById(i))&&y(e,a)&&a.id===i)return n.push(a),n}else{if(u[2])return H.apply(n,e.getElementsByTagName(t)),n;if((i=u[3])&&d.getElementsByClassName&&e.getElementsByClassName)return H.apply(n,e.getElementsByClassName(i)),n}if(d.qsa&&!N[t+" "]&&(!v||!v.test(t))&&(1!==p||"object"!==e.nodeName.toLowerCase())){if(c=t,f=e,1===p&&(U.test(t)||z.test(t))){(f=ee.test(t)&&ye(e.parentNode)||e)===e&&d.scope||((s=e.getAttribute("id"))?s=s.replace(re,ie):e.setAttribute("id",s=S)),o=(l=h(t)).length;while(o--)l[o]=(s?"#"+s:":scope")+" "+xe(l[o]);c=l.join(",")}try{return H.apply(n,f.querySelectorAll(c)),n}catch(e){N(t,!0)}finally{s===S&&e.removeAttribute("id")}}}return g(t.replace($,"$1"),e,n,r)}function ue(){var r=[];return function e(t,n){return r.push(t+" ")>b.cacheLength&&delete e[r.shift()],e[t+" "]=n}}function le(e){return e[S]=!0,e}function ce(e){var t=C.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function fe(e,t){var n=e.split("|"),r=n.length;while(r--)b.attrHandle[n[r]]=t}function pe(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function de(t){return function(e){return"input"===e.nodeName.toLowerCase()&&e.type===t}}function he(n){return function(e){var t=e.nodeName.toLowerCase();return("input"===t||"button"===t)&&e.type===n}}function ge(t){return function(e){return"form"in e?e.parentNode&&!1===e.disabled?"label"in e?"label"in e.parentNode?e.parentNode.disabled===t:e.disabled===t:e.isDisabled===t||e.isDisabled!==!t&&ae(e)===t:e.disabled===t:"label"in e&&e.disabled===t}}function ve(a){return le(function(o){return o=+o,le(function(e,t){var n,r=a([],e.length,o),i=r.length;while(i--)e[n=r[i]]&&(e[n]=!(t[n]=e[n]))})})}function ye(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}for(e in d=se.support={},i=se.isXML=function(e){var t=e.namespaceURI,n=(e.ownerDocument||e).documentElement;return!Y.test(t||n&&n.nodeName||"HTML")},T=se.setDocument=function(e){var t,n,r=e?e.ownerDocument||e:p;return r!=C&&9===r.nodeType&&r.documentElement&&(a=(C=r).documentElement,E=!i(C),p!=C&&(n=C.defaultView)&&n.top!==n&&(n.addEventListener?n.addEventListener("unload",oe,!1):n.attachEvent&&n.attachEvent("onunload",oe)),d.scope=ce(function(e){return a.appendChild(e).appendChild(C.createElement("div")),"undefined"!=typeof e.querySelectorAll&&!e.querySelectorAll(":scope fieldset div").length}),d.attributes=ce(function(e){return e.className="i",!e.getAttribute("className")}),d.getElementsByTagName=ce(function(e){return e.appendChild(C.createComment("")),!e.getElementsByTagName("*").length}),d.getElementsByClassName=K.test(C.getElementsByClassName),d.getById=ce(function(e){return a.appendChild(e).id=S,!C.getElementsByName||!C.getElementsByName(S).length}),d.getById?(b.filter.ID=function(e){var t=e.replace(te,ne);return function(e){return e.getAttribute("id")===t}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&E){var n=t.getElementById(e);return n?[n]:[]}}):(b.filter.ID=function(e){var n=e.replace(te,ne);return function(e){var t="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return t&&t.value===n}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&E){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),b.find.TAG=d.getElementsByTagName?function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):d.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},b.find.CLASS=d.getElementsByClassName&&function(e,t){if("undefined"!=typeof t.getElementsByClassName&&E)return t.getElementsByClassName(e)},s=[],v=[],(d.qsa=K.test(C.querySelectorAll))&&(ce(function(e){var t;a.appendChild(e).innerHTML="<a id='"+S+"'></a><select id='"+S+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&v.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||v.push("\\["+M+"*(?:value|"+R+")"),e.querySelectorAll("[id~="+S+"-]").length||v.push("~="),(t=C.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||v.push("\\["+M+"*name"+M+"*="+M+"*(?:''|\"\")"),e.querySelectorAll(":checked").length||v.push(":checked"),e.querySelectorAll("a#"+S+"+*").length||v.push(".#.+[+~]"),e.querySelectorAll("\\\f"),v.push("[\\r\\n\\f]")}),ce(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=C.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&v.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&v.push(":enabled",":disabled"),a.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&v.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),v.push(",.*:")})),(d.matchesSelector=K.test(c=a.matches||a.webkitMatchesSelector||a.mozMatchesSelector||a.oMatchesSelector||a.msMatchesSelector))&&ce(function(e){d.disconnectedMatch=c.call(e,"*"),c.call(e,"[s!='']:x"),s.push("!=",F)}),v=v.length&&new RegExp(v.join("|")),s=s.length&&new RegExp(s.join("|")),t=K.test(a.compareDocumentPosition),y=t||K.test(a.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},D=t?function(e,t){if(e===t)return l=!0,0;var n=!e.compareDocumentPosition-!t.compareDocumentPosition;return n||(1&(n=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!d.sortDetached&&t.compareDocumentPosition(e)===n?e==C||e.ownerDocument==p&&y(p,e)?-1:t==C||t.ownerDocument==p&&y(p,t)?1:u?P(u,e)-P(u,t):0:4&n?-1:1)}:function(e,t){if(e===t)return l=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,a=[e],s=[t];if(!i||!o)return e==C?-1:t==C?1:i?-1:o?1:u?P(u,e)-P(u,t):0;if(i===o)return pe(e,t);n=e;while(n=n.parentNode)a.unshift(n);n=t;while(n=n.parentNode)s.unshift(n);while(a[r]===s[r])r++;return r?pe(a[r],s[r]):a[r]==p?-1:s[r]==p?1:0}),C},se.matches=function(e,t){return se(e,null,null,t)},se.matchesSelector=function(e,t){if(T(e),d.matchesSelector&&E&&!N[t+" "]&&(!s||!s.test(t))&&(!v||!v.test(t)))try{var n=c.call(e,t);if(n||d.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(e){N(t,!0)}return 0<se(t,C,null,[e]).length},se.contains=function(e,t){return(e.ownerDocument||e)!=C&&T(e),y(e,t)},se.attr=function(e,t){(e.ownerDocument||e)!=C&&T(e);var n=b.attrHandle[t.toLowerCase()],r=n&&j.call(b.attrHandle,t.toLowerCase())?n(e,t,!E):void 0;return void 0!==r?r:d.attributes||!E?e.getAttribute(t):(r=e.getAttributeNode(t))&&r.specified?r.value:null},se.escape=function(e){return(e+"").replace(re,ie)},se.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},se.uniqueSort=function(e){var t,n=[],r=0,i=0;if(l=!d.detectDuplicates,u=!d.sortStable&&e.slice(0),e.sort(D),l){while(t=e[i++])t===e[i]&&(r=n.push(i));while(r--)e.splice(n[r],1)}return u=null,e},o=se.getText=function(e){var t,n="",r=0,i=e.nodeType;if(i){if(1===i||9===i||11===i){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=o(e)}else if(3===i||4===i)return e.nodeValue}else while(t=e[r++])n+=o(t);return n},(b=se.selectors={cacheLength:50,createPseudo:le,match:G,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(te,ne),e[3]=(e[3]||e[4]||e[5]||"").replace(te,ne),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||se.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&se.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return G.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&X.test(n)&&(t=h(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(te,ne).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=m[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&m(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(n,r,i){return function(e){var t=se.attr(e,n);return null==t?"!="===r:!r||(t+="","="===r?t===i:"!="===r?t!==i:"^="===r?i&&0===t.indexOf(i):"*="===r?i&&-1<t.indexOf(i):"$="===r?i&&t.slice(-i.length)===i:"~="===r?-1<(" "+t.replace(B," ")+" ").indexOf(i):"|="===r&&(t===i||t.slice(0,i.length+1)===i+"-"))}},CHILD:function(h,e,t,g,v){var y="nth"!==h.slice(0,3),m="last"!==h.slice(-4),x="of-type"===e;return 1===g&&0===v?function(e){return!!e.parentNode}:function(e,t,n){var r,i,o,a,s,u,l=y!==m?"nextSibling":"previousSibling",c=e.parentNode,f=x&&e.nodeName.toLowerCase(),p=!n&&!x,d=!1;if(c){if(y){while(l){a=e;while(a=a[l])if(x?a.nodeName.toLowerCase()===f:1===a.nodeType)return!1;u=l="only"===h&&!u&&"nextSibling"}return!0}if(u=[m?c.firstChild:c.lastChild],m&&p){d=(s=(r=(i=(o=(a=c)[S]||(a[S]={}))[a.uniqueID]||(o[a.uniqueID]={}))[h]||[])[0]===k&&r[1])&&r[2],a=s&&c.childNodes[s];while(a=++s&&a&&a[l]||(d=s=0)||u.pop())if(1===a.nodeType&&++d&&a===e){i[h]=[k,s,d];break}}else if(p&&(d=s=(r=(i=(o=(a=e)[S]||(a[S]={}))[a.uniqueID]||(o[a.uniqueID]={}))[h]||[])[0]===k&&r[1]),!1===d)while(a=++s&&a&&a[l]||(d=s=0)||u.pop())if((x?a.nodeName.toLowerCase()===f:1===a.nodeType)&&++d&&(p&&((i=(o=a[S]||(a[S]={}))[a.uniqueID]||(o[a.uniqueID]={}))[h]=[k,d]),a===e))break;return(d-=v)===g||d%g==0&&0<=d/g}}},PSEUDO:function(e,o){var t,a=b.pseudos[e]||b.setFilters[e.toLowerCase()]||se.error("unsupported pseudo: "+e);return a[S]?a(o):1<a.length?(t=[e,e,"",o],b.setFilters.hasOwnProperty(e.toLowerCase())?le(function(e,t){var n,r=a(e,o),i=r.length;while(i--)e[n=P(e,r[i])]=!(t[n]=r[i])}):function(e){return a(e,0,t)}):a}},pseudos:{not:le(function(e){var r=[],i=[],s=f(e.replace($,"$1"));return s[S]?le(function(e,t,n,r){var i,o=s(e,null,r,[]),a=e.length;while(a--)(i=o[a])&&(e[a]=!(t[a]=i))}):function(e,t,n){return r[0]=e,s(r,null,n,i),r[0]=null,!i.pop()}}),has:le(function(t){return function(e){return 0<se(t,e).length}}),contains:le(function(t){return t=t.replace(te,ne),function(e){return-1<(e.textContent||o(e)).indexOf(t)}}),lang:le(function(n){return V.test(n||"")||se.error("unsupported lang: "+n),n=n.replace(te,ne).toLowerCase(),function(e){var t;do{if(t=E?e.lang:e.getAttribute("xml:lang")||e.getAttribute("lang"))return(t=t.toLowerCase())===n||0===t.indexOf(n+"-")}while((e=e.parentNode)&&1===e.nodeType);return!1}}),target:function(e){var t=n.location&&n.location.hash;return t&&t.slice(1)===e.id},root:function(e){return e===a},focus:function(e){return e===C.activeElement&&(!C.hasFocus||C.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:ge(!1),disabled:ge(!0),checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!b.pseudos.empty(e)},header:function(e){return J.test(e.nodeName)},input:function(e){return Q.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:ve(function(){return[0]}),last:ve(function(e,t){return[t-1]}),eq:ve(function(e,t,n){return[n<0?n+t:n]}),even:ve(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:ve(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:ve(function(e,t,n){for(var r=n<0?n+t:t<n?t:n;0<=--r;)e.push(r);return e}),gt:ve(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=b.pseudos.eq,{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})b.pseudos[e]=de(e);for(e in{submit:!0,reset:!0})b.pseudos[e]=he(e);function me(){}function xe(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function be(s,e,t){var u=e.dir,l=e.next,c=l||u,f=t&&"parentNode"===c,p=r++;return e.first?function(e,t,n){while(e=e[u])if(1===e.nodeType||f)return s(e,t,n);return!1}:function(e,t,n){var r,i,o,a=[k,p];if(n){while(e=e[u])if((1===e.nodeType||f)&&s(e,t,n))return!0}else while(e=e[u])if(1===e.nodeType||f)if(i=(o=e[S]||(e[S]={}))[e.uniqueID]||(o[e.uniqueID]={}),l&&l===e.nodeName.toLowerCase())e=e[u]||e;else{if((r=i[c])&&r[0]===k&&r[1]===p)return a[2]=r[2];if((i[c]=a)[2]=s(e,t,n))return!0}return!1}}function we(i){return 1<i.length?function(e,t,n){var r=i.length;while(r--)if(!i[r](e,t,n))return!1;return!0}:i[0]}function Te(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,l=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),l&&t.push(s)));return a}function Ce(d,h,g,v,y,e){return v&&!v[S]&&(v=Ce(v)),y&&!y[S]&&(y=Ce(y,e)),le(function(e,t,n,r){var i,o,a,s=[],u=[],l=t.length,c=e||function(e,t,n){for(var r=0,i=t.length;r<i;r++)se(e,t[r],n);return n}(h||"*",n.nodeType?[n]:n,[]),f=!d||!e&&h?c:Te(c,s,d,n,r),p=g?y||(e?d:l||v)?[]:t:f;if(g&&g(f,p,n,r),v){i=Te(p,u),v(i,[],n,r),o=i.length;while(o--)(a=i[o])&&(p[u[o]]=!(f[u[o]]=a))}if(e){if(y||d){if(y){i=[],o=p.length;while(o--)(a=p[o])&&i.push(f[o]=a);y(null,p=[],i,r)}o=p.length;while(o--)(a=p[o])&&-1<(i=y?P(e,a):s[o])&&(e[i]=!(t[i]=a))}}else p=Te(p===t?p.splice(l,p.length):p),y?y(null,t,p,r):H.apply(t,p)})}function Ee(e){for(var i,t,n,r=e.length,o=b.relative[e[0].type],a=o||b.relative[" "],s=o?1:0,u=be(function(e){return e===i},a,!0),l=be(function(e){return-1<P(i,e)},a,!0),c=[function(e,t,n){var r=!o&&(n||t!==w)||((i=t).nodeType?u(e,t,n):l(e,t,n));return i=null,r}];s<r;s++)if(t=b.relative[e[s].type])c=[be(we(c),t)];else{if((t=b.filter[e[s].type].apply(null,e[s].matches))[S]){for(n=++s;n<r;n++)if(b.relative[e[n].type])break;return Ce(1<s&&we(c),1<s&&xe(e.slice(0,s-1).concat({value:" "===e[s-2].type?"*":""})).replace($,"$1"),t,s<n&&Ee(e.slice(s,n)),n<r&&Ee(e=e.slice(n)),n<r&&xe(e))}c.push(t)}return we(c)}return me.prototype=b.filters=b.pseudos,b.setFilters=new me,h=se.tokenize=function(e,t){var n,r,i,o,a,s,u,l=x[e+" "];if(l)return t?0:l.slice(0);a=e,s=[],u=b.preFilter;while(a){for(o in n&&!(r=_.exec(a))||(r&&(a=a.slice(r[0].length)||a),s.push(i=[])),n=!1,(r=z.exec(a))&&(n=r.shift(),i.push({value:n,type:r[0].replace($," ")}),a=a.slice(n.length)),b.filter)!(r=G[o].exec(a))||u[o]&&!(r=u[o](r))||(n=r.shift(),i.push({value:n,type:o,matches:r}),a=a.slice(n.length));if(!n)break}return t?a.length:a?se.error(e):x(e,s).slice(0)},f=se.compile=function(e,t){var n,v,y,m,x,r,i=[],o=[],a=A[e+" "];if(!a){t||(t=h(e)),n=t.length;while(n--)(a=Ee(t[n]))[S]?i.push(a):o.push(a);(a=A(e,(v=o,m=0<(y=i).length,x=0<v.length,r=function(e,t,n,r,i){var o,a,s,u=0,l="0",c=e&&[],f=[],p=w,d=e||x&&b.find.TAG("*",i),h=k+=null==p?1:Math.random()||.1,g=d.length;for(i&&(w=t==C||t||i);l!==g&&null!=(o=d[l]);l++){if(x&&o){a=0,t||o.ownerDocument==C||(T(o),n=!E);while(s=v[a++])if(s(o,t||C,n)){r.push(o);break}i&&(k=h)}m&&((o=!s&&o)&&u--,e&&c.push(o))}if(u+=l,m&&l!==u){a=0;while(s=y[a++])s(c,f,t,n);if(e){if(0<u)while(l--)c[l]||f[l]||(f[l]=q.call(r));f=Te(f)}H.apply(r,f),i&&!e&&0<f.length&&1<u+y.length&&se.uniqueSort(r)}return i&&(k=h,w=p),c},m?le(r):r))).selector=e}return a},g=se.select=function(e,t,n,r){var i,o,a,s,u,l="function"==typeof e&&e,c=!r&&h(e=l.selector||e);if(n=n||[],1===c.length){if(2<(o=c[0]=c[0].slice(0)).length&&"ID"===(a=o[0]).type&&9===t.nodeType&&E&&b.relative[o[1].type]){if(!(t=(b.find.ID(a.matches[0].replace(te,ne),t)||[])[0]))return n;l&&(t=t.parentNode),e=e.slice(o.shift().value.length)}i=G.needsContext.test(e)?0:o.length;while(i--){if(a=o[i],b.relative[s=a.type])break;if((u=b.find[s])&&(r=u(a.matches[0].replace(te,ne),ee.test(o[0].type)&&ye(t.parentNode)||t))){if(o.splice(i,1),!(e=r.length&&xe(o)))return H.apply(n,r),n;break}}}return(l||f(e,c))(r,t,!E,n,!t||ee.test(e)&&ye(t.parentNode)||t),n},d.sortStable=S.split("").sort(D).join("")===S,d.detectDuplicates=!!l,T(),d.sortDetached=ce(function(e){return 1&e.compareDocumentPosition(C.createElement("fieldset"))}),ce(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||fe("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),d.attributes&&ce(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||fe("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),ce(function(e){return null==e.getAttribute("disabled")})||fe(R,function(e,t,n){var r;if(!n)return!0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null}),se}(C);S.find=d,S.expr=d.selectors,S.expr[":"]=S.expr.pseudos,S.uniqueSort=S.unique=d.uniqueSort,S.text=d.getText,S.isXMLDoc=d.isXML,S.contains=d.contains,S.escapeSelector=d.escape;var h=function(e,t,n){var r=[],i=void 0!==n;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&S(e).is(n))break;r.push(e)}return r},T=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},k=S.expr.match.needsContext;function A(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}var N=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function D(e,n,r){return m(n)?S.grep(e,function(e,t){return!!n.call(e,t,e)!==r}):n.nodeType?S.grep(e,function(e){return e===n!==r}):"string"!=typeof n?S.grep(e,function(e){return-1<i.call(n,e)!==r}):S.filter(n,e,r)}S.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?S.find.matchesSelector(r,e)?[r]:[]:S.find.matches(e,S.grep(t,function(e){return 1===e.nodeType}))},S.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(S(e).filter(function(){for(t=0;t<r;t++)if(S.contains(i[t],this))return!0}));for(n=this.pushStack([]),t=0;t<r;t++)S.find(e,i[t],n);return 1<r?S.uniqueSort(n):n},filter:function(e){return this.pushStack(D(this,e||[],!1))},not:function(e){return this.pushStack(D(this,e||[],!0))},is:function(e){return!!D(this,"string"==typeof e&&k.test(e)?S(e):e||[],!1).length}});var j,q=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(S.fn.init=function(e,t,n){var r,i;if(!e)return this;if(n=n||j,"string"==typeof e){if(!(r="<"===e[0]&&">"===e[e.length-1]&&3<=e.length?[null,e,null]:q.exec(e))||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof S?t[0]:t,S.merge(this,S.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:E,!0)),N.test(r[1])&&S.isPlainObject(t))for(r in t)m(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return(i=E.getElementById(r[2]))&&(this[0]=i,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):m(e)?void 0!==n.ready?n.ready(e):e(S):S.makeArray(e,this)}).prototype=S.fn,j=S(E);var L=/^(?:parents|prev(?:Until|All))/,H={children:!0,contents:!0,next:!0,prev:!0};function O(e,t){while((e=e[t])&&1!==e.nodeType);return e}S.fn.extend({has:function(e){var t=S(e,this),n=t.length;return this.filter(function(){for(var e=0;e<n;e++)if(S.contains(this,t[e]))return!0})},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&S(e);if(!k.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?-1<a.index(n):1===n.nodeType&&S.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(1<o.length?S.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?i.call(S(e),this[0]):i.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(S.uniqueSort(S.merge(this.get(),S(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}}),S.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return h(e,"parentNode")},parentsUntil:function(e,t,n){return h(e,"parentNode",n)},next:function(e){return O(e,"nextSibling")},prev:function(e){return O(e,"previousSibling")},nextAll:function(e){return h(e,"nextSibling")},prevAll:function(e){return h(e,"previousSibling")},nextUntil:function(e,t,n){return h(e,"nextSibling",n)},prevUntil:function(e,t,n){return h(e,"previousSibling",n)},siblings:function(e){return T((e.parentNode||{}).firstChild,e)},children:function(e){return T(e.firstChild)},contents:function(e){return null!=e.contentDocument&&r(e.contentDocument)?e.contentDocument:(A(e,"template")&&(e=e.content||e),S.merge([],e.childNodes))}},function(r,i){S.fn[r]=function(e,t){var n=S.map(this,i,e);return"Until"!==r.slice(-5)&&(t=e),t&&"string"==typeof t&&(n=S.filter(t,n)),1<this.length&&(H[r]||S.uniqueSort(n),L.test(r)&&n.reverse()),this.pushStack(n)}});var P=/[^\x20\t\r\n\f]+/g;function R(e){return e}function M(e){throw e}function I(e,t,n,r){var i;try{e&&m(i=e.promise)?i.call(e).done(t).fail(n):e&&m(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}S.Callbacks=function(r){var e,n;r="string"==typeof r?(e=r,n={},S.each(e.match(P)||[],function(e,t){n[t]=!0}),n):S.extend({},r);var i,t,o,a,s=[],u=[],l=-1,c=function(){for(a=a||r.once,o=i=!0;u.length;l=-1){t=u.shift();while(++l<s.length)!1===s[l].apply(t[0],t[1])&&r.stopOnFalse&&(l=s.length,t=!1)}r.memory||(t=!1),i=!1,a&&(s=t?[]:"")},f={add:function(){return s&&(t&&!i&&(l=s.length-1,u.push(t)),function n(e){S.each(e,function(e,t){m(t)?r.unique&&f.has(t)||s.push(t):t&&t.length&&"string"!==w(t)&&n(t)})}(arguments),t&&!i&&c()),this},remove:function(){return S.each(arguments,function(e,t){var n;while(-1<(n=S.inArray(t,s,n)))s.splice(n,1),n<=l&&l--}),this},has:function(e){return e?-1<S.inArray(e,s):0<s.length},empty:function(){return s&&(s=[]),this},disable:function(){return a=u=[],s=t="",this},disabled:function(){return!s},lock:function(){return a=u=[],t||i||(s=t=""),this},locked:function(){return!!a},fireWith:function(e,t){return a||(t=[e,(t=t||[]).slice?t.slice():t],u.push(t),i||c()),this},fire:function(){return f.fireWith(this,arguments),this},fired:function(){return!!o}};return f},S.extend({Deferred:function(e){var o=[["notify","progress",S.Callbacks("memory"),S.Callbacks("memory"),2],["resolve","done",S.Callbacks("once memory"),S.Callbacks("once memory"),0,"resolved"],["reject","fail",S.Callbacks("once memory"),S.Callbacks("once memory"),1,"rejected"]],i="pending",a={state:function(){return i},always:function(){return s.done(arguments).fail(arguments),this},"catch":function(e){return a.then(null,e)},pipe:function(){var i=arguments;return S.Deferred(function(r){S.each(o,function(e,t){var n=m(i[t[4]])&&i[t[4]];s[t[1]](function(){var e=n&&n.apply(this,arguments);e&&m(e.promise)?e.promise().progress(r.notify).done(r.resolve).fail(r.reject):r[t[0]+"With"](this,n?[e]:arguments)})}),i=null}).promise()},then:function(t,n,r){var u=0;function l(i,o,a,s){return function(){var n=this,r=arguments,e=function(){var e,t;if(!(i<u)){if((e=a.apply(n,r))===o.promise())throw new TypeError("Thenable self-resolution");t=e&&("object"==typeof e||"function"==typeof e)&&e.then,m(t)?s?t.call(e,l(u,o,R,s),l(u,o,M,s)):(u++,t.call(e,l(u,o,R,s),l(u,o,M,s),l(u,o,R,o.notifyWith))):(a!==R&&(n=void 0,r=[e]),(s||o.resolveWith)(n,r))}},t=s?e:function(){try{e()}catch(e){S.Deferred.exceptionHook&&S.Deferred.exceptionHook(e,t.stackTrace),u<=i+1&&(a!==M&&(n=void 0,r=[e]),o.rejectWith(n,r))}};i?t():(S.Deferred.getStackHook&&(t.stackTrace=S.Deferred.getStackHook()),C.setTimeout(t))}}return S.Deferred(function(e){o[0][3].add(l(0,e,m(r)?r:R,e.notifyWith)),o[1][3].add(l(0,e,m(t)?t:R)),o[2][3].add(l(0,e,m(n)?n:M))}).promise()},promise:function(e){return null!=e?S.extend(e,a):a}},s={};return S.each(o,function(e,t){var n=t[2],r=t[5];a[t[1]]=n.add,r&&n.add(function(){i=r},o[3-e][2].disable,o[3-e][3].disable,o[0][2].lock,o[0][3].lock),n.add(t[3].fire),s[t[0]]=function(){return s[t[0]+"With"](this===s?void 0:this,arguments),this},s[t[0]+"With"]=n.fireWith}),a.promise(s),e&&e.call(s,s),s},when:function(e){var n=arguments.length,t=n,r=Array(t),i=s.call(arguments),o=S.Deferred(),a=function(t){return function(e){r[t]=this,i[t]=1<arguments.length?s.call(arguments):e,--n||o.resolveWith(r,i)}};if(n<=1&&(I(e,o.done(a(t)).resolve,o.reject,!n),"pending"===o.state()||m(i[t]&&i[t].then)))return o.then();while(t--)I(i[t],a(t),o.reject);return o.promise()}});var W=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;S.Deferred.exceptionHook=function(e,t){C.console&&C.console.warn&&e&&W.test(e.name)&&C.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},S.readyException=function(e){C.setTimeout(function(){throw e})};var F=S.Deferred();function B(){E.removeEventListener("DOMContentLoaded",B),C.removeEventListener("load",B),S.ready()}S.fn.ready=function(e){return F.then(e)["catch"](function(e){S.readyException(e)}),this},S.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--S.readyWait:S.isReady)||(S.isReady=!0)!==e&&0<--S.readyWait||F.resolveWith(E,[S])}}),S.ready.then=F.then,"complete"===E.readyState||"loading"!==E.readyState&&!E.documentElement.doScroll?C.setTimeout(S.ready):(E.addEventListener("DOMContentLoaded",B),C.addEventListener("load",B));var $=function(e,t,n,r,i,o,a){var s=0,u=e.length,l=null==n;if("object"===w(n))for(s in i=!0,n)$(e,t,s,n[s],!0,o,a);else if(void 0!==r&&(i=!0,m(r)||(a=!0),l&&(a?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(S(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:l?t.call(e):u?t(e[0],n):o},_=/^-ms-/,z=/-([a-z])/g;function U(e,t){return t.toUpperCase()}function X(e){return e.replace(_,"ms-").replace(z,U)}var V=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function G(){this.expando=S.expando+G.uid++}G.uid=1,G.prototype={cache:function(e){var t=e[this.expando];return t||(t={},V(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[X(t)]=n;else for(r in t)i[X(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][X(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(X):(t=X(t))in r?[t]:t.match(P)||[]).length;while(n--)delete r[t[n]]}(void 0===t||S.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!S.isEmptyObject(t)}};var Y=new G,Q=new G,J=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,K=/[A-Z]/g;function Z(e,t,n){var r,i;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(K,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n="true"===(i=n)||"false"!==i&&("null"===i?null:i===+i+""?+i:J.test(i)?JSON.parse(i):i)}catch(e){}Q.set(e,t,n)}else n=void 0;return n}S.extend({hasData:function(e){return Q.hasData(e)||Y.hasData(e)},data:function(e,t,n){return Q.access(e,t,n)},removeData:function(e,t){Q.remove(e,t)},_data:function(e,t,n){return Y.access(e,t,n)},_removeData:function(e,t){Y.remove(e,t)}}),S.fn.extend({data:function(n,e){var t,r,i,o=this[0],a=o&&o.attributes;if(void 0===n){if(this.length&&(i=Q.get(o),1===o.nodeType&&!Y.get(o,"hasDataAttrs"))){t=a.length;while(t--)a[t]&&0===(r=a[t].name).indexOf("data-")&&(r=X(r.slice(5)),Z(o,r,i[r]));Y.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof n?this.each(function(){Q.set(this,n)}):$(this,function(e){var t;if(o&&void 0===e)return void 0!==(t=Q.get(o,n))?t:void 0!==(t=Z(o,n))?t:void 0;this.each(function(){Q.set(this,n,e)})},null,e,1<arguments.length,null,!0)},removeData:function(e){return this.each(function(){Q.remove(this,e)})}}),S.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=Y.get(e,t),n&&(!r||Array.isArray(n)?r=Y.access(e,t,S.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=S.queue(e,t),r=n.length,i=n.shift(),o=S._queueHooks(e,t);"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,function(){S.dequeue(e,t)},o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return Y.get(e,n)||Y.access(e,n,{empty:S.Callbacks("once memory").add(function(){Y.remove(e,[t+"queue",n])})})}}),S.fn.extend({queue:function(t,n){var e=2;return"string"!=typeof t&&(n=t,t="fx",e--),arguments.length<e?S.queue(this[0],t):void 0===n?this:this.each(function(){var e=S.queue(this,t,n);S._queueHooks(this,t),"fx"===t&&"inprogress"!==e[0]&&S.dequeue(this,t)})},dequeue:function(e){return this.each(function(){S.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=S.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=void 0),e=e||"fx";while(a--)(n=Y.get(o[a],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var ee=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,te=new RegExp("^(?:([+-])=|)("+ee+")([a-z%]*)$","i"),ne=["Top","Right","Bottom","Left"],re=E.documentElement,ie=function(e){return S.contains(e.ownerDocument,e)},oe={composed:!0};re.getRootNode&&(ie=function(e){return S.contains(e.ownerDocument,e)||e.getRootNode(oe)===e.ownerDocument});var ae=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&ie(e)&&"none"===S.css(e,"display")};function se(e,t,n,r){var i,o,a=20,s=r?function(){return r.cur()}:function(){return S.css(e,t,"")},u=s(),l=n&&n[3]||(S.cssNumber[t]?"":"px"),c=e.nodeType&&(S.cssNumber[t]||"px"!==l&&+u)&&te.exec(S.css(e,t));if(c&&c[3]!==l){u/=2,l=l||c[3],c=+u||1;while(a--)S.style(e,t,c+l),(1-o)*(1-(o=s()/u||.5))<=0&&(a=0),c/=o;c*=2,S.style(e,t,c+l),n=n||[]}return n&&(c=+c||+u||0,i=n[1]?c+(n[1]+1)*n[2]:+n[2],r&&(r.unit=l,r.start=c,r.end=i)),i}var ue={};function le(e,t){for(var n,r,i,o,a,s,u,l=[],c=0,f=e.length;c<f;c++)(r=e[c]).style&&(n=r.style.display,t?("none"===n&&(l[c]=Y.get(r,"display")||null,l[c]||(r.style.display="")),""===r.style.display&&ae(r)&&(l[c]=(u=a=o=void 0,a=(i=r).ownerDocument,s=i.nodeName,(u=ue[s])||(o=a.body.appendChild(a.createElement(s)),u=S.css(o,"display"),o.parentNode.removeChild(o),"none"===u&&(u="block"),ue[s]=u)))):"none"!==n&&(l[c]="none",Y.set(r,"display",n)));for(c=0;c<f;c++)null!=l[c]&&(e[c].style.display=l[c]);return e}S.fn.extend({show:function(){return le(this,!0)},hide:function(){return le(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){ae(this)?S(this).show():S(this).hide()})}});var ce,fe,pe=/^(?:checkbox|radio)$/i,de=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i,he=/^$|^module$|\/(?:java|ecma)script/i;ce=E.createDocumentFragment().appendChild(E.createElement("div")),(fe=E.createElement("input")).setAttribute("type","radio"),fe.setAttribute("checked","checked"),fe.setAttribute("name","t"),ce.appendChild(fe),y.checkClone=ce.cloneNode(!0).cloneNode(!0).lastChild.checked,ce.innerHTML="<textarea>x</textarea>",y.noCloneChecked=!!ce.cloneNode(!0).lastChild.defaultValue,ce.innerHTML="<option></option>",y.option=!!ce.lastChild;var ge={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};function ve(e,t){var n;return n="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&A(e,t)?S.merge([e],n):n}function ye(e,t){for(var n=0,r=e.length;n<r;n++)Y.set(e[n],"globalEval",!t||Y.get(t[n],"globalEval"))}ge.tbody=ge.tfoot=ge.colgroup=ge.caption=ge.thead,ge.th=ge.td,y.option||(ge.optgroup=ge.option=[1,"<select multiple='multiple'>","</select>"]);var me=/<|&#?\w+;/;function xe(e,t,n,r,i){for(var o,a,s,u,l,c,f=t.createDocumentFragment(),p=[],d=0,h=e.length;d<h;d++)if((o=e[d])||0===o)if("object"===w(o))S.merge(p,o.nodeType?[o]:o);else if(me.test(o)){a=a||f.appendChild(t.createElement("div")),s=(de.exec(o)||["",""])[1].toLowerCase(),u=ge[s]||ge._default,a.innerHTML=u[1]+S.htmlPrefilter(o)+u[2],c=u[0];while(c--)a=a.lastChild;S.merge(p,a.childNodes),(a=f.firstChild).textContent=""}else p.push(t.createTextNode(o));f.textContent="",d=0;while(o=p[d++])if(r&&-1<S.inArray(o,r))i&&i.push(o);else if(l=ie(o),a=ve(f.appendChild(o),"script"),l&&ye(a),n){c=0;while(o=a[c++])he.test(o.type||"")&&n.push(o)}return f}var be=/^key/,we=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,Te=/^([^.]*)(?:\.(.+)|)/;function Ce(){return!0}function Ee(){return!1}function Se(e,t){return e===function(){try{return E.activeElement}catch(e){}}()==("focus"===t)}function ke(e,t,n,r,i,o){var a,s;if("object"==typeof t){for(s in"string"!=typeof n&&(r=r||n,n=void 0),t)ke(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=Ee;else if(!i)return e;return 1===o&&(a=i,(i=function(e){return S().off(e),a.apply(this,arguments)}).guid=a.guid||(a.guid=S.guid++)),e.each(function(){S.event.add(this,t,i,r,n)})}function Ae(e,i,o){o?(Y.set(e,i,!1),S.event.add(e,i,{namespace:!1,handler:function(e){var t,n,r=Y.get(this,i);if(1&e.isTrigger&&this[i]){if(r.length)(S.event.special[i]||{}).delegateType&&e.stopPropagation();else if(r=s.call(arguments),Y.set(this,i,r),t=o(this,i),this[i](),r!==(n=Y.get(this,i))||t?Y.set(this,i,!1):n={},r!==n)return e.stopImmediatePropagation(),e.preventDefault(),n.value}else r.length&&(Y.set(this,i,{value:S.event.trigger(S.extend(r[0],S.Event.prototype),r.slice(1),this)}),e.stopImmediatePropagation())}})):void 0===Y.get(e,i)&&S.event.add(e,i,Ce)}S.event={global:{},add:function(t,e,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=Y.get(t);if(V(t)){n.handler&&(n=(o=n).handler,i=o.selector),i&&S.find.matchesSelector(re,i),n.guid||(n.guid=S.guid++),(u=v.events)||(u=v.events=Object.create(null)),(a=v.handle)||(a=v.handle=function(e){return"undefined"!=typeof S&&S.event.triggered!==e.type?S.event.dispatch.apply(t,arguments):void 0}),l=(e=(e||"").match(P)||[""]).length;while(l--)d=g=(s=Te.exec(e[l])||[])[1],h=(s[2]||"").split(".").sort(),d&&(f=S.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=S.event.special[d]||{},c=S.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&S.expr.match.needsContext.test(i),namespace:h.join(".")},o),(p=u[d])||((p=u[d]=[]).delegateCount=0,f.setup&&!1!==f.setup.call(t,r,h,a)||t.addEventListener&&t.addEventListener(d,a)),f.add&&(f.add.call(t,c),c.handler.guid||(c.handler.guid=n.guid)),i?p.splice(p.delegateCount++,0,c):p.push(c),S.event.global[d]=!0)}},remove:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=Y.hasData(e)&&Y.get(e);if(v&&(u=v.events)){l=(t=(t||"").match(P)||[""]).length;while(l--)if(d=g=(s=Te.exec(t[l])||[])[1],h=(s[2]||"").split(".").sort(),d){f=S.event.special[d]||{},p=u[d=(r?f.delegateType:f.bindType)||d]||[],s=s[2]&&new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||s&&!s.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));a&&!p.length&&(f.teardown&&!1!==f.teardown.call(e,h,v.handle)||S.removeEvent(e,d,v.handle),delete u[d])}else for(d in u)S.event.remove(e,d+t[l],n,r,!0);S.isEmptyObject(u)&&Y.remove(e,"handle events")}},dispatch:function(e){var t,n,r,i,o,a,s=new Array(arguments.length),u=S.event.fix(e),l=(Y.get(this,"events")||Object.create(null))[u.type]||[],c=S.event.special[u.type]||{};for(s[0]=u,t=1;t<arguments.length;t++)s[t]=arguments[t];if(u.delegateTarget=this,!c.preDispatch||!1!==c.preDispatch.call(this,u)){a=S.event.handlers.call(this,u,l),t=0;while((i=a[t++])&&!u.isPropagationStopped()){u.currentTarget=i.elem,n=0;while((o=i.handlers[n++])&&!u.isImmediatePropagationStopped())u.rnamespace&&!1!==o.namespace&&!u.rnamespace.test(o.namespace)||(u.handleObj=o,u.data=o.data,void 0!==(r=((S.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,s))&&!1===(u.result=r)&&(u.preventDefault(),u.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,u),u.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,l=e.target;if(u&&l.nodeType&&!("click"===e.type&&1<=e.button))for(;l!==this;l=l.parentNode||this)if(1===l.nodeType&&("click"!==e.type||!0!==l.disabled)){for(o=[],a={},n=0;n<u;n++)void 0===a[i=(r=t[n]).selector+" "]&&(a[i]=r.needsContext?-1<S(i,this).index(l):S.find(i,this,null,[l]).length),a[i]&&o.push(r);o.length&&s.push({elem:l,handlers:o})}return l=this,u<t.length&&s.push({elem:l,handlers:t.slice(u)}),s},addProp:function(t,e){Object.defineProperty(S.Event.prototype,t,{enumerable:!0,configurable:!0,get:m(e)?function(){if(this.originalEvent)return e(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[t]},set:function(e){Object.defineProperty(this,t,{enumerable:!0,configurable:!0,writable:!0,value:e})}})},fix:function(e){return e[S.expando]?e:new S.Event(e)},special:{load:{noBubble:!0},click:{setup:function(e){var t=this||e;return pe.test(t.type)&&t.click&&A(t,"input")&&Ae(t,"click",Ce),!1},trigger:function(e){var t=this||e;return pe.test(t.type)&&t.click&&A(t,"input")&&Ae(t,"click"),!0},_default:function(e){var t=e.target;return pe.test(t.type)&&t.click&&A(t,"input")&&Y.get(t,"click")||A(t,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},S.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},S.Event=function(e,t){if(!(this instanceof S.Event))return new S.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Ce:Ee,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&S.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[S.expando]=!0},S.Event.prototype={constructor:S.Event,isDefaultPrevented:Ee,isPropagationStopped:Ee,isImmediatePropagationStopped:Ee,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Ce,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Ce,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Ce,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},S.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:function(e){var t=e.button;return null==e.which&&be.test(e.type)?null!=e.charCode?e.charCode:e.keyCode:!e.which&&void 0!==t&&we.test(e.type)?1&t?1:2&t?3:4&t?2:0:e.which}},S.event.addProp),S.each({focus:"focusin",blur:"focusout"},function(e,t){S.event.special[e]={setup:function(){return Ae(this,e,Se),!1},trigger:function(){return Ae(this,e),!0},delegateType:t}}),S.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,i){S.event.special[e]={delegateType:i,bindType:i,handle:function(e){var t,n=e.relatedTarget,r=e.handleObj;return n&&(n===this||S.contains(this,n))||(e.type=r.origType,t=r.handler.apply(this,arguments),e.type=i),t}}}),S.fn.extend({on:function(e,t,n,r){return ke(this,e,t,n,r)},one:function(e,t,n,r){return ke(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,S(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=Ee),this.each(function(){S.event.remove(this,e,n,t)})}});var Ne=/<script|<style|<link/i,De=/checked\s*(?:[^=]|=\s*.checked.)/i,je=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function qe(e,t){return A(e,"table")&&A(11!==t.nodeType?t:t.firstChild,"tr")&&S(e).children("tbody")[0]||e}function Le(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function He(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Oe(e,t){var n,r,i,o,a,s;if(1===t.nodeType){if(Y.hasData(e)&&(s=Y.get(e).events))for(i in Y.remove(t,"handle events"),s)for(n=0,r=s[i].length;n<r;n++)S.event.add(t,i,s[i][n]);Q.hasData(e)&&(o=Q.access(e),a=S.extend({},o),Q.set(t,a))}}function Pe(n,r,i,o){r=g(r);var e,t,a,s,u,l,c=0,f=n.length,p=f-1,d=r[0],h=m(d);if(h||1<f&&"string"==typeof d&&!y.checkClone&&De.test(d))return n.each(function(e){var t=n.eq(e);h&&(r[0]=d.call(this,e,t.html())),Pe(t,r,i,o)});if(f&&(t=(e=xe(r,n[0].ownerDocument,!1,n,o)).firstChild,1===e.childNodes.length&&(e=t),t||o)){for(s=(a=S.map(ve(e,"script"),Le)).length;c<f;c++)u=e,c!==p&&(u=S.clone(u,!0,!0),s&&S.merge(a,ve(u,"script"))),i.call(n[c],u,c);if(s)for(l=a[a.length-1].ownerDocument,S.map(a,He),c=0;c<s;c++)u=a[c],he.test(u.type||"")&&!Y.access(u,"globalEval")&&S.contains(l,u)&&(u.src&&"module"!==(u.type||"").toLowerCase()?S._evalUrl&&!u.noModule&&S._evalUrl(u.src,{nonce:u.nonce||u.getAttribute("nonce")},l):b(u.textContent.replace(je,""),u,l))}return n}function Re(e,t,n){for(var r,i=t?S.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||S.cleanData(ve(r)),r.parentNode&&(n&&ie(r)&&ye(ve(r,"script")),r.parentNode.removeChild(r));return e}S.extend({htmlPrefilter:function(e){return e},clone:function(e,t,n){var r,i,o,a,s,u,l,c=e.cloneNode(!0),f=ie(e);if(!(y.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||S.isXMLDoc(e)))for(a=ve(c),r=0,i=(o=ve(e)).length;r<i;r++)s=o[r],u=a[r],void 0,"input"===(l=u.nodeName.toLowerCase())&&pe.test(s.type)?u.checked=s.checked:"input"!==l&&"textarea"!==l||(u.defaultValue=s.defaultValue);if(t)if(n)for(o=o||ve(e),a=a||ve(c),r=0,i=o.length;r<i;r++)Oe(o[r],a[r]);else Oe(e,c);return 0<(a=ve(c,"script")).length&&ye(a,!f&&ve(e,"script")),c},cleanData:function(e){for(var t,n,r,i=S.event.special,o=0;void 0!==(n=e[o]);o++)if(V(n)){if(t=n[Y.expando]){if(t.events)for(r in t.events)i[r]?S.event.remove(n,r):S.removeEvent(n,r,t.handle);n[Y.expando]=void 0}n[Q.expando]&&(n[Q.expando]=void 0)}}}),S.fn.extend({detach:function(e){return Re(this,e,!0)},remove:function(e){return Re(this,e)},text:function(e){return $(this,function(e){return void 0===e?S.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return Pe(this,arguments,function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||qe(this,e).appendChild(e)})},prepend:function(){return Pe(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=qe(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return Pe(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return Pe(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(S.cleanData(ve(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map(function(){return S.clone(this,e,t)})},html:function(e){return $(this,function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Ne.test(e)&&!ge[(de.exec(e)||["",""])[1].toLowerCase()]){e=S.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(S.cleanData(ve(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var n=[];return Pe(this,arguments,function(e){var t=this.parentNode;S.inArray(this,n)<0&&(S.cleanData(ve(this)),t&&t.replaceChild(e,this))},n)}}),S.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,a){S.fn[e]=function(e){for(var t,n=[],r=S(e),i=r.length-1,o=0;o<=i;o++)t=o===i?this:this.clone(!0),S(r[o])[a](t),u.apply(n,t.get());return this.pushStack(n)}});var Me=new RegExp("^("+ee+")(?!px)[a-z%]+$","i"),Ie=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=C),t.getComputedStyle(e)},We=function(e,t,n){var r,i,o={};for(i in t)o[i]=e.style[i],e.style[i]=t[i];for(i in r=n.call(e),t)e.style[i]=o[i];return r},Fe=new RegExp(ne.join("|"),"i");function Be(e,t,n){var r,i,o,a,s=e.style;return(n=n||Ie(e))&&(""!==(a=n.getPropertyValue(t)||n[t])||ie(e)||(a=S.style(e,t)),!y.pixelBoxStyles()&&Me.test(a)&&Fe.test(t)&&(r=s.width,i=s.minWidth,o=s.maxWidth,s.minWidth=s.maxWidth=s.width=a,a=n.width,s.width=r,s.minWidth=i,s.maxWidth=o)),void 0!==a?a+"":a}function $e(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}!function(){function e(){if(l){u.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",l.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",re.appendChild(u).appendChild(l);var e=C.getComputedStyle(l);n="1%"!==e.top,s=12===t(e.marginLeft),l.style.right="60%",o=36===t(e.right),r=36===t(e.width),l.style.position="absolute",i=12===t(l.offsetWidth/3),re.removeChild(u),l=null}}function t(e){return Math.round(parseFloat(e))}var n,r,i,o,a,s,u=E.createElement("div"),l=E.createElement("div");l.style&&(l.style.backgroundClip="content-box",l.cloneNode(!0).style.backgroundClip="",y.clearCloneStyle="content-box"===l.style.backgroundClip,S.extend(y,{boxSizingReliable:function(){return e(),r},pixelBoxStyles:function(){return e(),o},pixelPosition:function(){return e(),n},reliableMarginLeft:function(){return e(),s},scrollboxSize:function(){return e(),i},reliableTrDimensions:function(){var e,t,n,r;return null==a&&(e=E.createElement("table"),t=E.createElement("tr"),n=E.createElement("div"),e.style.cssText="position:absolute;left:-11111px",t.style.height="1px",n.style.height="9px",re.appendChild(e).appendChild(t).appendChild(n),r=C.getComputedStyle(t),a=3<parseInt(r.height),re.removeChild(e)),a}}))}();var _e=["Webkit","Moz","ms"],ze=E.createElement("div").style,Ue={};function Xe(e){var t=S.cssProps[e]||Ue[e];return t||(e in ze?e:Ue[e]=function(e){var t=e[0].toUpperCase()+e.slice(1),n=_e.length;while(n--)if((e=_e[n]+t)in ze)return e}(e)||e)}var Ve=/^(none|table(?!-c[ea]).+)/,Ge=/^--/,Ye={position:"absolute",visibility:"hidden",display:"block"},Qe={letterSpacing:"0",fontWeight:"400"};function Je(e,t,n){var r=te.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function Ke(e,t,n,r,i,o){var a="width"===t?1:0,s=0,u=0;if(n===(r?"border":"content"))return 0;for(;a<4;a+=2)"margin"===n&&(u+=S.css(e,n+ne[a],!0,i)),r?("content"===n&&(u-=S.css(e,"padding"+ne[a],!0,i)),"margin"!==n&&(u-=S.css(e,"border"+ne[a]+"Width",!0,i))):(u+=S.css(e,"padding"+ne[a],!0,i),"padding"!==n?u+=S.css(e,"border"+ne[a]+"Width",!0,i):s+=S.css(e,"border"+ne[a]+"Width",!0,i));return!r&&0<=o&&(u+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-u-s-.5))||0),u}function Ze(e,t,n){var r=Ie(e),i=(!y.boxSizingReliable()||n)&&"border-box"===S.css(e,"boxSizing",!1,r),o=i,a=Be(e,t,r),s="offset"+t[0].toUpperCase()+t.slice(1);if(Me.test(a)){if(!n)return a;a="auto"}return(!y.boxSizingReliable()&&i||!y.reliableTrDimensions()&&A(e,"tr")||"auto"===a||!parseFloat(a)&&"inline"===S.css(e,"display",!1,r))&&e.getClientRects().length&&(i="border-box"===S.css(e,"boxSizing",!1,r),(o=s in e)&&(a=e[s])),(a=parseFloat(a)||0)+Ke(e,t,n||(i?"border":"content"),o,r,a)+"px"}function et(e,t,n,r,i){return new et.prototype.init(e,t,n,r,i)}S.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Be(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=X(t),u=Ge.test(t),l=e.style;if(u||(t=Xe(s)),a=S.cssHooks[t]||S.cssHooks[s],void 0===n)return a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:l[t];"string"===(o=typeof n)&&(i=te.exec(n))&&i[1]&&(n=se(e,t,i),o="number"),null!=n&&n==n&&("number"!==o||u||(n+=i&&i[3]||(S.cssNumber[s]?"":"px")),y.clearCloneStyle||""!==n||0!==t.indexOf("background")||(l[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?l.setProperty(t,n):l[t]=n))}},css:function(e,t,n,r){var i,o,a,s=X(t);return Ge.test(t)||(t=Xe(s)),(a=S.cssHooks[t]||S.cssHooks[s])&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=Be(e,t,r)),"normal"===i&&t in Qe&&(i=Qe[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),S.each(["height","width"],function(e,u){S.cssHooks[u]={get:function(e,t,n){if(t)return!Ve.test(S.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?Ze(e,u,n):We(e,Ye,function(){return Ze(e,u,n)})},set:function(e,t,n){var r,i=Ie(e),o=!y.scrollboxSize()&&"absolute"===i.position,a=(o||n)&&"border-box"===S.css(e,"boxSizing",!1,i),s=n?Ke(e,u,n,a,i):0;return a&&o&&(s-=Math.ceil(e["offset"+u[0].toUpperCase()+u.slice(1)]-parseFloat(i[u])-Ke(e,u,"border",!1,i)-.5)),s&&(r=te.exec(t))&&"px"!==(r[3]||"px")&&(e.style[u]=t,t=S.css(e,u)),Je(0,t,s)}}}),S.cssHooks.marginLeft=$e(y.reliableMarginLeft,function(e,t){if(t)return(parseFloat(Be(e,"marginLeft"))||e.getBoundingClientRect().left-We(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),S.each({margin:"",padding:"",border:"Width"},function(i,o){S.cssHooks[i+o]={expand:function(e){for(var t=0,n={},r="string"==typeof e?e.split(" "):[e];t<4;t++)n[i+ne[t]+o]=r[t]||r[t-2]||r[0];return n}},"margin"!==i&&(S.cssHooks[i+o].set=Je)}),S.fn.extend({css:function(e,t){return $(this,function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=Ie(e),i=t.length;a<i;a++)o[t[a]]=S.css(e,t[a],!1,r);return o}return void 0!==n?S.style(e,t,n):S.css(e,t)},e,t,1<arguments.length)}}),((S.Tween=et).prototype={constructor:et,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||S.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(S.cssNumber[n]?"":"px")},cur:function(){var e=et.propHooks[this.prop];return e&&e.get?e.get(this):et.propHooks._default.get(this)},run:function(e){var t,n=et.propHooks[this.prop];return this.options.duration?this.pos=t=S.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):et.propHooks._default.set(this),this}}).init.prototype=et.prototype,(et.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=S.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){S.fx.step[e.prop]?S.fx.step[e.prop](e):1!==e.elem.nodeType||!S.cssHooks[e.prop]&&null==e.elem.style[Xe(e.prop)]?e.elem[e.prop]=e.now:S.style(e.elem,e.prop,e.now+e.unit)}}}).scrollTop=et.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},S.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},S.fx=et.prototype.init,S.fx.step={};var tt,nt,rt,it,ot=/^(?:toggle|show|hide)$/,at=/queueHooks$/;function st(){nt&&(!1===E.hidden&&C.requestAnimationFrame?C.requestAnimationFrame(st):C.setTimeout(st,S.fx.interval),S.fx.tick())}function ut(){return C.setTimeout(function(){tt=void 0}),tt=Date.now()}function lt(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=ne[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function ct(e,t,n){for(var r,i=(ft.tweeners[t]||[]).concat(ft.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function ft(o,e,t){var n,a,r=0,i=ft.prefilters.length,s=S.Deferred().always(function(){delete u.elem}),u=function(){if(a)return!1;for(var e=tt||ut(),t=Math.max(0,l.startTime+l.duration-e),n=1-(t/l.duration||0),r=0,i=l.tweens.length;r<i;r++)l.tweens[r].run(n);return s.notifyWith(o,[l,n,t]),n<1&&i?t:(i||s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l]),!1)},l=s.promise({elem:o,props:S.extend({},e),opts:S.extend(!0,{specialEasing:{},easing:S.easing._default},t),originalProperties:e,originalOptions:t,startTime:tt||ut(),duration:t.duration,tweens:[],createTween:function(e,t){var n=S.Tween(o,l.opts,e,t,l.opts.specialEasing[e]||l.opts.easing);return l.tweens.push(n),n},stop:function(e){var t=0,n=e?l.tweens.length:0;if(a)return this;for(a=!0;t<n;t++)l.tweens[t].run(1);return e?(s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l,e])):s.rejectWith(o,[l,e]),this}}),c=l.props;for(!function(e,t){var n,r,i,o,a;for(n in e)if(i=t[r=X(n)],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(a=S.cssHooks[r])&&"expand"in a)for(n in o=a.expand(o),delete e[r],o)n in e||(e[n]=o[n],t[n]=i);else t[r]=i}(c,l.opts.specialEasing);r<i;r++)if(n=ft.prefilters[r].call(l,o,c,l.opts))return m(n.stop)&&(S._queueHooks(l.elem,l.opts.queue).stop=n.stop.bind(n)),n;return S.map(c,ct,l),m(l.opts.start)&&l.opts.start.call(o,l),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always),S.fx.timer(S.extend(u,{elem:o,anim:l,queue:l.opts.queue})),l}S.Animation=S.extend(ft,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return se(n.elem,e,te.exec(t),n),n}]},tweener:function(e,t){m(e)?(t=e,e=["*"]):e=e.match(P);for(var n,r=0,i=e.length;r<i;r++)n=e[r],ft.tweeners[n]=ft.tweeners[n]||[],ft.tweeners[n].unshift(t)},prefilters:[function(e,t,n){var r,i,o,a,s,u,l,c,f="width"in t||"height"in t,p=this,d={},h=e.style,g=e.nodeType&&ae(e),v=Y.get(e,"fxshow");for(r in n.queue||(null==(a=S._queueHooks(e,"fx")).unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,p.always(function(){p.always(function(){a.unqueued--,S.queue(e,"fx").length||a.empty.fire()})})),t)if(i=t[r],ot.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!v||void 0===v[r])continue;g=!0}d[r]=v&&v[r]||S.style(e,r)}if((u=!S.isEmptyObject(t))||!S.isEmptyObject(d))for(r in f&&1===e.nodeType&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],null==(l=v&&v.display)&&(l=Y.get(e,"display")),"none"===(c=S.css(e,"display"))&&(l?c=l:(le([e],!0),l=e.style.display||l,c=S.css(e,"display"),le([e]))),("inline"===c||"inline-block"===c&&null!=l)&&"none"===S.css(e,"float")&&(u||(p.done(function(){h.display=l}),null==l&&(c=h.display,l="none"===c?"":c)),h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),u=!1,d)u||(v?"hidden"in v&&(g=v.hidden):v=Y.access(e,"fxshow",{display:l}),o&&(v.hidden=!g),g&&le([e],!0),p.done(function(){for(r in g||le([e]),Y.remove(e,"fxshow"),d)S.style(e,r,d[r])})),u=ct(g?v[r]:0,r,p),r in v||(v[r]=u.start,g&&(u.end=u.start,u.start=0))}],prefilter:function(e,t){t?ft.prefilters.unshift(e):ft.prefilters.push(e)}}),S.speed=function(e,t,n){var r=e&&"object"==typeof e?S.extend({},e):{complete:n||!n&&t||m(e)&&e,duration:e,easing:n&&t||t&&!m(t)&&t};return S.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in S.fx.speeds?r.duration=S.fx.speeds[r.duration]:r.duration=S.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){m(r.old)&&r.old.call(this),r.queue&&S.dequeue(this,r.queue)},r},S.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ae).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(t,e,n,r){var i=S.isEmptyObject(t),o=S.speed(e,n,r),a=function(){var e=ft(this,S.extend({},t),o);(i||Y.get(this,"finish"))&&e.stop(!0)};return a.finish=a,i||!1===o.queue?this.each(a):this.queue(o.queue,a)},stop:function(i,e,o){var a=function(e){var t=e.stop;delete e.stop,t(o)};return"string"!=typeof i&&(o=e,e=i,i=void 0),e&&this.queue(i||"fx",[]),this.each(function(){var e=!0,t=null!=i&&i+"queueHooks",n=S.timers,r=Y.get(this);if(t)r[t]&&r[t].stop&&a(r[t]);else for(t in r)r[t]&&r[t].stop&&at.test(t)&&a(r[t]);for(t=n.length;t--;)n[t].elem!==this||null!=i&&n[t].queue!==i||(n[t].anim.stop(o),e=!1,n.splice(t,1));!e&&o||S.dequeue(this,i)})},finish:function(a){return!1!==a&&(a=a||"fx"),this.each(function(){var e,t=Y.get(this),n=t[a+"queue"],r=t[a+"queueHooks"],i=S.timers,o=n?n.length:0;for(t.finish=!0,S.queue(this,a,[]),r&&r.stop&&r.stop.call(this,!0),e=i.length;e--;)i[e].elem===this&&i[e].queue===a&&(i[e].anim.stop(!0),i.splice(e,1));for(e=0;e<o;e++)n[e]&&n[e].finish&&n[e].finish.call(this);delete t.finish})}}),S.each(["toggle","show","hide"],function(e,r){var i=S.fn[r];S.fn[r]=function(e,t,n){return null==e||"boolean"==typeof e?i.apply(this,arguments):this.animate(lt(r,!0),e,t,n)}}),S.each({slideDown:lt("show"),slideUp:lt("hide"),slideToggle:lt("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,r){S.fn[e]=function(e,t,n){return this.animate(r,e,t,n)}}),S.timers=[],S.fx.tick=function(){var e,t=0,n=S.timers;for(tt=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||S.fx.stop(),tt=void 0},S.fx.timer=function(e){S.timers.push(e),S.fx.start()},S.fx.interval=13,S.fx.start=function(){nt||(nt=!0,st())},S.fx.stop=function(){nt=null},S.fx.speeds={slow:600,fast:200,_default:400},S.fn.delay=function(r,e){return r=S.fx&&S.fx.speeds[r]||r,e=e||"fx",this.queue(e,function(e,t){var n=C.setTimeout(e,r);t.stop=function(){C.clearTimeout(n)}})},rt=E.createElement("input"),it=E.createElement("select").appendChild(E.createElement("option")),rt.type="checkbox",y.checkOn=""!==rt.value,y.optSelected=it.selected,(rt=E.createElement("input")).value="t",rt.type="radio",y.radioValue="t"===rt.value;var pt,dt=S.expr.attrHandle;S.fn.extend({attr:function(e,t){return $(this,S.attr,e,t,1<arguments.length)},removeAttr:function(e){return this.each(function(){S.removeAttr(this,e)})}}),S.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return"undefined"==typeof e.getAttribute?S.prop(e,t,n):(1===o&&S.isXMLDoc(e)||(i=S.attrHooks[t.toLowerCase()]||(S.expr.match.bool.test(t)?pt:void 0)),void 0!==n?null===n?void S.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=S.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!y.radioValue&&"radio"===t&&A(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(P);if(i&&1===e.nodeType)while(n=i[r++])e.removeAttribute(n)}}),pt={set:function(e,t,n){return!1===t?S.removeAttr(e,n):e.setAttribute(n,n),n}},S.each(S.expr.match.bool.source.match(/\w+/g),function(e,t){var a=dt[t]||S.find.attr;dt[t]=function(e,t,n){var r,i,o=t.toLowerCase();return n||(i=dt[o],dt[o]=r,r=null!=a(e,t,n)?o:null,dt[o]=i),r}});var ht=/^(?:input|select|textarea|button)$/i,gt=/^(?:a|area)$/i;function vt(e){return(e.match(P)||[]).join(" ")}function yt(e){return e.getAttribute&&e.getAttribute("class")||""}function mt(e){return Array.isArray(e)?e:"string"==typeof e&&e.match(P)||[]}S.fn.extend({prop:function(e,t){return $(this,S.prop,e,t,1<arguments.length)},removeProp:function(e){return this.each(function(){delete this[S.propFix[e]||e]})}}),S.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&S.isXMLDoc(e)||(t=S.propFix[t]||t,i=S.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=S.find.attr(e,"tabindex");return t?parseInt(t,10):ht.test(e.nodeName)||gt.test(e.nodeName)&&e.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),y.optSelected||(S.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),S.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){S.propFix[this.toLowerCase()]=this}),S.fn.extend({addClass:function(t){var e,n,r,i,o,a,s,u=0;if(m(t))return this.each(function(e){S(this).addClass(t.call(this,e,yt(this)))});if((e=mt(t)).length)while(n=this[u++])if(i=yt(n),r=1===n.nodeType&&" "+vt(i)+" "){a=0;while(o=e[a++])r.indexOf(" "+o+" ")<0&&(r+=o+" ");i!==(s=vt(r))&&n.setAttribute("class",s)}return this},removeClass:function(t){var e,n,r,i,o,a,s,u=0;if(m(t))return this.each(function(e){S(this).removeClass(t.call(this,e,yt(this)))});if(!arguments.length)return this.attr("class","");if((e=mt(t)).length)while(n=this[u++])if(i=yt(n),r=1===n.nodeType&&" "+vt(i)+" "){a=0;while(o=e[a++])while(-1<r.indexOf(" "+o+" "))r=r.replace(" "+o+" "," ");i!==(s=vt(r))&&n.setAttribute("class",s)}return this},toggleClass:function(i,t){var o=typeof i,a="string"===o||Array.isArray(i);return"boolean"==typeof t&&a?t?this.addClass(i):this.removeClass(i):m(i)?this.each(function(e){S(this).toggleClass(i.call(this,e,yt(this),t),t)}):this.each(function(){var e,t,n,r;if(a){t=0,n=S(this),r=mt(i);while(e=r[t++])n.hasClass(e)?n.removeClass(e):n.addClass(e)}else void 0!==i&&"boolean"!==o||((e=yt(this))&&Y.set(this,"__className__",e),this.setAttribute&&this.setAttribute("class",e||!1===i?"":Y.get(this,"__className__")||""))})},hasClass:function(e){var t,n,r=0;t=" "+e+" ";while(n=this[r++])if(1===n.nodeType&&-1<(" "+vt(yt(n))+" ").indexOf(t))return!0;return!1}});var xt=/\r/g;S.fn.extend({val:function(n){var r,e,i,t=this[0];return arguments.length?(i=m(n),this.each(function(e){var t;1===this.nodeType&&(null==(t=i?n.call(this,e,S(this).val()):n)?t="":"number"==typeof t?t+="":Array.isArray(t)&&(t=S.map(t,function(e){return null==e?"":e+""})),(r=S.valHooks[this.type]||S.valHooks[this.nodeName.toLowerCase()])&&"set"in r&&void 0!==r.set(this,t,"value")||(this.value=t))})):t?(r=S.valHooks[t.type]||S.valHooks[t.nodeName.toLowerCase()])&&"get"in r&&void 0!==(e=r.get(t,"value"))?e:"string"==typeof(e=t.value)?e.replace(xt,""):null==e?"":e:void 0}}),S.extend({valHooks:{option:{get:function(e){var t=S.find.attr(e,"value");return null!=t?t:vt(S.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],u=a?o+1:i.length;for(r=o<0?u:a?o:0;r<u;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!A(n.parentNode,"optgroup"))){if(t=S(n).val(),a)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=S.makeArray(t),a=i.length;while(a--)((r=i[a]).selected=-1<S.inArray(S.valHooks.option.get(r),o))&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),S.each(["radio","checkbox"],function(){S.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=-1<S.inArray(S(e).val(),t)}},y.checkOn||(S.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})}),y.focusin="onfocusin"in C;var bt=/^(?:focusinfocus|focusoutblur)$/,wt=function(e){e.stopPropagation()};S.extend(S.event,{trigger:function(e,t,n,r){var i,o,a,s,u,l,c,f,p=[n||E],d=v.call(e,"type")?e.type:e,h=v.call(e,"namespace")?e.namespace.split("."):[];if(o=f=a=n=n||E,3!==n.nodeType&&8!==n.nodeType&&!bt.test(d+S.event.triggered)&&(-1<d.indexOf(".")&&(d=(h=d.split(".")).shift(),h.sort()),u=d.indexOf(":")<0&&"on"+d,(e=e[S.expando]?e:new S.Event(d,"object"==typeof e&&e)).isTrigger=r?2:3,e.namespace=h.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,e.result=void 0,e.target||(e.target=n),t=null==t?[e]:S.makeArray(t,[e]),c=S.event.special[d]||{},r||!c.trigger||!1!==c.trigger.apply(n,t))){if(!r&&!c.noBubble&&!x(n)){for(s=c.delegateType||d,bt.test(s+d)||(o=o.parentNode);o;o=o.parentNode)p.push(o),a=o;a===(n.ownerDocument||E)&&p.push(a.defaultView||a.parentWindow||C)}i=0;while((o=p[i++])&&!e.isPropagationStopped())f=o,e.type=1<i?s:c.bindType||d,(l=(Y.get(o,"events")||Object.create(null))[e.type]&&Y.get(o,"handle"))&&l.apply(o,t),(l=u&&o[u])&&l.apply&&V(o)&&(e.result=l.apply(o,t),!1===e.result&&e.preventDefault());return e.type=d,r||e.isDefaultPrevented()||c._default&&!1!==c._default.apply(p.pop(),t)||!V(n)||u&&m(n[d])&&!x(n)&&((a=n[u])&&(n[u]=null),S.event.triggered=d,e.isPropagationStopped()&&f.addEventListener(d,wt),n[d](),e.isPropagationStopped()&&f.removeEventListener(d,wt),S.event.triggered=void 0,a&&(n[u]=a)),e.result}},simulate:function(e,t,n){var r=S.extend(new S.Event,n,{type:e,isSimulated:!0});S.event.trigger(r,null,t)}}),S.fn.extend({trigger:function(e,t){return this.each(function(){S.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return S.event.trigger(e,t,n,!0)}}),y.focusin||S.each({focus:"focusin",blur:"focusout"},function(n,r){var i=function(e){S.event.simulate(r,e.target,S.event.fix(e))};S.event.special[r]={setup:function(){var e=this.ownerDocument||this.document||this,t=Y.access(e,r);t||e.addEventListener(n,i,!0),Y.access(e,r,(t||0)+1)},teardown:function(){var e=this.ownerDocument||this.document||this,t=Y.access(e,r)-1;t?Y.access(e,r,t):(e.removeEventListener(n,i,!0),Y.remove(e,r))}}});var Tt=C.location,Ct={guid:Date.now()},Et=/\?/;S.parseXML=function(e){var t;if(!e||"string"!=typeof e)return null;try{t=(new C.DOMParser).parseFromString(e,"text/xml")}catch(e){t=void 0}return t&&!t.getElementsByTagName("parsererror").length||S.error("Invalid XML: "+e),t};var St=/\[\]$/,kt=/\r?\n/g,At=/^(?:submit|button|image|reset|file)$/i,Nt=/^(?:input|select|textarea|keygen)/i;function Dt(n,e,r,i){var t;if(Array.isArray(e))S.each(e,function(e,t){r||St.test(n)?i(n,t):Dt(n+"["+("object"==typeof t&&null!=t?e:"")+"]",t,r,i)});else if(r||"object"!==w(e))i(n,e);else for(t in e)Dt(n+"["+t+"]",e[t],r,i)}S.param=function(e,t){var n,r=[],i=function(e,t){var n=m(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(null==e)return"";if(Array.isArray(e)||e.jquery&&!S.isPlainObject(e))S.each(e,function(){i(this.name,this.value)});else for(n in e)Dt(n,e[n],t,i);return r.join("&")},S.fn.extend({serialize:function(){return S.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=S.prop(this,"elements");return e?S.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!S(this).is(":disabled")&&Nt.test(this.nodeName)&&!At.test(e)&&(this.checked||!pe.test(e))}).map(function(e,t){var n=S(this).val();return null==n?null:Array.isArray(n)?S.map(n,function(e){return{name:t.name,value:e.replace(kt,"\r\n")}}):{name:t.name,value:n.replace(kt,"\r\n")}}).get()}});var jt=/%20/g,qt=/#.*$/,Lt=/([?&])_=[^&]*/,Ht=/^(.*?):[ \t]*([^\r\n]*)$/gm,Ot=/^(?:GET|HEAD)$/,Pt=/^\/\//,Rt={},Mt={},It="*/".concat("*"),Wt=E.createElement("a");function Ft(o){return function(e,t){"string"!=typeof e&&(t=e,e="*");var n,r=0,i=e.toLowerCase().match(P)||[];if(m(t))while(n=i[r++])"+"===n[0]?(n=n.slice(1)||"*",(o[n]=o[n]||[]).unshift(t)):(o[n]=o[n]||[]).push(t)}}function Bt(t,i,o,a){var s={},u=t===Mt;function l(e){var r;return s[e]=!0,S.each(t[e]||[],function(e,t){var n=t(i,o,a);return"string"!=typeof n||u||s[n]?u?!(r=n):void 0:(i.dataTypes.unshift(n),l(n),!1)}),r}return l(i.dataTypes[0])||!s["*"]&&l("*")}function $t(e,t){var n,r,i=S.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&S.extend(!0,e,r),e}Wt.href=Tt.href,S.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Tt.href,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Tt.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":It,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":S.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?$t($t(e,S.ajaxSettings),t):$t(S.ajaxSettings,e)},ajaxPrefilter:Ft(Rt),ajaxTransport:Ft(Mt),ajax:function(e,t){"object"==typeof e&&(t=e,e=void 0),t=t||{};var c,f,p,n,d,r,h,g,i,o,v=S.ajaxSetup({},t),y=v.context||v,m=v.context&&(y.nodeType||y.jquery)?S(y):S.event,x=S.Deferred(),b=S.Callbacks("once memory"),w=v.statusCode||{},a={},s={},u="canceled",T={readyState:0,getResponseHeader:function(e){var t;if(h){if(!n){n={};while(t=Ht.exec(p))n[t[1].toLowerCase()+" "]=(n[t[1].toLowerCase()+" "]||[]).concat(t[2])}t=n[e.toLowerCase()+" "]}return null==t?null:t.join(", ")},getAllResponseHeaders:function(){return h?p:null},setRequestHeader:function(e,t){return null==h&&(e=s[e.toLowerCase()]=s[e.toLowerCase()]||e,a[e]=t),this},overrideMimeType:function(e){return null==h&&(v.mimeType=e),this},statusCode:function(e){var t;if(e)if(h)T.always(e[T.status]);else for(t in e)w[t]=[w[t],e[t]];return this},abort:function(e){var t=e||u;return c&&c.abort(t),l(0,t),this}};if(x.promise(T),v.url=((e||v.url||Tt.href)+"").replace(Pt,Tt.protocol+"//"),v.type=t.method||t.type||v.method||v.type,v.dataTypes=(v.dataType||"*").toLowerCase().match(P)||[""],null==v.crossDomain){r=E.createElement("a");try{r.href=v.url,r.href=r.href,v.crossDomain=Wt.protocol+"//"+Wt.host!=r.protocol+"//"+r.host}catch(e){v.crossDomain=!0}}if(v.data&&v.processData&&"string"!=typeof v.data&&(v.data=S.param(v.data,v.traditional)),Bt(Rt,v,t,T),h)return T;for(i in(g=S.event&&v.global)&&0==S.active++&&S.event.trigger("ajaxStart"),v.type=v.type.toUpperCase(),v.hasContent=!Ot.test(v.type),f=v.url.replace(qt,""),v.hasContent?v.data&&v.processData&&0===(v.contentType||"").indexOf("application/x-www-form-urlencoded")&&(v.data=v.data.replace(jt,"+")):(o=v.url.slice(f.length),v.data&&(v.processData||"string"==typeof v.data)&&(f+=(Et.test(f)?"&":"?")+v.data,delete v.data),!1===v.cache&&(f=f.replace(Lt,"$1"),o=(Et.test(f)?"&":"?")+"_="+Ct.guid+++o),v.url=f+o),v.ifModified&&(S.lastModified[f]&&T.setRequestHeader("If-Modified-Since",S.lastModified[f]),S.etag[f]&&T.setRequestHeader("If-None-Match",S.etag[f])),(v.data&&v.hasContent&&!1!==v.contentType||t.contentType)&&T.setRequestHeader("Content-Type",v.contentType),T.setRequestHeader("Accept",v.dataTypes[0]&&v.accepts[v.dataTypes[0]]?v.accepts[v.dataTypes[0]]+("*"!==v.dataTypes[0]?", "+It+"; q=0.01":""):v.accepts["*"]),v.headers)T.setRequestHeader(i,v.headers[i]);if(v.beforeSend&&(!1===v.beforeSend.call(y,T,v)||h))return T.abort();if(u="abort",b.add(v.complete),T.done(v.success),T.fail(v.error),c=Bt(Mt,v,t,T)){if(T.readyState=1,g&&m.trigger("ajaxSend",[T,v]),h)return T;v.async&&0<v.timeout&&(d=C.setTimeout(function(){T.abort("timeout")},v.timeout));try{h=!1,c.send(a,l)}catch(e){if(h)throw e;l(-1,e)}}else l(-1,"No Transport");function l(e,t,n,r){var i,o,a,s,u,l=t;h||(h=!0,d&&C.clearTimeout(d),c=void 0,p=r||"",T.readyState=0<e?4:0,i=200<=e&&e<300||304===e,n&&(s=function(e,t,n){var r,i,o,a,s=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}(v,T,n)),!i&&-1<S.inArray("script",v.dataTypes)&&(v.converters["text script"]=function(){}),s=function(e,t,n,r){var i,o,a,s,u,l={},c=e.dataTypes.slice();if(c[1])for(a in e.converters)l[a.toLowerCase()]=e.converters[a];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(!(a=l[u+" "+o]||l["* "+o]))for(i in l)if((s=i.split(" "))[1]===o&&(a=l[u+" "+s[0]]||l["* "+s[0]])){!0===a?a=l[i]:!0!==l[i]&&(o=s[0],c.unshift(s[1]));break}if(!0!==a)if(a&&e["throws"])t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}(v,s,T,i),i?(v.ifModified&&((u=T.getResponseHeader("Last-Modified"))&&(S.lastModified[f]=u),(u=T.getResponseHeader("etag"))&&(S.etag[f]=u)),204===e||"HEAD"===v.type?l="nocontent":304===e?l="notmodified":(l=s.state,o=s.data,i=!(a=s.error))):(a=l,!e&&l||(l="error",e<0&&(e=0))),T.status=e,T.statusText=(t||l)+"",i?x.resolveWith(y,[o,l,T]):x.rejectWith(y,[T,l,a]),T.statusCode(w),w=void 0,g&&m.trigger(i?"ajaxSuccess":"ajaxError",[T,v,i?o:a]),b.fireWith(y,[T,l]),g&&(m.trigger("ajaxComplete",[T,v]),--S.active||S.event.trigger("ajaxStop")))}return T},getJSON:function(e,t,n){return S.get(e,t,n,"json")},getScript:function(e,t){return S.get(e,void 0,t,"script")}}),S.each(["get","post"],function(e,i){S[i]=function(e,t,n,r){return m(t)&&(r=r||n,n=t,t=void 0),S.ajax(S.extend({url:e,type:i,dataType:r,data:t,success:n},S.isPlainObject(e)&&e))}}),S.ajaxPrefilter(function(e){var t;for(t in e.headers)"content-type"===t.toLowerCase()&&(e.contentType=e.headers[t]||"")}),S._evalUrl=function(e,t,n){return S.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(e){S.globalEval(e,t,n)}})},S.fn.extend({wrapAll:function(e){var t;return this[0]&&(m(e)&&(e=e.call(this[0])),t=S(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this},wrapInner:function(n){return m(n)?this.each(function(e){S(this).wrapInner(n.call(this,e))}):this.each(function(){var e=S(this),t=e.contents();t.length?t.wrapAll(n):e.append(n)})},wrap:function(t){var n=m(t);return this.each(function(e){S(this).wrapAll(n?t.call(this,e):t)})},unwrap:function(e){return this.parent(e).not("body").each(function(){S(this).replaceWith(this.childNodes)}),this}}),S.expr.pseudos.hidden=function(e){return!S.expr.pseudos.visible(e)},S.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},S.ajaxSettings.xhr=function(){try{return new C.XMLHttpRequest}catch(e){}};var _t={0:200,1223:204},zt=S.ajaxSettings.xhr();y.cors=!!zt&&"withCredentials"in zt,y.ajax=zt=!!zt,S.ajaxTransport(function(i){var o,a;if(y.cors||zt&&!i.crossDomain)return{send:function(e,t){var n,r=i.xhr();if(r.open(i.type,i.url,i.async,i.username,i.password),i.xhrFields)for(n in i.xhrFields)r[n]=i.xhrFields[n];for(n in i.mimeType&&r.overrideMimeType&&r.overrideMimeType(i.mimeType),i.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest"),e)r.setRequestHeader(n,e[n]);o=function(e){return function(){o&&(o=a=r.onload=r.onerror=r.onabort=r.ontimeout=r.onreadystatechange=null,"abort"===e?r.abort():"error"===e?"number"!=typeof r.status?t(0,"error"):t(r.status,r.statusText):t(_t[r.status]||r.status,r.statusText,"text"!==(r.responseType||"text")||"string"!=typeof r.responseText?{binary:r.response}:{text:r.responseText},r.getAllResponseHeaders()))}},r.onload=o(),a=r.onerror=r.ontimeout=o("error"),void 0!==r.onabort?r.onabort=a:r.onreadystatechange=function(){4===r.readyState&&C.setTimeout(function(){o&&a()})},o=o("abort");try{r.send(i.hasContent&&i.data||null)}catch(e){if(o)throw e}},abort:function(){o&&o()}}}),S.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),S.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return S.globalEval(e),e}}}),S.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),S.ajaxTransport("script",function(n){var r,i;if(n.crossDomain||n.scriptAttrs)return{send:function(e,t){r=S("<script>").attr(n.scriptAttrs||{}).prop({charset:n.scriptCharset,src:n.url}).on("load error",i=function(e){r.remove(),i=null,e&&t("error"===e.type?404:200,e.type)}),E.head.appendChild(r[0])},abort:function(){i&&i()}}});var Ut,Xt=[],Vt=/(=)\?(?=&|$)|\?\?/;S.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Xt.pop()||S.expando+"_"+Ct.guid++;return this[e]=!0,e}}),S.ajaxPrefilter("json jsonp",function(e,t,n){var r,i,o,a=!1!==e.jsonp&&(Vt.test(e.url)?"url":"string"==typeof e.data&&0===(e.contentType||"").indexOf("application/x-www-form-urlencoded")&&Vt.test(e.data)&&"data");if(a||"jsonp"===e.dataTypes[0])return r=e.jsonpCallback=m(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,a?e[a]=e[a].replace(Vt,"$1"+r):!1!==e.jsonp&&(e.url+=(Et.test(e.url)?"&":"?")+e.jsonp+"="+r),e.converters["script json"]=function(){return o||S.error(r+" was not called"),o[0]},e.dataTypes[0]="json",i=C[r],C[r]=function(){o=arguments},n.always(function(){void 0===i?S(C).removeProp(r):C[r]=i,e[r]&&(e.jsonpCallback=t.jsonpCallback,Xt.push(r)),o&&m(i)&&i(o[0]),o=i=void 0}),"script"}),y.createHTMLDocument=((Ut=E.implementation.createHTMLDocument("").body).innerHTML="<form></form><form></form>",2===Ut.childNodes.length),S.parseHTML=function(e,t,n){return"string"!=typeof e?[]:("boolean"==typeof t&&(n=t,t=!1),t||(y.createHTMLDocument?((r=(t=E.implementation.createHTMLDocument("")).createElement("base")).href=E.location.href,t.head.appendChild(r)):t=E),o=!n&&[],(i=N.exec(e))?[t.createElement(i[1])]:(i=xe([e],t,o),o&&o.length&&S(o).remove(),S.merge([],i.childNodes)));var r,i,o},S.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return-1<s&&(r=vt(e.slice(s)),e=e.slice(0,s)),m(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),0<a.length&&S.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done(function(e){o=arguments,a.html(r?S("<div>").append(S.parseHTML(e)).find(r):e)}).always(n&&function(e,t){a.each(function(){n.apply(this,o||[e.responseText,t,e])})}),this},S.expr.pseudos.animated=function(t){return S.grep(S.timers,function(e){return t===e.elem}).length},S.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,l=S.css(e,"position"),c=S(e),f={};"static"===l&&(e.style.position="relative"),s=c.offset(),o=S.css(e,"top"),u=S.css(e,"left"),("absolute"===l||"fixed"===l)&&-1<(o+u).indexOf("auto")?(a=(r=c.position()).top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),m(t)&&(t=t.call(e,n,S.extend({},s))),null!=t.top&&(f.top=t.top-s.top+a),null!=t.left&&(f.left=t.left-s.left+i),"using"in t?t.using.call(e,f):("number"==typeof f.top&&(f.top+="px"),"number"==typeof f.left&&(f.left+="px"),c.css(f))}},S.fn.extend({offset:function(t){if(arguments.length)return void 0===t?this:this.each(function(e){S.offset.setOffset(this,t,e)});var e,n,r=this[0];return r?r.getClientRects().length?(e=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:e.top+n.pageYOffset,left:e.left+n.pageXOffset}):{top:0,left:0}:void 0},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===S.css(r,"position"))t=r.getBoundingClientRect();else{t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;while(e&&(e===n.body||e===n.documentElement)&&"static"===S.css(e,"position"))e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=S(e).offset()).top+=S.css(e,"borderTopWidth",!0),i.left+=S.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-S.css(r,"marginTop",!0),left:t.left-i.left-S.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent;while(e&&"static"===S.css(e,"position"))e=e.offsetParent;return e||re})}}),S.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(t,i){var o="pageYOffset"===i;S.fn[t]=function(e){return $(this,function(e,t,n){var r;if(x(e)?r=e:9===e.nodeType&&(r=e.defaultView),void 0===n)return r?r[i]:e[t];r?r.scrollTo(o?r.pageXOffset:n,o?n:r.pageYOffset):e[t]=n},t,e,arguments.length)}}),S.each(["top","left"],function(e,n){S.cssHooks[n]=$e(y.pixelPosition,function(e,t){if(t)return t=Be(e,n),Me.test(t)?S(e).position()[n]+"px":t})}),S.each({Height:"height",Width:"width"},function(a,s){S.each({padding:"inner"+a,content:s,"":"outer"+a},function(r,o){S.fn[o]=function(e,t){var n=arguments.length&&(r||"boolean"!=typeof e),i=r||(!0===e||!0===t?"margin":"border");return $(this,function(e,t,n){var r;return x(e)?0===o.indexOf("outer")?e["inner"+a]:e.document.documentElement["client"+a]:9===e.nodeType?(r=e.documentElement,Math.max(e.body["scroll"+a],r["scroll"+a],e.body["offset"+a],r["offset"+a],r["client"+a])):void 0===n?S.css(e,t,i):S.style(e,t,n,i)},s,n?e:void 0,n)}})}),S.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){S.fn[t]=function(e){return this.on(t,e)}}),S.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)},hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),S.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,n){S.fn[n]=function(e,t){return 0<arguments.length?this.on(n,null,e,t):this.trigger(n)}});var Gt=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;S.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),m(e))return r=s.call(arguments,2),(i=function(){return e.apply(t||this,r.concat(s.call(arguments)))}).guid=e.guid=e.guid||S.guid++,i},S.holdReady=function(e){e?S.readyWait++:S.ready(!0)},S.isArray=Array.isArray,S.parseJSON=JSON.parse,S.nodeName=A,S.isFunction=m,S.isWindow=x,S.camelCase=X,S.type=w,S.now=Date.now,S.isNumeric=function(e){var t=S.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},S.trim=function(e){return null==e?"":(e+"").replace(Gt,"")},"function"==typeof define&&define.amd&&define("jquery",[],function(){return S});var Yt=C.jQuery,Qt=C.$;return S.noConflict=function(e){return C.$===S&&(C.$=Qt),e&&C.jQuery===S&&(C.jQuery=Yt),S},"undefined"==typeof e&&(C.jQuery=C.$=S),S});

// --- end vendored jQuery ----------------------------------------------------------

(function () {
	if (window.top !== window.self) return;
	if (window.__brillChallengeInstalled) return;
	window.__brillChallengeInstalled = true;
	console.log('[brill] PlayChallengeWithBrill starting');

	// Keep jQuery off the page's globals. BBOalert can install it freely because it lives
	// in its own iframe; here we share a document with BBO's Angular app, so leaving
	// window.$ reassigned is asking for a conflict. noConflict(true) hands us a private
	// instance and restores window.$ / window.jQuery to exactly what they were.
	var $ = window.jQuery ? window.jQuery.noConflict(true) : null;
	var jQuery = $;
	if (!$) {
		console.error('[brill] jQuery not present - the @require failed to load');
		return;
	}

	// ==========================================================================
	// vendored: src/iframe/globals.js
	// ==========================================================================
	/**
	 * Global variables
	 */
	
	// Global variables
	const CHECKED_CHAR = "✔";
	const COLLAPSED_BG_COLOR = "yellow";
	const COLLAPSED_TEXT_COLOR = "black";
	let DEBUG = false;
	
	let navDivDisplayed = false;
	let biddingBoxExists = false;
	let biddingBoxDisplayed = false;
	let explainCallDisplayed = false;
	let auctionBoxDisplayed = false;
	let lastDealNumber = '';
	let LHOpponent = '';
	let RHOpponent = '';
	let opponentChanged = '';
	let currentAuction = '??';
	let tableDisplayed = false;
	let activePlayer = '';
	let lastSelectedCall = '';
	let OKbuttonVisible = false;
	let OKbuttonPressed = false;
	let cardLead = '';
	let playedCards = '';
	let callExplanationPanelDisplayed = false;
	let myCardsDisplayed = '';
	let dealEndPanelDisplayed = false;
	let announcementDisplayed = false;
	let finalContractDisplayed = false;
	let announcementText = '';
	let notificationDisplayed = false;
	let notificationText = '';
	let lastChatMessage = '';
	let lastUserExplanation = '';
	let recordNewAlerts = true;
	let ctxArray = [];
	let blogNames = [];
	let blogIds = [];
	let eventClick = new Event('click');
	let callText = "";
	let updateText = "";
	let updateCount = 0;
	let cbData = "";
	let scriptList = [];
	let alertTableCursor = 0;
	let clipBoard = navigator.clipboard;
	let alertData = "";
	let alertOriginal = "";
	let alertTable = alertData.split("\n");
	let version = document.title;
	let logText = `${version}\n${navigator.userAgent}\n`;
	let bidSymbolMap = new Map();
	let alertHistoryMap = new Map();
	let PWD = parent.window.document;
	let openProfileBBOid = "";
	let openProfileBBOalertURL = "";
	let listTinyURL = new Map();
	
	let apiKey = "";
	
	E_onAnyMutation = new Event('onAnyMutation');
	E_onBiddingBoxCreated = new Event('onBiddingBoxCreated');
	E_onBiddingBoxDisplayed = new Event('onBiddingBoxDisplayed');
	E_onBiddingBoxHidden = new Event('onBiddingBoxHidden');
	E_onAuctionBoxDisplayed = new Event('onAuctionBoxDisplayed');
	E_onAuctionBegin = new Event('onAuctionBegin');
	E_onAuctionBoxHidden = new Event('onAuctionBoxHidden');
	E_onAuctionEnd = new Event('onAuctionEnd');
	E_onFinalContractDisplayed = new Event('onFinalContractDisplayed');
	E_onNewAuction = new Event('onNewAuction');
	E_onMyAuction = new Event('onMyAuction');
	E_onPartnerAuction = new Event('onPartnerAuction');
	E_onLHOAuction = new Event('onLHOAuction');
	E_onRHOAuction = new Event('onRHOAuction');
	E_onNewActivePlayer = new Event('onNewActivePlayer');
	E_onExplainCallDisplayed = new Event('onExplainCallDisplayed');
	E_onExplainCallHidden = new Event('onExplainCallHidden');
	E_onBiddingBoxRemoved = new Event('onBiddingBoxRemoved');
	E_onLogin = new Event('onLogin');
	E_onLogoff = new Event('onLogoff');
	E_onAnyOpponentChange = new Event('onAnyOpponentChange');
	E_onNewDeal = new Event('onNewDeal');
	E_onNewCallSelected = new Event('onNewCallSelected');
	E_onOKbuttonDisplayed = new Event('onOKbuttonDisplayed');
	E_onOKbuttonHidden = new Event('onOKbuttonHidden');
	E_onOKbuttonPressed = new Event('onOKbuttonPressed');
	E_onCallLevelSelected = new Event('onCallLevelSelected');
	E_onMyLead = new Event('onMyLead');
	E_onNewPlayedCard = new Event('onNewPlayedCard');
	E_onCallExplanationPanelDisplayed = new Event('onCallExplanationPanelDisplayed');
	E_onMyCardsDisplayed = new Event('onMyCardsDisplayed');
	E_onDealEnd = new Event('onDealEnd');
	E_onAnnouncementDisplayed = new Event('onAnnouncementDisplayed');
	E_onNotificationDisplayed = new Event('onNotificationDisplayed');
	E_onNewChatMessage = new Event('onNewChatMessage');
	E_onDataLoad = new Event('onDataLoad');
	E_onTableDisplayed = new Event('onTableDisplayed');
	E_onTableHidden = new Event('onTableHidden');
	E_onProfileBoxDisplayed = new Event('onProfileBoxDisplayed');
	E_onProfileBoxHidden = new Event('onProfileBoxHidden');
	
	function bidArray(bids) {
	    let bidarr = [];
	    for (var i = 0; i < bids.length; i = i + 2) {
	        bidarr.push(bids.slice(i, i + 2));
	    }
	    return bidarr;
	}
	allBids = bidArray("1C1D1H1S1N2C2D2H2S2N3C3D3H3S3N4C4D4H4S4N5C5D5H5S5N6C6D6H6S6N7C7D7H7S7N");
	
	
	// Release notes : stable version
	srcRelnotes = "https://docs.google.com/document/d/e/2PACX-1vQ_8Iv9HbBj4nWDXSY_kHsW1ZP_4c4dbOVO0GLuObJc1vFu_TBg9oV6ZJXMWd_tLITOj7i6WaJBeZJI/pub";
	if (document.title.includes("Beta")) {
	    // Release notes : beta version
	    srcRelnotes = "https://docs.google.com/document/d/e/2PACX-1vQlUHDS_XUimLvS722emrPw5Bzpyjm8lPKxZ9jwVwOVJVq0zQd3fawML8sylwxYIGKiZB60eJENB2TG/pub";
	}
	
	function initGlobals() {
	    navDivDisplayed = false;
	    biddingBoxExists = false;
	    biddingBoxDisplayed = false;
	    explainCallDisplayed = false;
	    auctionBoxDisplayed = false;
	    lastDealNumber = '';
	    LHOpponent = '';
	    RHOpponent = '';
	    opponentChanged = '';
	    currentAuction = '??';
	    tableDisplayed = false;
	    activePlayer = '';
	    lastSelectedCall = '';
	    OKbuttonVisible = false;
	    OKbuttonPressed = false;
	    cardLead = '';
	    playedCards = '';
	    callExplanationPanelDisplayed = false;
	    myCardsDisplayed = '';
	    dealEndPanelDisplayed = false;
	    announcemenDisplayed = false;
	    finalContractDisplayed = false;
	    announcementText = '';
	    notificationDisplayed = false;
	    notificationText = '';
	    lastChatMessage = '';
	    lastUserExplanation = '';
	    recordNewAlerts = true;
	    ctxArray = [];
	    blogNames = [];
	    blogIds = [];
	    eventClick = new Event('click');
	    callText = "";
	    updateText = "";
	    updateCount = 0;
	    cbData = "";
	    scriptList = [];
	    alertTableCursor = 0;
	    clipBoard = navigator.clipboard;
	    lastDealNumber = '';
	    alertData = "";
	    alertOriginal = "";
	    alertTable = alertData.split("\n");
	    version = document.title;
	    logText = version + '\n';
	    logText = logText + navigator.userAgent + '\n';
	    bidSymbolMap = new Map();
	    alertHistoryMap = new Map();
	    PWD = parent.window.document;
	}
	
	BBOalertButtonHTML = `<div id="bboalert-button" style="height: 46px; width: 46px;">
	<svg viewBox="0 0 170 170">
	<rect style="fill:#0000ff;stroke-width:0.9695" id="rect156" width="170.91365" height="118.80013" x="-0.010153236" y="51.866543"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:48px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff;fill-opacity:1;stroke:none" x="23.255058" y="100.05701" id="text4208">
	<tspan id="tspan4206" x="23.255058" y="100.05701" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:48px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	BBO</tspan>
	</text>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:40px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff;fill-opacity:1;stroke:none" x="24.207453" y="147.17821" id="text11098">
	<tspan id="tspan11096" x="24.207453" y="147.17821" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:40px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	Alert</tspan>
	</text>
	<rect style="fill:#0000ff;stroke-width:1.42343" id="rect30888" width="85.957748" height="28.492575" x="84.932518" y="23.367001"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff;fill-opacity:1;stroke:none" x="87.319008" y="47.640041" id="text42194">
	<tspan id="tspan42192" x="87.319008" y="47.640041" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	Alert</tspan>
	</text>
	<rect style="fill:#ff0000;stroke-width:1.67427" id="rect62412" width="84.908524" height="28.701813" x="0.023992665" y="23.292852"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff;fill-opacity:1;stroke:none" x="14.900936" y="44.923931" id="text65176">
	<tspan id="tspan65174" x="14.900936" y="44.923931" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	Stop</tspan>
	</text>
	<rect style="fill:#008000" id="rect121122" width="74.317535" height="24.015348" x="48.270805" y="-0.2446395"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff" x="55.604736" y="21.237953" id="text141696">
	<tspan id="tspan141694" x="55.604736" y="21.237953" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	Pass</tspan>
	</text>
	<rect style="fill:#ff0000" id="rect148238" width="48.301918" height="23.611641" x="122.58834" y="-0.2446395"></rect>
	<rect style="fill:#0000ff;stroke-width:1.01631" id="rect148262" width="48.321392" height="24.015348" x="-0.050585855" y="-0.2446395"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff" x="129.7393" y="21.326912" id="text153080">
	<tspan id="tspan153078" x="129.7393" y="21.326912" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	X</tspan>
	</text>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff" x="6.6074371" y="21.106106" id="text157330">
	<tspan id="tspan157328" x="6.6074371" y="21.106106" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	XX</tspan>
	</text>
	</svg>
	</div>`

	// ==========================================================================
	// vendored: src/iframe/functions.js
	// ==========================================================================
	function getBBOalertHeaderMsg() {
		try {
			var r = alertTable[0].split(',')[1];
			if (r == undefined) return '';
			if (alertTable[0].toUpperCase().indexOf('BBOALERT') == -1) return '';
			return ' ' + r.trim() + ' ';
		} catch {
			return '';
		}
	}
	
	/**
	 * execute script
	 * @param {string} S Javascript code
	 * @param {string} CR  context field (optional) 
	 * @param {string} C  current bidding context (optional) 
	 * @param {string} BR  call field (optional) 
	 * @param {string} B  current call (optional)
	 * @returns R = value of reserved variable
	 */
	function userScript(S, CR, C, BR, B) {
		R = '';
		try {
			eval(S);
			if (DEBUG) console.log(S);
			if (DEBUG) console.log(CR);
			if (DEBUG) console.log(C);
			if (DEBUG) console.log(BR);
			if (DEBUG) console.log(B);
			if (DEBUG) console.log(R);
			return R;
		} catch (error) {
			addLog('Error in script');
			addLog(error);
			addLog(S);
			return 'ERROR';
		}
	}
	
	/**
	 * tranform string s into RegExp object
	 * @param {string} s
	 * @returns {RegExp}
	 */
	function makeRegExp(s) {
		var re;
		if (s.startsWith('/') && s.endsWith('/')) {
			re = new RegExp(s.slice(1, s.length - 1));
		} else {
			var ref = s.replace(/\*/g, '.');
			ref = ref.replace(/_/g, '.');
			re = new RegExp(ref);
		}
		return re;
	}
	
	/**
	 * @ignore
	 */
	function setPageReload() {
		var nb = parent.document.querySelector('.navBarClass');
		if (nb == null) return;
		var nadc = nb.querySelector('.nonAnonDivClass');
		if (nadc == null) return;
		var lob = nadc.querySelector('button');
		if (lob == null) return;
		if (lob.onclick == null) lob.onclick = preparePageReload;
	}
	
	/**
	 * @ignoreµ
	 */
	function preparePageReload() {
		var db = parent.document.querySelector('mat-dialog-container');
		if (db == null) return;
		var bt = db.querySelector('button');
		if (bt == null) return;
		bt.onclick = pageReload;
	}
	
	/**
	 * @ignore
	 */
	function pageReload() {
		setOptions(false);
	}
	
	/**
	 * @ignore
	 */
	function normalize(s) {
		return elimine2Spaces(s.replace(/,+/g, ';')).trim();
	}
	
	
	/**
	 * @ignore
	 */
	function addLog(txt) {
		logText = logText + getNow(true) + ',' + txt + '\n';
	}
	
	/**
	 * @ignore
	 */
	function exportLogData() {
		bboalertLog(version + "<br>" + (logText.split('\n').length - 1) + ' records exported');
		writeToClipboard(logText);
	}
	
	/**
	 * @ignore
	 */
	var triggerDragAndDrop = function (selectorDrag, selectorDrop, dist) {
	
		// function for triggering mouse events
		var fireMouseEvent = function (type, elem, centerX, centerY) {
			var evt = parent.document.createEvent('MouseEvents');
			evt.initMouseEvent(type, true, true, window, 1, 1, 1, centerX, centerY, false, false, false, false, 0, elem);
			elem.dispatchEvent(evt);
		};
	
		// fetch target elements
		var elemDrag = parent.document.querySelector(selectorDrag);
		var elemDrop = parent.document.querySelector(selectorDrop);
		if (!elemDrag || !elemDrop) return false;
	
		// calculate positions
		var pos = elemDrag.getBoundingClientRect();
		var center1X = Math.floor((pos.left + pos.right) / 2);
		var center1Y = Math.floor((pos.top + pos.bottom) / 2);
		pos = elemDrop.getBoundingClientRect();
		var center2X = Math.floor((pos.left + pos.right) / 2) + dist;
		var center2Y = Math.floor((pos.top + pos.bottom) / 2);
	
		// mouse over dragged element and mousedown
		fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
		fireMouseEvent('mouseenter', elemDrag, center1X, center1Y);
		fireMouseEvent('mouseover', elemDrag, center1X, center1Y);
		fireMouseEvent('mousedown', elemDrag, center1X, center1Y);
	
		// start dragging process over to drop target
		fireMouseEvent('dragstart', elemDrag, center1X, center1Y);
		fireMouseEvent('drag', elemDrag, center1X, center1Y);
		fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
		fireMouseEvent('drag', elemDrag, center2X, center2Y);
		fireMouseEvent('mousemove', elemDrop, center2X, center2Y);
	
		// trigger dragging process on top of drop target
		fireMouseEvent('mouseenter', elemDrop, center2X, center2Y);
		fireMouseEvent('dragenter', elemDrop, center2X, center2Y);
		fireMouseEvent('mouseover', elemDrop, center2X, center2Y);
		fireMouseEvent('dragover', elemDrop, center2X, center2Y);
	
		// release dragged element on top of drop target
		fireMouseEvent('drop', elemDrop, center2X, center2Y);
		fireMouseEvent('dragend', elemDrag, center2X, center2Y);
		fireMouseEvent('mouseup', elemDrag, center2X, center2Y);
	
		return true;
	};
	
	/**
	 * @ignore
	 */
	function isUndoCommand(t) {
		if (t.search('Undo') != -1) return true;
		if (t.search('悔牌') != -1) return true;
		if (t.search('Fortryd') != -1) return true;
		if (t.search('Ακύρωση') != -1) return true;
		if (t.search('Deshacer') != -1) return true;
		if (t.search('בטל') != -1) return true;
		if (t.search('Visszavonás') != -1) return true;
		if (t.search('やり直す') != -1) return true;
		if (t.search('Ongedaan maken') != -1) return true;
		if (t.search('Angre') != -1) return true;
		if (t.search('Cofnij') != -1) return true;
		if (t.search('Desfazer') != -1) return true;
		if (t.search('Cere înapoi') != -1) return true;
		if (t.search('Geri al') != -1) return true;
		if (t.search('Merusak') != -1) return true;
		if (t.search('Zpět') != -1) return true;
		if (t.search('Откат') != -1) return true;
		if (t.search('Vraćanje') != -1) return true;
		if (t.search('Pöydän asetukset') != -1) return true;
		if (t.search('重來') != -1) return true;
		if (t.search('Ångra') != -1) return true;
		return false;
	}
	
	/**
	 * @ignore
	 */
	function isTable(t) {
		if (t.search('→Table') != -1) return true;
		if (t.search('→Маса') != -1) return true;
		if (t.search('→牌 桌') != -1) return true;
		if (t.search('→Bord') != -1) return true;
		if (t.search('→Tisch') != -1) return true;
		if (t.search('→Τραπέζι') != -1) return true;
		if (t.search('→Table') != -1) return true;
		if (t.search('→Asztal') != -1) return true;
		if (t.search('→Tavolo') != -1) return true;
		if (t.search('→テーブル') != -1) return true;
		if (t.search('→Tafel') != -1) return true;
		if (t.search('→Stół') != -1) return true;
		if (t.search('→Mesa') != -1) return true;
		if (t.search('→Masa') != -1) return true;
		if (t.search('→Tabel') != -1) return true;
		if (t.search('→Stůl') != -1) return true;
		if (t.search('→Стол') != -1) return true;
		if (t.search('→Stol') != -1) return true;
		if (t.search('→Pöytä') != -1) return true;
		if (t.search('→牌桌') != -1) return true;
		return false;
	}
	
	/**
	 * @ignore
	 */
	function isOpponents(t) {
		if (t.search('→Opponents') != -1) return true;
		if (t.search('→Противници') != -1) return true;
		if (t.search('→对手') != -1) return true;
		if (t.search('→Modstandere') != -1) return true;
		if (t.search('→Gegner') != -1) return true;
		if (t.search('→Αντίπαλοι') != -1) return true;
		if (t.search('→Oponentes') != -1) return true;
		if (t.search('→Adversaires') != -1) return true;
		if (t.search('→Ellenfelek') != -1) return true;
		if (t.search('→Avversari') != -1) return true;
		if (t.search('→対戦相手') != -1) return true;
		if (t.search('→Tegenstanders') != -1) return true;
		if (t.search('→Motstandere') != -1) return true;
		if (t.search('→Przeciwnicy') != -1) return true;
		if (t.search('→Adversários') != -1) return true;
		if (t.search('→Adversari') != -1) return true;
		if (t.search('→Rakipler') != -1) return true;
		if (t.search('→Penentang') != -1) return true;
		if (t.search('→Soupeři') != -1) return true;
		if (t.search('→Оппоненты') != -1) return true;
		if (t.search('→Protivnici') != -1) return true;
		if (t.search('→Vastustajille') != -1) return true;
		if (t.search('→Motståndare') != -1) return true;
		return false;
	}
	
	
	
	/**
	 * @ignore
	 * match vulnerability and seat conditions in text
	 * @param {*} v 
	 * @param {*} V 
	 * @param {*} s 
	 * @param {*} t 
	 */
	function matchVulSeat(v, V, s, t) {
		// set option only during the first round of bidding
		if (s == '') return '';
		// Check if seat dependence specified
		if ((t.indexOf('@1') > 0) || (t.indexOf('@2') > 0) || (t.indexOf('@3') > 0) || (t.indexOf('@4') > 0)) {
			if (t.indexOf(s) == -1) return 'N';
		}
		// Check if our vulnerability dependence specified
		if ((t.indexOf('@n') > 0) || (t.indexOf('@v') > 0)) {
			if (t.indexOf(v) == -1) return 'N';
		}
		// Check if their vulnerability dependence specified
		if ((t.indexOf('@N') > 0) || (t.indexOf('@V') > 0)) {
			if (t.indexOf(V) == -1) return 'N';
		}
		return 'Y';
	}
	
	/**
	 * Check if element e is visible
	 */
	function isVisible(e) {
		if (e == null) return false;
		if (e == undefined) return false;
		return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
	}
	
	/**
	 * get formatted actual date and time
	 * if secs=true resultion up to seconds
	 */
	function getNow(secs) {
		var now = new Date();
		var yyyy = now.getFullYear().toString();
		var m = now.getMonth() + 1;
		var mm = m.toString();
		if (mm.length == 1) mm = '0' + mm;
		var dd = now.getDate().toString();
		if (dd.length == 1) dd = '0' + dd;
		var hh = now.getHours().toString();
		if (hh.length == 1) hh = '0' + hh;
		var mn = now.getMinutes().toString();
		if (mn.length == 1) mn = '0' + mn;
		if (!secs) return yyyy + mm + dd + "_" + hh + ":" + mn;
		var ss = now.getSeconds().toString();
		if (ss.length == 1) ss = '0' + ss;
		return yyyy + mm + dd + "_" + hh + ":" + mn + ":" + ss;
	}
	
	/**
	 * elimine spaces and tabs from string str
	 */
	function elimine2Spaces(str) {
		var s = str.replace(/\t+/g, ' ');
		s = s.replace(/\u0020\u0020+/g, ' ');
		return s;
	}
	
	
	// Elimine spaces and tabs
	function elimineSpaces(str) {
		var s = str.replace(/\s+/g, '');
		s = s.replace(/\t+/g, '');
		return s;
	}
	
	/**
	 * @ignore
	 */
	function readFromClipboard(callback) {
		navigator.clipboard.readText().then((cbData) => {
			callback(cbData);
		});
	}
	
	/**
	 * copy string txt to the clipboard
	 */
	function writeToClipboard(txt) {
		navigator.clipboard.writeText(txt).then(function () { }, function () { });
	}
	
	/**
	 * Strip context ctx from leading passes
	 */
	function stripContext(ctx) {
		if (ctx.startsWith('------')) return ctx.substr(6);
		if (ctx.startsWith('----')) return ctx.substr(4);
		if (ctx.startsWith('--')) return ctx.substr(2);
		return ctx;
	}
	
	/**
	 * @ignore
	 */
	function decodeOption(opt) {
		if (opt.length != 2) return opt;
		optText = '';
		if (opt.slice(0, 1) == '1') optText = optText + '@1';
		if (opt.slice(0, 1) == '2') optText = optText + '@2';
		if (opt.slice(0, 1) == '3') optText = optText + '@3';
		if (opt.slice(0, 1) == '4') optText = optText + '@4';
		if (opt.slice(0, 1) == '5') optText = optText + '@1@2';
		if (opt.slice(0, 1) == '6') optText = optText + '@3@4';
		if (opt.slice(1, 2) == '1') optText = optText + '@n@N';
		if (opt.slice(1, 2) == '2') optText = optText + '@v@N';
		if (opt.slice(1, 2) == '3') optText = optText + '@n@V';
		if (opt.slice(1, 2) == '4') optText = optText + '@v@V';
		if (opt.slice(1, 2) == '5') optText = optText + '@n';
		if (opt.slice(1, 2) == '6') optText = optText + '@v';
		if (opt.slice(1, 2) == '7') optText = optText + '@N';
		if (opt.slice(1, 2) == '8') optText = optText + '@V';
		return optText;
	}
	
	/**
	 * @ignore
	 */
	function translateCall(call) {
		if (call == 'D') return 'Db';
		if (call == 'Dbl') return 'Db';
		if (call == 'Ktr.') return 'Db';
		if (call == 'Ktr') return 'Db';
		if (call == 'ктр') return 'Db';
		if (call == 'X') return 'Db';
		if (call == 'Rktr') return 'Rd';
		if (call == 'рктр') return 'Rd';
		if (call == 'Rdbl') return 'Rd';
		if (call == 'RD') return 'Rd';
		if (call == 'XX') return 'Rd';
		if (call == 'p') return '--';
		if (call == 'P') return '--';
		if (call == 'Pass') return '--';
		if (call == 'Pas') return '--';
		if (call == 'Paso') return '--';
		if (call == 'пас') return '--';
		el = call;
		if (el.length > 1) {
			el = el.substr(0, 2);
			if (el.charCodeAt(1) == 9827) {
				return el[0] + 'C';
			}
			if (el.charCodeAt(1) == 9830) {
				return el[0] + 'D';
			}
			if (el.charCodeAt(1) == 9829) {
				return el[0] + 'H';
			}
			if (el.charCodeAt(1) == 9824) {
				return el[0] + 'S';
			}
			return el[0] + 'N';
		}
		return el;
	}
	
	/**
	 * get seat number tag of the openeer
	 */
	function getSeatNr() {
		var c = getContext();
		if (c.startsWith('------')) return '@4';
		if (c.startsWith('----')) return '@3';
		if (c.startsWith('--')) return '@2';
		return '@1';
	}
	
	/**
	 * Get actual bidding context
	 */
	function getContext() {
		var nd;
		if ((nd = getNavDiv()) == null) return '??';
		var ctx = '';
		var bs = nd.querySelector('bridge-screen');
		if (bs == null) {
			return "??";
		}
		var auctionBox = nd.querySelector('auction-box');
		if (auctionBox == null) {
			return "??";
		}
		var auction = auctionBox.querySelectorAll('.auction-cell');
		if (auction.length == 0) {
			return "";
		}
		for (var i = 0; i < auction.length; i++) {
			el = translateCall(auction[i].textContent);
			ctx = ctx + el;
			//	Translate Double, Redouble and Pass from different language interfaces
		}
		return ctx;
	}
	
	
	/**
	 * @ignore
	 */
	function matchContextOld(refContext, actContext) {
		if (refContext == actContext) return true;
		if (refContext.length != actContext.length) return false;
		for (var j = 0; j < refContext.length; j++) {
			if (refContext.substr(j, 1) == '_') continue;
			if (refContext.substr(j, 1) == '*') continue;
			if (refContext.substr(j, 1) != actContext.substr(j, 1)) return false;
		}
		return true;
	}
	
	/**
	 * Check if actual bidding context matches refeence context from the table
	 */
	function matchContext(refContext, actContext) {
		var re;
		try {
			if (refContext.startsWith('/') && refContext.endsWith('/')) {
				re = new RegExp(refContext.slice(1, refContext.length - 1));
				return re.test(actContext);
			}
			if (refContext.startsWith('/')) {
				var idx_dollar = refContext.indexOf("$");
				var ref = refContext.replaceAll("\/", "").replaceAll("$", "");
				if (idx_dollar != -1) ref = ref + "$";
				re = new RegExp(ref);
				return re.test(actContext);
			}
			if (matchContextOld(refContext, actContext)) return true;
			var ref = refContext.replace(/\*/g, '.');
			ref = ref.replace(/_/g, '.');
			ref = '^' + ref + '$';
			re = new RegExp(ref);
			if (!re.test(actContext)) return false;
			return (actContext.match(re)[0].length == actContext.length);
		} catch {
			return false;
		}
	}
	
	
	/**
	 * @ignore
	 */
	function clearOptionsSelector() {
		var optionsSelector = document.getElementById('bboalert-ds');
		if (optionsSelector == null) return;
		for (var i = optionsSelector.options.length; i > 2; i--) {
			optionsSelector.remove(i);
		}
		optionsSelector.selectedIndex = 0;
	}
	
	function saveRecentURL() {
		var fileSelector = document.getElementById("bboalert-menu-file");
		if (fileSelector == null) return;
		var txt = "";
		for (var i = 9; i < fileSelector.options.length; i++) {
			txt = txt + fileSelector.options[i].label + "," + fileSelector.options[i].value + "\n";
		}
		window.localStorage.setItem("BBOAlertRecentURL", txt);
	}
	
	function loadRecentURL() {
		var fileSelector = document.getElementById("bboalert-menu-file");
		if (fileSelector == null) return;
		var txt = "";
		for (let i = fileSelector.options.length - 1; i >= 9; i--) {
			fileSelector.options.remove(i);
		}
		txt = window.localStorage.getItem("BBOAlertRecentURL");
		if (txt == null) return;
		var t = txt.split("\n");
		for (let i = 0; i < t.length; i++) {
			let r = t[i].split(",");
			if (DEBUG) console.log(i + " " + r[0] + " " + r[1]);
			if (r[0] == "") continue;
			importedURL = r[1];
			addRecentURL(r[0], r[1]);
		}
	}
	
	
	function clearRecentURL() {
		var fileSelector = document.getElementById("bboalert-menu-file");
		if (fileSelector == null) return;
		for (var i = fileSelector.options.length - 1; i >= 9; i--) {
			fileSelector.options.remove(i);
		}
		saveRecentURL();
		$(fileSelector.options[8]).hide();
		addBiddingScenariosURL();
	}
	
	function addBiddingScenariosURL() {
		importedURL = "https://raw.githubusercontent.com/ADavidBailey/Practice-Bidding-Scenarios/main/-PBS.txt";
		addRecentURL("Bidding Scenarios", importedURL);
	}
	
	function addRecentURL(label, url) {
		var fileSelector = document.getElementById("bboalert-menu-file");
		if (fileSelector == null) return;
		if (label == "") return;
		if (url == "") return;
		if (makeDirectLink(importedURL) != url) return;
		var lbl = label.replaceAll("<br>", "");
		lbl = lbl.replaceAll("<b>", "");
		lbl = lbl.replaceAll("</b>", "");
		for (var i = 9; i < fileSelector.options.length; i++) {
			if (fileSelector.options[i].value == url) {
				fileSelector.options.remove(i);
			}
		}
		var opt = new Option(lbl, url);
		opt.style.backgroundColor = "LightGray";
		fileSelector.add(opt, 9);
		$(fileSelector.options[8]).show();
		saveRecentURL();
	}
	
	function isSettingON(idx) {
		var sm = $("#bboalert-menu-settings")[0];
		if (idx >= sm.options.length) return false;
		return sm.options[idx].textContent.startsWith(CHECKED_CHAR);
	}
	
	function saveSettings() {
		var sm = $("#bboalert-menu-settings")[0];
		// Save settings to cache
		var s = '';
		for (var i = 1; i < sm.options.length; i++) {
			if (sm.options[i].textContent.startsWith(CHECKED_CHAR)) s = s + 'Y';
			else s = s + 'N';
		}
		localStorage.setItem("BBOalertSettings", s);
	}
	
	function restoreSettings() {
		var s = localStorage.getItem('BBOalertSettings');
		if (s == null) s = "NNNN"
		var sm = $("#bboalert-menu-settings")[0];
		for (var i = 0; i < s.length; i++) {
			if (s.charAt(i) == 'Y')
				if (!sm.options[i + 1].textContent.startsWith(CHECKED_CHAR))
					sm.options[i + 1].textContent = CHECKED_CHAR + sm.options[i + 1].textContent;
			if (s.charAt(i) == 'N')
				if (sm.options[i + 1].textContent.startsWith(CHECKED_CHAR))
					sm.options[i + 1].textContent = sm.options[i + 1].textContent.slice(1);
		}
		hideUnusedOptions();
	}
	
	/**
	 * display text on the BBOalert blue panel
	 */
	function bboalertLog(txt) {
		var p1 = document.getElementById('bboalert-p1');
		if (p1 == null) return;
		p1.innerHTML = '';
		p1.innerHTML = txt;
	}
	
	function addBBOalertLog(txt) {
		var p1 = document.getElementById('bboalert-p1');
		if (p1 == null) return;
		p1.innerHTML = p1.innerHTML + txt;
	}
	
	
	/**
	 * @ignore
	 */
	function documentOnKeyup(key) {
		if (key.altKey) {
			setChatMessage('Alt' + key.key.toUpperCase(), true);
			sendChat();
		}
	}
	
	
	/**
	 * @ignore
	 */
	function getPartnerAlert() {
		var partnerContext = getContext().slice(0, -4);
		var partnerCall = getContext().slice(-4, -2);
		return findAlert(partnerContext, partnerCall);
	}
	
	
	
	/**
	 * sen chat text to both opponents
	 */
	function sendMessageToOpponents(text) {
		sendPrivateChat(myOpponent(true), text);
		sendPrivateChat(myOpponent(false), text);
	}
	
	/**
	 * reverse characters in the strin
	 */
	function reverseString(str) {
		return str.split("").reverse().join("");
	}
	
	/**
	 * make element draggeable
	 */
	function dragElement(elmnt) {
		var pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0;
		if (document.getElementById(elmnt.id + "header")) {
			// if present, the header is where you move the DIV from:
			document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
		} else {
			// otherwise, move the DIV from anywhere inside the DIV:
			elmnt.onmousedown = dragMouseDown;
		}
	
	
		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}
	
		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// set the element's new position:
			elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
			elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		}
	
		function closeDragElement() {
			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}
	
	}
	
	function getBBOalertHeader(data) {
		var txt = '';
		var scan = new BBOalertData();
		scan.setData(data);
		while ((txt = scan.getNextLine()) != null) {
			var rec = txt.split(",");
			if (rec.length > 1) {
				if (rec[0].trim().toUpperCase().indexOf('BBOALERT') != -1) {
					if (rec[0].trim() != '') {
						return rec[1].trim();
					}
				}
			}
		}
		return "";
	}
	
	function updateAlertDataAsync(at, callback) {
		function findURL(url, parent) {
			var idx = parent;
			if (parent == -1) return false;
			while (idx != -1) {
				if (urls[idx] == url) return true;
				idx = parents[idx];
			}
			return false;
		}
	
		function addrecs(txt, to, parent) {
			if (txt != null) {
				var ti = txt.split('\n');
				ti.forEach((element) => {
					var r = element.split(',');
					var last = to.length;
					to.push(element);
					var r0 = r[0].trim();
					if ((r0 == 'Import') || (r0 == 'Javascript') || (r0 == '//Javascript')) {
						if (r.length == 1) return;
						if (r.length == 2) {
							var r1 = r[1].trim();
							if (!r1.startsWith("https:")) {
								r2 = URLmap.get(r1);
								if (r2 == undefined) return;
								r[1] = r2;
							}
						}
						if (r.length > 2) {
							URLmap.set(r[1].trim(), r[2].trim());
							return;
						}
						urlOriginal = r[1].trim();
						var url = makeDirectLink(urlOriginal);
						if (findURL(url, parent)) {
							if (DEBUG) console.log('Error : circular reference :');
							if (DEBUG) console.log('to  ' + url);
							if (DEBUG) console.log('in  ' + urls[parent]);
						} else {
							if (DEBUG) console.log(' Reading ' + url);
							urls.push(url);
							parents.push(parent);
							var myIdx = urls.length - 1;
							pending++;
							fetchWebData(url, function (data) {
								if (DEBUG) console.log('Done    ' + url);
								data = HTMLpage2text(data, url, urlOriginal);
								if (DEBUG) console.log('Header  ' + getBBOalertHeader(data));
								addRecentURL(getBBOalertHeader(data), url);
								if (data != '') {
									if (r0 == 'Import') {
										to[last] = [];
										addrecs(data, to[last], myIdx);
									} else {
										to[last] = [];
										JS = data;
										eval(data);
										addrecs("**//Javascript," + url, to[last], myIdx);
									}
								}
							},
								function (error) {
									if (DEBUG) console.log('Error  ' + error + ' ' + url);
									addBBOalertLog('<br>Error<br>' + error + ' ' + url);
									addBBOalertLog('<br>Export Log<br>');
									to[last] = [];
									addrecs(('Error\n' + error + ' ' + url), to[last]);
								});
						}
					}
				});
			}
			pending--;
			if (pending == 0) {
				//			console.timeEnd("Read time");
				timer = Date.now() - timer;
				if (DEBUG) console.log('Total ' + tab.flat(999).length + ' records in ' + timer / 1000 + " secs");
				alertData = parseMarkdown(tab.flat(999).join('\n'));
				callback();
			}
		}
		var tab = [];
		var urls = [];
		var URLmap = new Map();
		var parents = [];
		var pending = 1;
		var timer = Date.now();
		initBBOalertEvents();
		initInfoSelector();
		clearConfigMenu();
		PluginInit();
		addrecs(at, tab, -1);
	}
	
	
	
	function shiftChars(s, d) {
		var s1 = s.split('');
		for (var i = 0; i < s1.length; i++) {
			s1[i] = String.fromCharCode(s1[i].charCodeAt(0) + d);
		}
		return s1.join('');
	}
	
	function loadScript(url) {
		var url1 = makeDirectLink(url);
		if (DEBUG) console.log('Load JS ' + url1);
		var script = document.createElement('script');
		script.src = url1;
		script.type = "text/javascript";
		var head = document.getElementsByTagName("head")[0];
		head.appendChild(script);
	}
	
	function isAutoShortcutsEnabled() {
		return isSettingON(1);
	}
	
	function isCollapseOptionsEnabled() {
		return isSettingON(4);
	}
	
	function isHoverTopEnabled() {
		return isSettingON(2);
	}
	
	function isHoverEnabled() {
		return isSettingON(3);
	}
	
	
	function initBBOalertEvents() {
		var ue = document.body.querySelector("bboalert-events");
		if (ue != null) ue.parentNode.removeChild(ue);
		ue = document.createElement("bboalert-events");
		document.body.appendChild(ue);
		ue = document.body.querySelector("bboalert-events");
		return ue;
	}
	
	
	function addBBOalertEvent(ev, fn) {
		var ue = BBOalertEvents();
		ue.addEventListener(ev, fn, false);
	}
	
	function BBOalertEvents() {
		var ue = document.body.querySelector("bboalert-events");
		if (ue == null) ue = initBBOalertEvents();
		return ue;
	}
	
	
	function beep(f, d) {
		var context = new window.AudioContext();
		var osc = context.createOscillator();
		osc.type = 'square';
		osc.frequency.value = f;
		osc.connect(context.destination);
		osc.start();
		osc.stop(context.currentTime + d);
	}
	
	function openDropbox(url) {
		window.open(url, '', 'width=100,height=100');
	}
	
	function toggleAlertList(el, expandTree) {
		function ulLevel(ul) {
			if (ul.tagName.toLowerCase() != "ul") return -1;
			try {
				return parseInt(ul.classList[1].split("-")[2]);
			} catch {
				return -1;
			}
		}
		var l = $("p,li");
		for (let i = 0; i < l.length; i++) {
			l[i].itemNr = i;
			l[i].level = ulLevel(l[i].parentNode);
		}
		var l0 = el.level;
		var l1 = l[el.itemNr + 1].level;
		//    if (l0 < 0) return;
		var treeVisible = $(l[el.itemNr + 1]).is(":visible");
		for (let i = el.itemNr + 1; i < l.length; i++) {
			if ((l[i].level <= l0) || i == (l.length - 1)) {
				for (let i = 0; i < l.length - 1; i++) {
					if ($(l[i]).is(":visible") && $(l[i + 1]).is(":hidden")) {
						$(l[i]).css("background-color", COLLAPSED_BG_COLOR);
						$(l[i]).children().css("background-color", COLLAPSED_BG_COLOR);
						//					l[i].style.color = COLLAPSED_TEXT_COLOR;
					} else {
						$(l[i]).css("background-color", "");
						$(l[i]).children().css("background-color", "");
					}
				}
				return false;
			}
			if (treeVisible) {
				if (l[i].level > l0) {
					$(l[i]).hide();
				}
			} else {
				if ((l[i].level == l1) || expandTree) {
					$(l[i]).show();
				}
			}
	
		}
	}
	
	
	function replaceSuitSymbolsInRecord(r) {
		var rx = r.split(",");
		if (rx.length < 3) return r;
		switch (rx[0].trim()) {
			case "Option":
				return r;
			case "Import":
				return r;
			case "Alias":
				return r;
			case "Button":
				rx[2] = replaceSuitSymbols(rx[2], "!");
				break;
			case "Shortcut":
				rx[2] = replaceSuitSymbols(rx[2], "!");
				break;
			default:
				rx[0] = replaceSuitSymbols(rx[0], "");
				rx[1] = replaceSuitSymbols(rx[1], "");
				rx[2] = replaceSuitSymbols(rx[2], "!");
				break;
		}
		return rx.join(",");
	}
	
	function replaceSuitSymbols(txt, prefix) {
		var t = txt;
		t = t.replace(/♣/g, prefix + "C");
		t = t.replace(/♧/g, prefix + "C"); // white clubs
		t = t.replace(/♦/g, prefix + "D");
		t = t.replace(/♢/g, prefix + "D"); // white diamonds
		t = t.replace(/♥/g, prefix + "H");
		t = t.replace(/♡/g, prefix + "H"); // white hearts
		t = t.replace(/♠/g, prefix + "S");
		t = t.replace(/♤/g, prefix + "S"); // white spades
		if (prefix == '') t = t.replace(/NT/g, prefix + "N");
		return t;
	}
	
	userScriptMap = new Map();
	function setUserScript(n, f) {
		userScriptMap.set(n, f);
	}
	
	function getUserScript(n) {
		var f = userScriptMap.get(n);
		if (f == undefined) return function () { return "not_found"; };
		else return f;
	}
	
	function scriptArg(S) {
		var i1 = S.indexOf("\(");
		var i2 = S.indexOf("\)");
		if (i1 == -1) return "";
		if (i2 < i1) return "";
		return S.slice(i1 + 1, i2);
	}
	
	function BBOcontext() {
		if (document.title != 'Bridge Base Online') return window.parent.document;
		return document;
	}
	
	function parseMarkdown(data) {
		var txtTable;
		var recList = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
		txtTable = data.split("\n");
		var txt = "";
		var lvl = 0;
		txtTable.forEach(function (l) {
			var l1 = l.replaceAll("\t", "    ").replace("*", "-");
			if (l1.trim().startsWith("- ") && ((l1.indexOf("-") % 4) == 0)) {
				lvl = l1.indexOf("-") / 4 + 1;
				var t = elimine2Spaces(l.trim().substr(1).trim());
				t = t.split("\n")[0];
				var i0 = t.indexOf(" ");
				t0 = t.substr(0, i0);
				t1 = t.substr(i0 + 1);
				var oppsBid = "--";
				if (t0.split(",").length > 1) {
					oppsBid = t0.split(",")[0];
					t = t0.split(",")[1] + "," + t1;
				} else {
					t = t0 + "," + t1;
				}
				t = elimineSpaces(recList[lvl - 1].split(",")[0] + recList[lvl - 1].split(",")[1] + oppsBid + ",") + t;
				recList[lvl] = t;
				txt = txt + t + "\n";
			} else {
				lvl = 0;
				txt = txt + l.trim() + "\n";
				recList[lvl] = elimine2Spaces(l.trim()) + ",,";
			}
		});
		var tr = txt.split("\n");
		for (let i = 0; i < tr.length; i++) {
			tr[i] = replaceSuitSymbolsInRecord(tr[i]);
		}
		return tr.join("\n");
	}
	
	function replaceSpacesByUnderscore(txt) {
		var txt1 = txt.replace(/ /g, '_').slice(0, 40);
		while (txt1.length < 40) txt1 = txt1 + '_';
		return txt1;
	}
	
	function decodeEntities(encodedStr) {
		if (!encodedStr) return '';
		return $.parseHTML(encodedStr)[0].textContent;
	}
	
	$.fn.onAny = function (cb) {
		for (var k in this[0])
			if (k.search('on') === 0)
				this.on(k.slice(2), function (e) {
					// Probably there's a better way to call a callback function with right context, $.proxy() ?
					cb.apply(this, [e]);
				});
		return this;
	};
	
	function downloadTextAsFile(text, fileName) {
		var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
		// 1. Create a Blob URL
		var url = URL.createObjectURL(blob);
	
		// 2. Create a link element
		var a = document.createElement('a');
	
		// 3. Set attributes
		a.href = url;
		a.download = fileName;
		a.style.display = 'none'; // Hide the link
	
		// Append to body (necessary for a.click() to work in some browsers)
		document.body.appendChild(a);
	
		// 4. Trigger click
		a.click();
	
		// 5. Clean up - Remove the element and revoke the URL
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// ==========================================================================
	// vendored: src/iframe/BBO_DOM.js
	// ==========================================================================
	/**
	 * click OK button programatically
	 */
	function clickOK() {
		setTimeout(function () {
			$(".biddingBoxButtonClass:eq(16)", PWD).trigger("click");
		}, 300);
	}
	
	/**
	 * when OK button appears, click it programatically
	 */
	function confirmBid() {
		var n = 0;
		var t = setInterval(function () {
			n++;
			if (n > 100) clearInterval(t);
			if (buttonOKvisible()) {
				clearInterval(t);
				if (trustedBid) {
					clickOK();
				}
			}
		}, 10);
	}
	
	/**
	 * get main BBO panel div element
	 * @returns div element
	 */
	function getNavDiv() {
		$("#navbar-menu-dropdown-content", PWD).css("z-index", "5001");
		return PWD.getElementById('navDiv');
	}
	/**
	 * returns div element containing chat dialog
	 */
	function getChatDiv() {
		return PWD.getElementById('chatDiv');
	}
	
	/**
	 * returns current BBO user-id
	 */
	function whoAmI() {
		return localStorage.getItem('userID');
	}
	
	/**
	 * @ignore
	 */
	function myDirection() {
		return mySeat();
	}
	
	/**
	 * retrieve my direction from the auction box 'S' 'W' 'N' 'E' or '' if not found
	 */
	function mySeat() {
		return $('.auction-box-header-cell:eq(3)', getNavDiv()).text().trim().slice(0, 1);
	}
	
	function partnerSeat() {
		return $('.auction-box-header-cell:eq(1)', getNavDiv()).text().trim().slice(0, 1);
	}
	
	/**
	 * retrieve our vulnerability tag
	 */
	function ourVulnerability() {
		var vultab = ["", "NS", "EW", "NSEW", "NS", "EW", "NSEW", "", "EW", "NSEW", "", "NS", "NSEW", "", "NS", "EW"];
		var sd = getDealNumber();
		if (sd == '') return '';
		var nd = parseInt(sd);
		if (isNaN(nd)) return '';
		if (nd < 1) return '';
		nd = (nd - 1) % 16;
		if (vultab[nd].includes(mySeat())) return '@v';
		return '@n';
	}
	
	
	/**
	 * check if confirm bids switch is ON
	 * returns 'Y' or 'N'
	 */
	function confirmBidsSet() {
		return localStorage.getItem(whoAmI() + "_confirm_bids") === "y" ? 'Y' : 'N';
	}
	
	/**
	 * check if keyboard entry switch is ON
	 * returns 'Y' or 'N'
	 */
	function keyboardEntrySet() {
		return localStorage.getItem(whoAmI() + "_keyboard_entry") === "y" ? 'Y' : 'N';
	}
	
	/**
	 * check if account setting switch is ON
	 * returns 'Y' 'N' or '' if not found
	 */
	function accountSettingsSet(idx) {
		switch ($($("settings-list ion-toggle", PWD).get(idx)).attr("aria-checked")) {
			case "false":
				return 'N';
			case "true":
				return 'Y';
			default:
				return '';
		}
	}
	
	/**
	 * return true if OK button is visible
	 */
	function buttonOKvisible() {
		return (!$("#navDiv .biddingBoxClass button:eq(16):visible", PWD).length == 0);
	}
	
	/**
	 * return true if OK button is pressed (mouse down)
	 */
	function buttonOKpressed() {
		return ($("#navDiv .biddingBoxClass button:eq(16):visible", PWD).hasClass("cdk-focused"));
	}
	
	/**
	 * display BBOalert panel if on=true. Otherwise hide it
	 */
	function setOptions(on) {
		setTabEvents();
		var adPanel0 = parent.document.getElementById("adpanel0");
		if (adPanel0 == null) return;
		if (on) {
			$("#rightDiv .verticalTabBarClass tab-bar-button", parent.document).not("#bboalert-tab").find(".verticalClass").addClass("covered");
			adPanel0.style.display = 'block';
			if (adPanel0.getBoundingClientRect().width < 350) {
				triggerDragAndDrop('.hDividerClass', '.hDividerClass', (adPanel0.getBoundingClientRect().width) - 400);
			}
		} else {
			$("#rightDiv .verticalTabBarClass tab-bar-button", parent.document).not("#bboalert-tab").find(".verticalClass").removeClass("covered")
			adPanel0.style.display = 'none';
		}
		if (on) {
			$("#bboalert-tab .verticalClass", PWD).css("background-color", "rgb(49, 96, 191)").css("color", "white")
		} else {
			$("#bboalert-tab .verticalClass", PWD).css("background-color", "white").css("color", "black")
		}
	}
	
	/**
	 * @ignore
	 */
	function addBBOalertTab() {
		if (parent.document.getElementById('bboalert-tab') != null) return;
		var rd = parent.document.getElementById('rightDiv');
		if (rd == null) return;
		var vt = rd.querySelector('.verticalTabBarClass');
		if (vt == null) return;
		var tabs = vt.children;
		if (tabs == null) return;
		if (tabs.length < 2) return;
		var t = tabs[1].cloneNode(true);
		t.querySelector('.verticalClass').textContent = 'BBOalert';
		t.id = 'bboalert-tab';
		t.onclick = toggleOptions;
		t.style.color = 'white';
		t.style.display = "none";
		t.backgroundColor = 'red';
		vt.appendChild(t);
		t = parent.document.getElementById('bboalert-tab');
		t.onclick = toggleOptions;
	}
	
	/**
	 * retrieve our vulnerability tag from the auction box
	 */
	function areWeVulnerable() {
		if (mySeat() == '') return '';
		if ($('.auction-box-header-cell:eq(3)', getNavDiv()).hasClass("vulnerable")) return '@v';
		return '@n';
	}
	
	/**
	 * retrieve opponent's vulnerability tag from the auction box
	 */
	function areTheyVulnerable() {
		if (mySeat() == '') return '';
		if ($('.auction-box-header-cell:eq(2)', getNavDiv()).hasClass("vulnerable")) return '@V';
		return '@N';
	}
	
	/**
	 * retrieve current board number
	 */
	function getDealNumber() {
		return $('.vulPanelInnerPanelClass', getNavDiv()).text().trim();
	}
	
	/**
	 * @ignore
	 */
	function setTitle(txt) {
		t = parent.document.querySelectorAll('div.titleSpanClass');
		if (t.length == 0) return;
		for (var i = 0; i < t.length; i++) {
			t[i].textContent = txt;
		}
	}
	
	/**
	 * @ignore
	 */
	function setTitleText(txt) {
		t = parent.document.querySelector('.titleClass');
		if (t == null) return;
		if (isVisible(t)) {
			t.innerText = '';
			setTimeout(function () {
				t.innerText = txt;
			}, 500);
			return;
		}
		t = parent.document.querySelectorAll('div.titleSpanClass');
		if (t.length == 0) return;
		for (var i = 0; i < t.length; i++) {
			t[i].textContent = '';
			setTimeout(function () {
				t[i].textContent = txt;
			}, 500);
		}
	}
	
	/**
	 * retrieve visible chat input element
	 */
	function getVisibleMessageInput() {
		return $(".messageInputClass:visible", getChatDiv()).get(0)
	}
	
	/**
	 * send chat message programatically
	 */
	function sendChat() {
		cr = parent.document.querySelectorAll('.chatRowClass');
		if (cr.length == 0) return;
		var elMessage = getChatInput();
		if (elMessage == null) return;
		cb = getChatSendButton(elMessage);
		if (cb == null) return;
		if (!isVisible(cb)) return;
		cb.click();
	}
	
	/**
	 * send call explanation chat message programatically
	 */
	function sendAlertChat() {
		var elMessage = getChatInput();
		if (elMessage == null) return;
		cb = getChatSendButton(elMessage);
		if (cb == null) return;
		var msgList = replaceSuitSymbols(getChatMessage(), "!").split("<br>");
		var eventInput = new Event('input');
	
		var i = 0;
		var it = setInterval(function () {
			if (i == msgList.length) {
				elMessage.value = "";
				elMessage.dispatchEvent(eventInput);
				clearInterval(it);
			} else {
				elMessage.value = msgList[i];
				elMessage.dispatchEvent(eventInput);
				cb.click();
			}
			i++;
		}, 100);
	}
	
	/**
	 * send chat message text to msg
	 * If send=true send it immediately
	 */
	function setChatInputMessage(msg, send, elMessage) {
		var eventInput = new Event('input');
		if (elMessage == null) return;
		msgList = msg.split(/\\n/);
		if (msgList.length == 1) {
			elMessage.value = msg;
			elMessage.dispatchEvent(eventInput);
			return;
		}
		if (send) {
			for (i = 0; i < msgList.length; i++) {
				elMessage.value = msgList[i];
				elMessage.dispatchEvent(eventInput);
				if (i < msgList.length - 1) sendChat();
			}
		} else { }
	}
	
	/**
	 * send chat message text to msg
	 * If send=true send it immediately
	 */
	function setInputMessage(msg, send, elMessage) {
		if (DEBUG) console.log("setInputMessage 1 " + msg);
		var eventInput = new Event('input');
		if (elMessage == null) return;
		var msgList = msg.split(/\\n/);
		var sb = getChatSendButton(elMessage);
		// if not chat messaqge set text
		if (DEBUG) console.log("setInputMessage sb " + sb);
		if (sb == null) {
			elMessage.value = msgList[0];
			elMessage.dispatchEvent(eventInput);
			return;
		}
		// if only one line set the message text and send if send flag set
		if (msgList.length == 1) {
			elMessage.value = msg;
			elMessage.dispatchEvent(eventInput);
			if (send) sb.click();
			return;
		}
		// multiline message : send all except the last if no send flag
		var i = 0;
		ti = setInterval(() => {
			if (DEBUG) console.log("setInputMessage 2 " + msgList[i]);
			elMessage.value = msgList[i];
			elMessage.dispatchEvent(eventInput);
			if (i < msgList.length - 1) sb.click();
			else {
				if (send) sb.click();
				clearInterval(ti);
			}
			i++;
		}, 100);
	}
	
	/**
	 * send chat message text to msg
	 * If send=true send it immediately
	 */
	function setChatMessage(msg, send) {
		var eventInput = new Event('input');
		var elMessage = getVisibleMessageInput();
		if (elMessage == undefined) return;
		msgList = msg.split(/\\n/);
		if (msgList.length == 1) {
			elMessage.value = msg;
			elMessage.dispatchEvent(eventInput);
			return;
		}
		if (send) {
			for (i = 0; i < msgList.length; i++) {
				elMessage.value = msgList[i];
				elMessage.dispatchEvent(eventInput);
				if (i < msgList.length - 1) sendChat();
			}
		} else {
	
		}
	}
	
	/**
	 * retrieve actual chat message input text
	 */
	function getChatMessage() {
		var elMessage = getVisibleMessageInput();
		if (elMessage == undefined) return '';
		return elMessage.value;
	}
	
	/**
	 * retrieve bidding box element
	 */
	function getBiddingBox() {
		var bb = $("#navDiv .biddingBoxClass", PWD).get(0);
		if (bb == undefined) return null;
		return bb;
	}
	
	/**
	 * retrieve call explain box element
	 */
	function getExplainCallBox() {
		if ((nd = getNavDiv()) == null) return null;
		return nd.querySelector(".explainCallClass");
	}
	
	function getDealEndPanel() {
		if ((nd = getNavDiv()) == null) return null;
		return nd.querySelector(".deal-end-panel");
	}
	
	/**
	 * set explain call box input text
	 */
	function setExplainCallText(txt) {
		var elExplainCallBox = getExplainCallBox();
		if (!isVisible(elExplainCallBox)) return;
		var elInput = elExplainCallBox.querySelector('input');
		if (elInput == null) return;
		var txtar = txt.split("#");
		if (txtar.length == 1) {
			if (txt.length > 39) {
				txtar = ("See chat#" + txt).split("#");
			}
		}
		elInput.value = txtar[0];
		var eventInput = new Event('input');
		elInput.dispatchEvent(eventInput);
		if (txtar.length > 1) {
			setChatMessage(txtar[1]);
		}
	}
	
	function getExplainCallAlert() {
		var b = translateCall($(".headingClass", getExplainCallBox()).text().split(" ").at(-1));
		var c = getContext().substring(0, getContext().indexOf(b));
		return alertHistoryMap.get(c + b);
	}
	
	/**
	 * retrieve explain call box text input element
	 */
	function getExplainCallInput() {
		var elExplainCallBox = getExplainCallBox();
		if (elExplainCallBox == null) return null;
		return elExplainCallBox.querySelector('input');
	}
	
	/**
	 * retrieve bidding box text input element
	 */
	function getExplainInput() {
		var bbox = getBiddingBox();
		if (bbox == null) return null;
		if (!isVisible(bbox)) return null;
		return bbox.querySelector(".mat-form-field-infix").querySelector('input');
	}
	
	/**
	 * retrieve chat text input element
	 */
	function getChatInput() {
		var cd = parent.document.getElementById('chatDiv');
		if (cd == null) return null;
		return cd.querySelector(".messageInputClass");
	}
	
	/**
	 * set bidding box explanation text
	 */
	function setExplainText(txt) {
		var elAlertExplain = getExplainInput();
		if (elAlertExplain == null) return;
		elAlertExplain.value = txt;
		var eventInput = new Event('input');
		elAlertExplain.dispatchEvent(eventInput);
	}
	
	/**
	 * @ignore
	 */
	function isSplitScreen() {
		return localStorage.getItem(whoAmI() + "_general_split") === "y" ? 'true' : 'false';
	}
	
	/**
	 * @ignore
	 */
	function isAdBlockerOn() {
		app = parent.document.getElementById('bbo_app');
		return (app.style.left == "0px");
	}
	
	/**
	 * @ignore
	 */
	function setStatTextDiv() {
		if (parent.document.getElementById('statText') != null) return;
		var st = parent.document.createElement('div');
		st.style.height = '100%';
		st.id = 'statText';
		st.textContent = 'BBOalert';
		is = parent.document.querySelector('.infoStat');
		isp = is.parentNode;
		isp.insertBefore(st, isp.firstChild);
	}
	
	/**
	 * @ignore
	 */
	function setStatText(txt) {
		var st = parent.document.getElementById('statText');
		if (st == null) return;
		st.textContent = txt;
		if (txt != '') {
			st.style.backgroundColor = 'coral';
		} else {
			st.style.backgroundColor = '#e7eaed';
		}
	}
	
	/**
	 * @ignore
	 */
	function setTabEvents() {
		var rd = parent.document.getElementById('rightDiv');
		if (rd == null) return;
		var vt = rd.querySelector('.verticalTabBarClass');
		if (vt == null) return;
		var tabs = vt.children;
		if (tabs == null) return;
		if (tabs.length == 0) return;
		window.xxxx = tabs;
		if (parent.document.querySelector(".verticalTabBarClass").onmouseup == null)
			parent.document.querySelector(".verticalTabBarClass").onmouseup = function () {
				$("tab-bar-button", parent.document).css("pointer-events", "");
			}
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].textContent.search('BBOalert') == -1) {
				if (tabs[i].onmousedown == null) tabs[i].onmousedown = function () {
					$("tab-bar-button", parent.document).has(".selected.covered").css("pointer-events", "none");
					setOptionsOff();
				}
			}
		}
	}
	
	/**
	 * retrieve my partner's user id
	 */
	function myPartner() {
		return $('bridge-screen deal-viewer .directionClass:contains("' + partnerSeat() + '")', PWD)
			.siblings("div.nameDisplayClass").text()
	}
	
	/**
	 * retrieve active player direction and user id
	 */
	function getActivePlayer() {
		var name = $('bridge-screen deal-viewer .nameBarClass', PWD)
			.filter(function () {
				return this.style.backgroundColor === "rgb(255, 206, 0)";
			}).find("div:lt(2)").text();
		if (name == '') {
			name = $('bridge-screen deal-viewer .nameBarClass', PWD)
				.filter(function () {
					return this.style.backgroundColor === "rgb(204, 204, 154)";
				}).find("div:lt(2)").text();
		}
		// return direction + UID in lower case
		return name.charAt(0) + name.substring(1).toLowerCase();
	}
	
	/**
	 *	retrieve opponent's user id. LHO if lho=true 
	 * @param {*} lho 
	 */
	function myOpponent(lho) {
		if (lho) return $('bridge-screen deal-viewer .directionClass:contains("' + directionLHO() + '")', PWD)
			.siblings("div.nameDisplayClass").text();
		return $('bridge-screen deal-viewer .directionClass:contains("' + directionRHO() + '")', PWD)
			.siblings("div.nameDisplayClass").text()
	}
	
	/**
	 * retrieve Alert button state (true = ON)
	 */
	function isAlertON() {
		try {
			return $("#navDiv .biddingBoxClass button:eq(15):visible", PWD)[0].style.backgroundColor != "rgb(255, 255, 255)";
		}
		catch {
			return false;
		}
	}
	
	/**
	 * set alert button state (on=true = ON)
	 */
	function setAlert(on) {
		if (isAlertON() == on) return on;
		$("#navDiv .biddingBoxClass button:eq(15):visible", PWD).click();
		return on;
	}
	
	/**
	 * @ignore
	 */
	function tableType() {
		// no deal number = no table
		if (getDealNumber() == '') return 'no';
		if ($('#navDiv deal-viewer .nameDisplayClass:visible', PWD).text().includes("Robot")) return 'robot';
		if ($('#navDiv deal-viewer .nameDisplayClass:visible', PWD).filter(function () {
			return this.textContent.toLowerCase() == whoAmI().toLowerCase();
		}).text() == '') return 'kibitz';
		// if no score panel -> practice table
		if ($('#navDiv deal-viewer .score-panel:visible', PWD).text() == '') return "practice";
		return 'game';
	}
	
	/**
	 * retrieve current chat destination
	 */
	function getCurrentChatDestination() {
		return $('#chatDiv .messageInputDivClass .channelButtonClass:eq(0)', PWD).text();
	}
	
	/**
	 * @ignore
	 */
	function getChatDestinationMenuItem(t) {
		var mi = parent.$('#chatDiv menu-item div');
		for (var i = 0; i < mi.length; i++) {
			if (mi[i].textContent.trim().toLowerCase() == t.toLowerCase()) {
				return mi[i];
			}
			if (mi[i].textContent.trim() == "→" + t) {
				return mi[i];
			}
			if (t == 'Table') {
				if (isTable(mi[i].textContent)) return mi[i];
			}
			if (t == 'Opponents') {
				if (isOpponents(mi[i].textContent)) return mi[i];
			}
		}
		return null;
	}
	
	function isChatDestinationOK(t) {
		var cb = parent.$('#chatDiv .messageInputDivClass .channelButtonClass')[0];
		if (cb.textContent.slice(1).toLowerCase() == t.toLowerCase()) return true;
		if (t == 'Table') {
			if (isTable(cb.textContent)) return true;
		}
		if (t == 'Opponents') {
			if (isOpponents(cb.textContent)) return true;
		}
		return false;
	}
	
	/**
	 * set chat destinatiop to t
	 */
	function setChatDestination(t) {
		if (isChatDestinationOK(t)) return;
		var cb = parent.$('#chatDiv .messageInputDivClass .channelButtonClass')[0];
		var ok = false;
		parent.$('#chatDiv .menuClass').hide();
		parent.$('#chatDiv .messageInputDivClass .channelButtonClass')[0].click();
		var dmi = getChatDestinationMenuItem(t);
		setTimeout(function () {
			if (dmi != null) {
				dmi.click();
				ok = true;
			}
			parent.$('#chatDiv .menuClass').hide();
		}, 100);
	}
	
	/**
	 * set chat destination to table
	 */
	function setChatToTable() {
		if (isTable(getCurrentChatDestination())) return;
	}
	
	/**
	 * send chat message to specified user id
	 */
	function sendPrivateChat(uid, text) {
		var t = text;
		if (!t.endsWith('\\n')) t = t + '\\n';
		var od = parent.$('#chatDiv .messageInputDivClass .channelButtonClass')[0].textContent;
		setChatDestination('Private');
		//    var cd = $('#chatDiv .messageInputDivClass .channelButtonClass span');
		var cd = parent.$('#chatDiv .getStringDialogClass .messageInputClass');
		var bt = parent.$('#chatDiv .getStringDialogClass button');
		setTimeout(function () {
			cd[0].value = uid;
			var eventInput = new Event('input');
			cd[0].dispatchEvent(eventInput);
			bt[0].click();
			setChatMessage(t, true);
			setChatDestination(od);
		}, 200);
	}
	
	/**
	 * retrieve my hand into a string
	 */
	function getMyHand() {
		return getHandBySeat(mySeat());
	}
	
	/**
	 * retrieve partner's hand if visible
	 */
	function getPartnerHand() {
		return getHandBySeat(partnerSeat());
	}
	
	function getHandBySeat(seat) {
		var zidx = ("SWNE".indexOf(seat) + 1).toString();
		return $('#navDiv .cardClass .topLeft:visible', PWD).filter(function () {
			return this.parentElement.parentElement.parentElement.style.zIndex.startsWith(zidx)
		}).text().replaceAll("10", "T");
	}
	
	/**
	 * retrieve auction box element. Returns undefined if none found
	 * 
	 */
	function getAuctionBox() {
		return parent.$('bridge-screen .auctionBoxClass')[0];
	}
	
	function getCard(index) {
		return $('#navDiv .cardClass .topLeft', PWD).filter(function () {
			return this.parentElement.parentElement.parentElement.style.zIndex == index.toString();
		}).text().replaceAll("10", "T");
	}
	
	function getLastChatMessaage() {
		return $("#chatDiv .chatOutputClass chat-list-item:eq(-1)", PWD).text()
	}
	
	function getPlayedCards() {
		return getCard(90) + getCard(91) + getCard(92) + getCard(93);
	}
	
	function getAnnouncementPanel() {
		return parent.$("bridge-screen .announcementPanelClass")[0];
	}
	
	function getNotificationPanel() {
		return parent.$("bridge-screen .notificationClass")[0];
	}
	
	function getCallExplanationPanel() {
		return parent.$("bridge-screen .callExplanationClass")[0];
	}
	
	function getCallExplanationText() {
		return parent.$("bridge-screen .callExplanationClass .textClass").text();
	}
	
	function getChatSendButton(inp) {
		return $(inp).parent().parent().parent().parent().parent().next().get(0)
	}
	
	function hover_bboalert() {
		try {
			var t = window.parent.document.getElementById('bboalert-tab');
			var rd = window.parent.document.getElementById('rightDiv');
			var vt = rd.querySelector('.verticalTabBarClass');
			var tabs = vt.querySelectorAll('.verticalClass');
			if (t.onmouseenter == null) t.onmouseenter = function () {
				if (isHoverEnabled()) {
					setOptions(true);
					parent.$("#bboalert-tab")[0].focus();
				}
			};
			for (var i = 0; i < tabs.length; i++) {
				if (tabs[i].textContent.search('BBOalert') == -1) {
					if (tabs[i].onmouseenter == null) tabs[i].onmouseenter = function () {
						if (isHoverEnabled()) {
							setOptionsOff();
							window.parent.document.activeElement.blur();
							if ((this.className.indexOf("selected") == -1) || ($("#adpanel0").width() == 0)) {
								this.click();
							}
						}
					};
				}
			}
		} catch { }
	}
	
	function getFinalContractPanel() {
		try {
			return parent.$("bridge-screen .tricksPanelClass")[0];
		} catch {
			return null;
		}
	}
	
	function isDebuggingTable() {
		if ((nd = getNavDiv()) == null) return false;
		var nd1 = nd.querySelectorAll('.nameDisplayClass');
		if (nd1 == null) return false;
		if (nd1.length != 4) return false;
		for (var i = 0; i < 4; i++) {
			if (nd1[i].textContent != whoAmI()) return false;
		}
		return true;
	}
	
	function partnerDirection() {
		var md = myDirection();
		if (md == "S") return "N";
		if (md == "W") return "E";
		if (md == "N") return "S";
		if (md == "E") return "W";
		return '';
	}
	
	function directionRHO() {
		var md = myDirection();
		if (md == "S") return "E";
		if (md == "W") return "S";
		if (md == "N") return "W";
		if (md == "E") return "N";
		return '';
	}
	
	function directionLHO() {
		var md = myDirection();
		if (md == "S") return "W";
		if (md == "W") return "N";
		if (md == "N") return "E";
		if (md == "E") return "S";
		return '';
	}
	
	function getLanguage() {
		return $("html", PWD).attr("lang");
	}
	
	function redisplayBiddingBox(time = 100) {
		var bb = getBiddingBox();
		if (!isVisible(bb)) return;
		bb.style.display = "none";
		setTimeout(function () {
			bb.style.display = "inline-block";
		}, time);
	}
	
	
	function getBiddingBoxButtons() {
		elBiddingButtons = $("#navDiv .biddingBoxClass .biddingBoxButtonClass", PWD).toArray();
		if (elBiddingButtons.length == 0) return null;
		return elBiddingButtons;
	}
	
	/**
	 * Clear explanation text field
	 */
	function clearAlert() {
		elAlertExplain = getExplainInput();
		if (elAlertExplain == null) return;
		elAlertExplain.value = "";
		eventInput = new Event('input');
		elAlertExplain.dispatchEvent(eventInput);
	}
	
	function openAccountTab() {
		$('#rightDiv .verticalClass:eq(3):not(.selected)', PWD).click();
	}
	
	function openMessageTab() {
		$('#rightDiv .verticalClass:eq(0):not(.selected)', PWD).click();
	}
	
	function getMyCall() {
		var c = $("#navDiv .biddingBoxClass button:lt(15):visible", PWD).filter(function () {
			return (this.style.backgroundColor == "rgb(255, 206, 0)");
		}).text().replaceAll(" ", "");
		return translateCall(c);
	}
	
	/**
	 * @ignore
	 */
	function setBiddingButtonEvents() {
		// get bidding box button labels
		var biddingButtonsText = $("#navDiv .biddingBoxClass button", PWD).off('mousedown touchstart')
			.map(function () { return this.textContent.trim() }).get();
		$("#navDiv .biddingBoxClass button", PWD).on('mousedown touchstart', function (event) {
			// find which button has been pressed
			$(".mat-ripple-element", this).remove();
			//		var buttonIndex = biddingButtonsText.indexOf(event.target.textContent.trim());
			if (DEBUG) console.log(event.target.tagName);
			var buttonElement = event.target;
			// If you hit the span element, get its parent
			if (event.target.tagName != "BUTTON") {
				buttonElement = event.target.parentElement;
			}
			var buttonIndex = getBiddingBoxButtonIndexByText(buttonElement.textContent.trim());
			if (DEBUG) console.log(buttonIndex);
			if (buttonIndex < 0) return;
			// if call level button pressed
			if ((buttonIndex >= 0) && (buttonIndex <= 6)) {
				callText = (buttonIndex + 1).toString();
				// if suit button pressed
			} else if (buttonIndex <= 11) {
				callText = callText.charAt(0) + "1234567CDHSN".charAt(buttonIndex);
				// if other buttons pressed
			} else {
				switch (buttonIndex) {
					case 12:
						callText = "--"; break;
					case 13:
						callText = "Db"; break;
					case 14:
						callText = "Rd"; break;
					case 15:
						if (DEBUG) console.log("Alert pressed");
						addLog('click:[Alert]');
						if (isAlertON()) {
							setExplainText('');
							setChatMessage('', false);
						}
						return;
					case 16:
						if (DEBUG) console.log("OK pressed ");
						addLog('click:[OK]');
						saveAlert();
						sendAlertChat();
						return;
				}
			}
			// if call level selected
			if (callText.length == 1) {
				addLog('click:[' + callText + ' ]');
				if ((confirmBidsSet() != 'N')) clearAlert();
				if (DEBUG) console.log('Selected level :' + " > " + callText);
				// if call selected
			} else {
				addLog('click:[' + callText + ' ]');
				getAlert();
				if ((confirmBidsSet() == 'Y')) confirmBid(trustedBid);
				if (DEBUG) console.log('Selected call  :' + " > " + callText);
			}
		}
		);
	}
	
	function getBiddingBoxButtonIndexByText(txt) {
		if (DEBUG) console.log("getBiddingBoxButtonIndexByText " + txt);
		var buttons = getBiddingBoxButtons();
		if (buttons == null) return -1;
		for (var i = 0; i < buttons.length; i++) {
			if (DEBUG) console.log("getBiddingBoxButtonIndexByText " + txt + " " +
				buttons[i].textContent.trim() + " " + i);
			if (buttons[i].textContent.trim() == txt.trim()) return i;
		}
		return -1;
	}
	
	function disableSplitScreenSwitch() {
		if ($($("settings-list ion-toggle", PWD).get(0)).attr("aria-checked"))
			$($("settings-list ion-toggle", PWD).get(0)).attr("disabled", "true");
	}
	
	function getPlayerAtSeat(seat) {
		return $(".nameBarDivClass", getNavDiv()).filter(function () {
			return (this.textContent.startsWith(seat));
		}).find(".nameDisplayClass").text();
	}
	
	function getOpenProfile() {
		var pp = parent.document.querySelector('profile-popup');
		if (pp == null) return null;
		if (!isVisible(pp)) return null;
		return pp;
	}
	
	function getOpenProfileBBOid() {
		var pp = getOpenProfile();
		if (pp == null) return "";
		return pp.querySelector('name-tag span').firstChild.textContent.trim()
	}
	
	function getOpenProfileBBOalertURL() {
		var info = $("profile-popup .otherInfoClass", PWD).text();
		if (!info.includes("https://")) return "";
		return info.substring(info.lastIndexOf("https://")).trim();
	}
	
	function loadBBOalertURLinProfile() {
		var url = getOpenProfileBBOalertURL();
		if (url == "") return;
		importedURL = url;
		readNewData("BBOalert\nImport," + importedURL);
	}
	
	function addBBOalertButtonToProfile() {
		var pp = getOpenProfile();
		if (pp == null) return;
		$('.bboalertProfileButtonClass', pp).remove();
		var url = getOpenProfileBBOalertURL();
		if (url == "") return;
		importedURL = url;
		loadBBOalertWebDataFile(importedURL, importedURL,
			function (data) {
				var txt = data;
				if (getDataType(txt) == "BBOalert") {
					var button = document.createElement("button");
					button.className = "bboalertProfileButtonClass";
					button.textContent = "Import BBOalert data";
					button.onclick = function () {
						setOptions(true);
						$('#bttab-bboalert').click();
						readNewData("BBOalert\nImport," + importedURL);
					};
					var pp = getOpenProfile();
					pp.querySelector('.otherInfoClass').after(button);
				}
			},
			function (error) {
				console.log("Error loading BBOalert data from " + importedURL + " : " + error);
			});
	}
	
	function removeBBOalertButtonFromProfile() {
		$('profile-popup .bboalertProfileButtonClass', PWD).remove();
	}
	// ==========================================================================
	// vendored: src/iframe/BBOobserverHandlers.js
	// ==========================================================================
	
	function onAnyMutation() {
	    setBBOalertButton(isSettingON(8));
	    partnershipOptions();
	    checkOptionsVulnerability();
	    setOptionColors();
	    if ($("#adpanel2").length == 1) {
	        if (parent.document.activeElement.tagName.toLowerCase() == "input") {
	            if (!parent.$("#rightDiv")[0].contains(parent.document.activeElement)) {
	                $("#adpanel2")[0].inputObject = parent.document.activeElement;
	                if (parent.document.activeElement.onclick == null) {
	                    parent.document.activeElement.onclick = function () {
	                        toggleButtons(this);
	                    };
	                }
	            }
	        }
	    }
	    hover_bboalert();
	    disableSplitScreenSwitch();
	    BBOalertEvents().dispatchEvent(E_onAnyMutation);
	    execUserScript('%onAnyMutation%');
	}
	
	function onBiddingBoxCreated() {
	    lastDealNumber = '';
	    LHOpponent = '';
	    RHOpponent = '';
	    activePlayer = '';
	    BBOalertEvents().dispatchEvent(E_onBiddingBoxCreated);
	    execUserScript('%onBiddingBoxCreated%');
	}
	
	function onBiddingBoxDisplayed() {
	    setBiddingButtonEvents();
	    //    setExplainInputClickEvents();
	    var elAlertExplain = getExplainInput();
	    if (elAlertExplain.onclick == null) {
	        elAlertExplain.onclick = function () {
	            toggleButtons(this);
	        };
	    }
	    lastUserExplanation = '';
	    elAlertExplain.onkeyup = inputOnKeyup;
	    elAlertExplain.oninput = inputChanged;
	    //    elAlertExplain.onfocus = inputOnFocus;
	    getExplainInput().setAttribute("maxlength", "69");
	    BBOalertEvents().dispatchEvent(E_onBiddingBoxDisplayed);
	    execUserScript('%onBiddingBoxDisplayed%');
	}
	
	function onBiddingBoxHidden() {
	    BBOalertEvents().dispatchEvent(E_onBiddingBoxHidden);
	    execUserScript('%onBiddingBoxHidden%');
	}
	
	function onAuctionBoxDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onAuctionBoxDisplayed);
	    execUserScript('%onAuctionBoxDisplayed%');
	    setTimeout(function () {
	        if (getContext() == '') {
	            BBOalertEvents().dispatchEvent(E_onAuctionBegin);
	            bidSymbolMap.clear();
	            alertHistoryMap.clear();
	            execUserScript('%onAuctionBegin%');
	        }
	    }, 200);
	}
	
	function onAuctionBoxHidden() {
	    activePlayer = '';
	    BBOalertEvents().dispatchEvent(E_onAuctionBoxHidden);
	    execUserScript('%onAuctionBoxHidden%');
	    var ctx = getContext();
	    if ((ctx.length >= 8) && (ctx.endsWith('------'))) {
	        BBOalertEvents().dispatchEvent(E_onAuctionEnd);
	        execUserScript('%onAuctionEnd%');
	    }
	}
	
	function onFinalContractDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onFinalContractDisplayed);
	    execUserScript('%onFinalContractDisplayed%');
	}
	
	function onNewAuction() {
	    if (currentAuction == '') bidSymbolMap.clear();
	    if (currentAuction != '')
	        if (currentAuction != '??') {
	            ctxArray = bidArray(stripContext(getContext()));
	            BBOalertEvents().dispatchEvent(E_onNewAuction);
	            execUserScript('%onNewAuction%');
	            if (DEBUG) console.log("Active player " + activePlayer);
	            if (activePlayer.slice(0, 1) == directionRHO()) {
	                let txt = findAlertText(getContext().slice(0, -2), getContext().slice(-2));
	                BBOalertEvents().dispatchEvent(E_onPartnerAuction);
	                execUserScript('%onPartnerAuction%');
	            }
	            if (activePlayer.slice(0, 1) == directionLHO()) {
	                if (DEBUG) console.log("My bid " + getContext().slice(-2));
	                BBOalertEvents().dispatchEvent(E_onMyAuction);
	                execUserScript('%onMyAuction%');
	            }
	            if (activePlayer.slice(0, 1) == myDirection()) {
	                if (DEBUG) console.log("RHO bid " + getContext().slice(-2));
	                BBOalertEvents().dispatchEvent(E_onRHOAuction);
	                execUserScript('%onRHOAuction%');
	            }
	            if (activePlayer.slice(0, 1) == partnerDirection()) {
	                if (DEBUG) console.log("LHO bid " + getContext().slice(-2));
	                BBOalertEvents().dispatchEvent(E_onLHOAuction);
	                execUserScript('%onLHOAuction%');
	            }
	        }
	}
	
	function onNewActivePlayer() {
	    BBOalertEvents().dispatchEvent(E_onNewActivePlayer);
	    execUserScript('%onNewActivePlayer%');
	}
	
	function onExplainCallDisplayed() {
	    // TODO: handle text longer than 39 characters
	    var fa = new BBOalertFind();
	    getExplainCallInput().onkeyup = inputOnKeyup;
	    getExplainCallInput().oninput = inputChanged;
	//    $(getExplainCallBox()).draggable();
	//    getExplainCallInput().setAttribute("maxlength", "69");
	    //    getExplainCallBox().onfocus = inputOnFocus;
	    var x = $(".headingClass", getExplainCallBox())[0];
	    var bok = $(getExplainCallBox()).find("button")[0].onclick = function () {
	        sendAlertChat();
	    }
	    x.onclick = function () {
	        var b = translateCall($(".headingClass", getExplainCallBox()).text().split(" ").at(-1));
	        var c = getContext().substring(0, getContext().indexOf(b));
	        setExplainCallText(fa.findAlert(c,b).substring(0,39));
	        if(fa.trustedBid) $(getExplainCallBox()).find("button").click();
	    };
	    var e = getExplainCallInput();
	    if (e.onclick == null) {
	        e.onclick = function () {
	            toggleButtons(this);
	        };
	    }
	//    if (getExplainCallInput().value == "") setExplainCallText(getExplainCallAlert().substring(0,39));
	    if (getExplainCallInput().value == "") {
	        var b = translateCall($(".headingClass", getExplainCallBox()).text().split(" ").at(-1));
	        var c = getContext().substring(0, getContext().indexOf(b));
	        setExplainCallText(fa.findAlert(c,b).substring(0,39));
	        if(fa.trustedBid) $(getExplainCallBox()).find("button").click();
	    }
	//    getExplainCallBox().style.width = "auto";
	//    getExplainCallBox().style.height = "auto";
	    BBOalertEvents().dispatchEvent(E_onExplainCallDisplayed);
	    execUserScript('%onExplainCallDisplayed%');
	}
	
	function onExplainCallHidden() {
	    BBOalertEvents().dispatchEvent(E_onExplainCallHidden);
	    execUserScript('%onExplainCallHidden%');
	}
	
	function onBiddingBoxRemoved() {
	    setBiddingButtonEvents();
	    BBOalertEvents().dispatchEvent(E_onBiddingBoxRemoved);
	    execUserScript('%onBiddingBoxRemoved%');
	}
	
	function checkNewVersion() {
	    var oldVersion = localStorage.getItem("BBOalertVersion");
	    var curVersion = document.title;
	    if (curVersion.split(".").length > 3) return;
	    if (oldVersion != curVersion) {
	        setTimeout(function () {
	            localStorage.setItem("BBOalertVersion", curVersion);
	            alert("\nNew BBOalert version loaded : " + curVersion + 
	                "\n\nPlease read release notes on the 'Documents' tab");
	        }, 100);
	    }
	}
	
	function openRelnotes() {
	    setOptions(true);
	    $("#bttab-info").click();
	}
	
	function onNavDivDisplayed() {
	    if (DEBUG) console.log("Iframe navDiv displayed");
	    // complete initial setup
	    parent.document.querySelector(".logoutBlock button")
	    setUI();
	    setTabEvents();
	    addBBOalertTab();
	    alertData = localStorage.getItem('BBOalertCache');
	    if (alertData == null) alertData = 'BBOalert\n';
	    if (alertData == "") alertData = 'BBOalert\n';
	    alertOriginal = alertData;
	    openAccountTab();
	    openMessageTab();
	    restoreSettings();
	    loadTinyURL();
	    setOptions(!isSettingON(7));
	    bboalertLog(version + "<br>Reading data<br>");
	    setTimeout(() => {
	        updateAlertDataAsync(alertOriginal, function () {
	            alertTable = alertData.split("\n");
	            saveAlertTableToClipboard();
	            processTable();
	            displayHeaders();
	            addBBOalertLog("<br>" + alertTable.length + " records from cache");
	            var elMessage = getChatInput();
	            elMessage.onkeyup = inputOnKeyup;
	            elMessage.oninput = inputChanged;
	            if (elMessage.onclick == null) {
	                elMessage.onclick = function () {
	                    toggleButtons(this);
	                };
	            }
	            setPageReload();
	            setTabEvents();
	            partnershipOptions();
	            setTimeout(function () {
	                setOptions(!isSettingON(7));
	            }, 200);
	//            restoreSettings();
	            hideUnusedOptions();
	            BBOalertEvents().dispatchEvent(E_onLogin);
	            execUserScript('%onLogin%');
	            checkNewVersion();
	            setBBOalertButton(isSettingON(8));
	        });
	    }, 500);
	}
	
	function onNavDivHidden() {
	    if (DEBUG) console.log("Iframe navDiv hidden " + alertOriginal.length);
	    localStorage.setItem('BBOalertCache', alertOriginal);
	    setButtonPanel(false);
	    setOptionsOff();
	    initGlobals();
	    BBOalertEvents().dispatchEvent(E_onLogoff);
	    execUserScript('%onLogoff%');
	}
	
	function onAnyOpponentChange() {
	    if (!biddingBoxExists) return;
	    opponentChanged = '';
	    if (myOpponent(true) != LHOpponent) {
	        opponentChanged = 'L';
	        LHOpponent = myOpponent(true);
	    }
	    if (myOpponent(false) != RHOpponent) {
	        opponentChanged = opponentChanged + 'R';
	        RHOpponent = myOpponent(false);
	    }
	    BBOalertEvents().dispatchEvent(E_onAnyOpponentChange);
	    execUserScript('%onAnyOpponentChange%');
	}
	
	function onNewDeal() {
	    activePlayer = '';
	    BBOalertEvents().dispatchEvent(E_onNewDeal);
	    execUserScript('%onNewDeal%');
	}
	
	function onNewCallSelected() {
	    if (DEBUG) console.log(lastSelectedCall);
	    if (lastSelectedCall.length == 2) {
	        BBOalertEvents().dispatchEvent(E_onNewCallSelected);
	        execUserScript('%onNewCallSelected%');
	    }
	    if (lastSelectedCall.length == 1) {
	        BBOalertEvents().dispatchEvent(E_onCallLevelSelected);
	        execUserScript('%onCallLevelSelected%');
	    }
	}
	
	function onOKbuttonDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onOKbuttonDisplayed);
	    execUserScript('%onOKbuttonDisplayed%');
	}
	
	function onOKbuttonHidden() {
	    BBOalertEvents().dispatchEvent(E_onOKbuttonHidden);
	    execUserScript('%onOKbuttonHidden%');
	}
	
	function onOKbuttonPressed() {
	    OKbuttonPressed = true;
	    BBOalertEvents().dispatchEvent(E_onOKbuttonPressed);
	    execUserScript('%onOKbuttonPressed%');
	}
	
	
	function onNewLead() {
	    if (myDirection() != "") {
	        if (getMyHand().length == 24) {
	            BBOalertEvents().dispatchEvent(E_onMyLead);
	            execUserScript('%onMyLead%');
	        }
	    }
	}
	
	function onNewPlayedCard() {
	    if (playedCards != '') {
	        BBOalertEvents().dispatchEvent(E_onNewPlayedCard);
	        execUserScript('%onNewPlayedCard%');
	    }
	}
	
	function onCallExplanationPanelDisplayed() {
	//    getCallExplanationPanel().draggable();
	    BBOalertEvents().dispatchEvent(E_onCallExplanationPanelDisplayed);
	    execUserScript('%onCallExplanationPanelDisplayed%');
	}
	
	function onMyCardsDisplayed() {
	    lastUserExplanation = '';
	    BBOalertEvents().dispatchEvent(E_onMyCardsDisplayed);
	    execUserScript('%onMyCardsDisplayed%');
	}
	
	
	function onDealEndPanelDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onDealEnd);
	    execUserScript('%onDealEnd%');
	}
	
	function onAnnouncementDisplayed() {
	//    getAnnouncementPanel().draggable();
	    BBOalertEvents().dispatchEvent(E_onAnnouncementDisplayed);
	    execUserScript('%onAnnouncementDisplayed%');
	}
	
	function onNotificationDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onNotificationDisplayed);
	    execUserScript('%onNotificationDisplayed%');
	}
	
	function onNewChatMessage() {
	    BBOalertEvents().dispatchEvent(E_onNewChatMessage);
	    execUserScript('%onNewChatMessage%');
	}
	
	function onTableDisplayed() {
	    setTabEvents();
	    BBOalertEvents().dispatchEvent(E_onTableDisplayed);
	    execUserScript('%onTableDisplayed%');
	}
	
	
	function onTableHidden() {
	    BBOalertEvents().dispatchEvent(E_onTableHidden);
	    execUserScript('%onTableHidden%');
	}

	// ==========================================================================
	// vendored: TamperMonkey/src/shim.js (overrides the above)
	// ==========================================================================
	// ---------------------------------------------------------------- BBOalert shim
	//
	// The vendored files (globals / functions / BBO_DOM / BBOobserver / BBOobserverHandlers)
	// are the parts of BBOalert that actually understand the BBO page. They reference a
	// handful of things that live in the parts we do NOT vendor - the alert engine
	// (BBOalert.js, BBOalertFind.js), the data store (BBOalertData.js) and the panel UI
	// (BBOalertUI.js, BBOalertOptions.js, BBOalertPlugin.js).
	//
	// This file supplies those references. Two kinds:
	//
	//   REAL   - execUserScript / getScript / scriptList. These are the script dispatch
	//            mechanism and must behave exactly as BBOalert does, because PlayWithBrill's
	//            control flow is built on them. Copied from BBOalert.js.
	//   STUB   - the alerting and panel UI. We are not alerting and we have no panel, so
	//            these are no-ops. They exist only so the vendored code does not throw.
	//
	// Nothing here may be 'use strict': PlayWithBrill's blocks assign implicit globals
	// (e.g. `newdeal = true` with no var), which is how state crosses between blocks under
	// BBOalert. Under strict mode every one of those becomes a ReferenceError.
	
	// ---- REAL: alert-engine globals ------------------------------------------------
	//
	// execUserScript() passes these into userScript(), and the observer handlers read
	// trustedBid. All three are declared in BBOalert.js (lines 493-494) which we do not
	// vendor, so without them execUserScript throws ReferenceError on its FIRST call - which
	// is inside the observer bootstrap, so nothing ever starts and the only symptom is
	// silence. Found by diffing declarations in the non-vendored files against everything
	// the vendored set reads; these three are the complete list.
	var foundContext = '';
	var foundCall = '';
	var trustedBid = false;
	
	// ---- REAL: script dispatch (verbatim behaviour from BBOalert.js) ----------------
	
	// scriptList entries have the shape produced by setScriptList():
	//     "//Script,<name>," + "\n" + <code lines joined by \n>
	// getScript() concatenates every entry with a matching name, which is what lets a
	// user script define the same hook twice and have both bodies run.
	function getScript(scriptName) {
		var scriptText = '';
		for (var i = 0; i < scriptList.length; i++) {
			var txt = scriptList[i];
			var rec = txt.split(",");
			if (rec[1].trim() == scriptName) {
				scriptText += txt.slice(txt.indexOf(',', txt.indexOf(',') + 1) + 1);
			}
		}
		return scriptText;
	}
	
	// Replaces every %name% in txt with the RESULT of running that script (its global R).
	// Called both as a dispatcher - execUserScript('%onNewDeal%') - and as a text expander.
	function execUserScript(txt) {
		var rec = txt.split('%');
		if (rec.length < 2) return txt;
		var txt1 = '';
		var script;
		for (var i = 0; i < rec.length; i++) {
			if (i % 2 == 0) {
				txt1 = txt1 + rec[i];
			} else {
				script = getScript(rec[i]);
				if (script != '') {
					txt1 = txt1 + userScript(script, foundContext, getContext(), foundCall, callText);
				} else {
					txt1 = txt1 + "%" + rec[i];
					if (i < rec.length - 1) txt1 = txt1 + "%";
				}
			}
		}
		return txt1;
	}
	
	// ---- REAL: logging -------------------------------------------------------------
	
	// BBOalert writes to a textarea in its panel. We have no panel, so send it to the
	// console - userScript() calls addLog() on every script error, and losing those
	// would make a failing hook completely silent.
	function addLog(x) {
		try {
			console.log('[brill-log]', (x && x.stack) ? x.stack : x);
		} catch (e) { /* never let logging break a hook */ }
	}
	
	// ---- STUB: chat / input handlers -----------------------------------------------
	//
	// The vendored handlers wire these onto BBO's chat input. inputOnKeyup in particular is
	// assigned as a VALUE (elMessage.onkeyup = inputOnKeyup), not called - which is why the
	// first "which functions are missing" scan, looking only for `name(`, did not find it.
	// They exist for BBOalert's alert-entry shortcuts; nothing here needs them.
	function inputOnKeyup() { }
	function inputChanged() { }
	function toggleOptions() { }
	function getDataType() { return ''; }
	function findAlert() { return ''; }
	
	// ---- STUB: alerting ------------------------------------------------------------
	// We disclose nothing and explain nothing; we only play. The observer handlers call
	// into these on bidding-box and explain-box events.
	
	function getAlert() { }
	function saveAlert() { }
	function checkAlert() { }
	function findAlertText() { return ''; }
	function setAlertText() { }
	function displayAlert() { }
	function BBOalertData() { this.getNextRecord = function () { return null; };
	                          this.getNextLine = function () { return null; };
	                          this.trimOn = true; }
	function BBOalertFind() { this.findAlert = function () { return ''; };
	                          this.trustedBid = false; this.alertedBid = false;
	                          this.deferredExplanation = false; }
	
	// ---- STUB: panel UI ------------------------------------------------------------
	// Every one of these paints something in the BBOalert tab, which does not exist here.
	
	function setUI() { }
	function restoreSettings() { }
	function saveSettings() { }
	function isSettingON() { return false; }
	function setOptions() { }
	function setTabEvents() { }
	function openAccountTab() { }
	function openMessageTab() { }
	function bboalertLog() { }
	function addBBOalertLog() { }
	function updateAlertDataAsync(d, cb) { if (typeof cb === 'function') cb(); }
	function processTable() { }
	function saveAlertTableToClipboard() { }
	function setStatText() { }
	function setStatTextDiv() { }
	function hideUnusedOptions() { }
	function initInfoSelector() { }
	function makeDirectLink() { }
	function setBBOalertButton() { }
	function setButtonPanel() { }
	function setOptionColors() { }
	function setOptionsOff() { }
	function toggleButtons() { }
	function partnershipOptions() { }
	
	// ---- STUB: data loading --------------------------------------------------------
	// BBOalert pulls the user's alert table from Google Drive / Dropbox / GitHub. The play
	// engine is compiled in at build time, so there is nothing to fetch.
	function readNewData() { }
	function loadBBOalertWebDataFile() { }
	function loadTinyURL() { }
	function setTitle() { }
	function setTitleText() { }
	function displayHeaders() { }
	function clearConfigMenu() { }
	function setOptionsSelector() { }
	function clearOptionsSelector() { }
	function checkOptionsVulnerability() { }
	function addBBOalertTab() { }
	function initBBOalertUI() { }
	function displayDocument() { }
	function fetchWebData() { }
	function HTMLpage2text(s) { return s; }
	function PluginInit() { }
	// initGlobals() clears scriptList, so this must be able to put it back. The build emits
	// BRILL_SCRIPTS; anything that calls setScriptList() (including our own lobby tick when it
	// notices an empty list) restores the compiled-in play engine.
	var BRILL_SCRIPTS = [];
	function setScriptList() {
		scriptList = BRILL_SCRIPTS.slice();
	}
	
	// PlayWithBrill's onDataLoad block DEFINES 61 helper functions - getCardByValue, makeBid,
	// BrillsTurnToBid, everything that talks to Brill.Service. Under the extension it is
	// dispatched when the alert data finishes loading; here there is no data load, so without
	// this the play hooks fire and immediately hit undefined functions.
	function brillDataLoad() {
		if (!scriptList.length) return;
		execUserScript('%onDataLoad%');
		console.log('[brill] play engine loaded (onDataLoad): ' +
			(typeof getCardByValue === 'function' ? 'helpers OK' : 'HELPERS MISSING'));
	}
	
	// ---- OVERRIDE: observer bootstrap ----------------------------------------------
	//
	// The vendored BBOobserverHandlers.onNavDivDisplayed() is BBOalert's panel bootstrap:
	// setUI, addBBOalertTab, openAccountTab, openMessageTab, restoreSettings, loadTinyURL,
	// then an async alert-data load. None of it applies standalone, and it actively broke
	// this build in two ways:
	//
	//   1. restoreSettings() reads $("#bboalert-menu-settings")[0] - the extension panel's
	//      settings dropdown. Standalone that is undefined, so it threw. And it is called
	//      from BBOobserver's startup interval BEFORE clearInterval + observer.observe():
	//
	//          if (!isVisible(getNavDiv())) return;
	//          initGlobals(); navDivDisplayed = true;
	//          onNavDivDisplayed();                      // threw
	//          clearInterval(tmr);                       // never reached
	//          BBOobserver.observe(targetNode, config);  // never reached
	//
	//      so the MutationObserver never started and NO play hook ever fired.
	//   2. Because clearInterval never ran, that whole block re-ran every 100ms - including
	//      openMessageTab() - which hammered BBO's rd_listmail.php into 429s and made the
	//      Mail tab flash continuously.
	//
	// Both symptoms, one cause. Replaced with the only thing this build needs at that point.
	function onNavDivDisplayed() {
		setScriptList();
		brillDataLoad();
	}
	
	function onNavDivHidden() { }

	// ==========================================================================
	// vendored: TamperMonkey/src/lobby.js
	// ==========================================================================
	// ---------------------------------------------------------------- challenge lobby driver
	//
	// The piece BBOalert never had: getting from the lobby into a challenge. Once seated, the
	// vendored observer + PlayWithBrill's hooks take over and play the board.
	//
	// STATE COMES FROM THE WIRE, NOT THE DOM
	// --------------------------------------
	// BBO's challenge list is served by POST webutil.bridgebase.com/v2/ard.php (cmd=l) as
	// <tlist><t .../></tlist> XML. That is authoritative: it carries per-side board counts,
	// so "is it my turn" is a field rather than a guess at what a coloured dot means.
	//
	// We do NOT call ard.php ourselves. It needs a `sessionPassword` that BBO keeps in Angular
	// memory (it is not in localStorage - checked), and re-authenticating to get one would mean
	// handling the account password. Instead we hook XHR/fetch and read the responses the page
	// already fetches for itself. Same trick CuebidsWithBrill uses on the Firestore stream:
	// piggyback the app's own data, stay automatically in sync, add no traffic.
	//
	// SAFETY GATE
	// -----------
	// Only challenges with c_challenge_style === "ARENA_ROBOT" are ever entered. Human
	// challenges are "PK". Engine-assisted play against humans is against BBO's terms; this is
	// a server-supplied field, not a heuristic, so the gate cannot quietly drift the way a
	// DOM-based check would.
	//
	// SETTINGS (page console):
	//   localStorage.BRILL_CHALLENGE_AUTOPLAY = '1'   actually enter challenges (default: off,
	//                                                 report only)
	//   delete localStorage.BRILL_CHALLENGE_AUTOPLAY  back to report-only
	
	var LOBBY = {
		poll: 2000,      // ms between lobby checks
		settle: 1500,    // ms to let a screen render before the next click
		cooldown: 60000, // ms before retrying a challenge we failed to enter
		stallMs: 90000   // no board gained in this long => treat the challenge as stalled
	};
	
	var tlist = {};          // tid -> parsed attributes of the last <t> seen
	var lobbyBusy = false;
	var lobbyCooldown = {};  // tid -> timestamp until which we leave it alone
	var lastLobbyLog = '';
	var lobbyEntered = {};   // tid -> {done, at} recorded when we entered, to detect no progress
	
	function autoPlay() { return localStorage.getItem('BRILL_CHALLENGE_AUTOPLAY') === '1'; }
	
	function lobbyLog() {
		var a = ['[brill-lobby]'].concat([].slice.call(arguments));
		console.log.apply(console, a);
	}
	
	// ---- harvest -------------------------------------------------------------------
	
	// Pull every <t .../> out of an ard.php body. Attribute soup, so a regex is honest here -
	// the payload is flat, single-quoted values never appear, and DOMParser on every poll is
	// needless work.
	function harvestTlist(text) {
		if (!text || text.indexOf('<tlist') === -1) return 0;
		var rows = text.match(/<t\s[^>]*\/>/g) || [];
		for (var i = 0; i < rows.length; i++) {
			var d = {}, m, re = /([\w]+)="([^"]*)"/g;
			while ((m = re.exec(rows[i]))) d[m[1]] = m[2];
			if (d.tid) tlist[d.tid] = d;
		}
		if (rows.length) lobbyLog('tlist: ' + rows.length + ' challenges');
		return rows.length;
	}
	
	// Hook both transports. The BBO client used XHR for ard.php when this was captured, but an
	// app that switches to fetch later would silently stop feeding us - so watch both.
	(function hookTransports() {
		var NativeXHR = window.XMLHttpRequest;
		if (NativeXHR) {
			var open = NativeXHR.prototype.open;
			var send = NativeXHR.prototype.send;
			NativeXHR.prototype.open = function (method, url) {
				this.__brillUrl = url;
				return open.apply(this, arguments);
			};
			NativeXHR.prototype.send = function () {
				var xhr = this;
				if (String(xhr.__brillUrl || '').indexOf('ard.php') !== -1) {
					xhr.addEventListener('load', function () {
						try { harvestTlist(xhr.responseText); } catch (e) { lobbyLog('harvest', e); }
					});
				}
				return send.apply(this, arguments);
			};
		}
		var nativeFetch = window.fetch;
		if (nativeFetch) {
			window.fetch = function (input) {
				var url = typeof input === 'string' ? input : (input && input.url) || '';
				var p = nativeFetch.apply(this, arguments);
				if (url.indexOf('ard.php') !== -1) {
					p.then(function (r) {
						r.clone().text().then(harvestTlist).catch(function () { });
					}).catch(function () { });
				}
				return p;
			};
		}
	})();
	
	// ---- interpretation ------------------------------------------------------------
	
	// BBO returns the username with inconsistent casing between fields ("Brill ADA" in one,
	// "brill ada" in another), so every comparison here is lowercased.
	function myName() { return (whoAmI() || '').trim().toLowerCase(); }
	
	// Returns {tid, boards, done, total, role} for a challenge, or null if it is not ours to play.
	function playable(d) {
		if (d.state !== 'RUNNING') return null;
		if (d.c_challenge_style !== 'ARENA_ROBOT') return null;   // <- the safety gate
		var me = myName();
		var role = null;
		if ((d.c_challenger || '').toLowerCase() === me) role = 'challenger';
		else if ((d.c_challengee || '').toLowerCase() === me) role = 'challengee';
		if (!role) return null;
		var done = parseInt(d['c_boards_completed_' + role] || '0', 10);
		var total = parseInt(d.boards || '0', 10);
		if (!(done < total)) return null;
		return { tid: d.tid, title: d.title, done: done, total: total, role: role };
	}
	
	function robotChallenges() {
		var out = [];
		for (var tid in tlist) {
			var p = playable(tlist[tid]);
			if (!p) continue;
			if (lobbyCooldown[tid] && Date.now() < lobbyCooldown[tid]) continue;
			out.push(p);
		}
		return out;
	}
	
	// ---- screens -------------------------------------------------------------------
	
	function onChallengeList() { return $('challenge-list-screen', PWD).length > 0; }
	function atTable() { return $('bridge-screen', PWD).is(':visible'); }
	function detailsPanel() { return $('challenge-details-panel:visible', PWD); }
	
	// LANGUAGE INDEPENDENCE
	// ---------------------
	// Matching the English word "Challenges" silently disabled the entire driver on a Danish
	// BBO (found on a Chrome profile whose login button read "Log ind"): the nav button never
	// matched, so no ard.php was ever harvested and it concluded there was nothing to play.
	// Nothing errored - it just sat there, which is the worst kind of failure.
	//
	// BBO's own menu.json pins this item language-independently:
	//   {"type":"regular-navigation-button","id":"challenges",
	//    "label":{"xlationCode":"MO301","fallbackLabel":"Challenges"},
	//    "icon":{"path":"assets/icons/sword_attack.svg"}}
	//
	// The icon is the same in every language, so prefer it and keep text as a fallback only.
	// localStorage.BRILL_CHALLENGES_LABEL overrides both if BBO ever changes the icon.
	var CHALLENGE_ICON = 'sword_attack';
	var CHALLENGE_LABELS = ['Challenges', 'Udfordringer', 'Herausforderungen', 'Defis',
		'Desafios', 'Sfide', 'Uitdagingen', 'Wyzwania'];
	
	function challengesNavButton() {
		var buttons = $('button.bbo-phx-navigation', PWD);
	
		var override = localStorage.getItem('BRILL_CHALLENGES_LABEL');
		if (override) {
			var byOverride = buttons.filter(function () {
				return $(this).text().indexOf(override) !== -1;
			}).first();
			if (byOverride.length) return byOverride;
		}
	
		// Covers <svg-icon icon="sword_attack">, <img src=".../sword_attack.svg"> and inline
		// <use href="...sword_attack.svg"> without needing to know which form BBO uses.
		var byIcon = buttons.filter(function () {
			var host = $(this).closest('phoenix-regular-navigation-button')[0] || this;
			try {
				return (host.innerHTML || '').indexOf(CHALLENGE_ICON) !== -1;
			} catch (e) {
				return false;
			}
		}).first();
		if (byIcon.length) return byIcon;
	
		return buttons.filter(function () {
			var t = $(this).text();
			for (var i = 0; i < CHALLENGE_LABELS.length; i++) {
				if (t.indexOf(CHALLENGE_LABELS[i]) !== -1) return true;
			}
			return false;
		}).first();
	}
	
	// A robot row carries no name-tag - there is no opponent username to show. That test is
	// language-independent, unlike matching the word "robot", so it is the one we rely on.
	// (A human challenge always renders a name-tag with the opponent's username.)
	//
	// We only ever call this when tlist has already told us an ARENA_ROBOT challenge is
	// playable, so the name-tag test just has to pick the right ROW, not decide robot-ness.
	function robotRow() {
		return $('challenge-list-item', PWD).filter(function () {
			return $('name-tag', this).length === 0;
		}).first();
	}
	
	// The details panel's button bar holds exactly one button ("Play now!"), so take it
	// positionally rather than by English text - same language trap as the nav button.
	function playNowButton() {
		var bar = $('challenge-details-panel .buttonBarClass button:visible', PWD);
		if (bar.length) return bar.first();
		return $('challenge-details-panel button:visible', PWD).filter(function () {
			return /play now/i.test($(this).text());
		}).first();
	}
	
	// ---- the loop ------------------------------------------------------------------
	//
	// Three clicks, each verified in TamperMonkey/BBO-lobby-protocol.md:
	//   Challenges nav -> challenge-list-item -> "Play now!"
	// Step two opens a modal rather than seating us, so the driver must wait for the panel
	// instead of assuming the row click entered the challenge.
	
	// initGlobals() does `scriptList = []`, and BBOalert calls it on several page transitions.
	// Under the extension the alert data is reloaded straight after; here there is nothing to
	// reload, so the play engine would just vanish. Wrap it once rather than polling for the
	// damage - the observer calls this far more often than the lobby ticks.
	var _initGlobals = initGlobals;
	initGlobals = function () {
		_initGlobals.apply(this, arguments);
		setScriptList();
	};
	
	// ---- PlayWithBrill's handler overrides -----------------------------------------
	//
	// PlayWithBrill customises BBOalert by assigning window.<name> = function ... (7 of them).
	// Under the extension its blocks are eval'd at global scope, so those assignments really do
	// replace the functions the observer calls. In this build everything lives inside one IIFE,
	// so the assignments land on `window` while the observer keeps calling the IIFE-scoped
	// originals - the overrides are installed and never invoked.
	//
	// That is not cosmetic: window.onNewAuction is what calls onNewState, which is what calls
	// onMyTurnToBid. Without it the hand is dealt, the bidding box appears, every hook fires
	// cleanly - and nothing ever bids.
	//
	// Function declarations are mutable bindings, so rebinding them here is enough: the
	// vendored call sites resolve the binding at call time and pick up the wrapper.
	var _vendoredHandlers = {
		getCard: getCard,
		getActivePlayer: getActivePlayer,
		mySeat: mySeat,
		onNewAuction: onNewAuction,
		onNewActivePlayer: onNewActivePlayer,
		onAuctionBoxHidden: onAuctionBoxHidden
	};
	
	function _delegate(name) {
		var vendored = _vendoredHandlers[name];
		var wrapper = function () {
			var override = window[name];
			// `override !== wrapper` matters: without it, anything that assigns our own wrapper
			// onto window turns every call into infinite recursion.
			if (typeof override === 'function' && override !== wrapper) {
				return override.apply(this, arguments);
			}
			return vendored.apply(this, arguments);
		};
		return wrapper;
	}
	
	getCard = _delegate('getCard');
	getActivePlayer = _delegate('getActivePlayer');
	mySeat = _delegate('mySeat');
	onNewAuction = _delegate('onNewAuction');
	onNewActivePlayer = _delegate('onNewActivePlayer');
	onAuctionBoxHidden = _delegate('onAuctionBoxHidden');
	
	// BBOalert starts its MutationObserver from a 100ms interval gated on
	// isVisible(getNavDiv()) - #navDiv having layout. That gate is fragile here: if it never
	// opens, the observer never starts, no hook ever fires, and the failure is completely
	// silent (the interval just spins). Start it ourselves instead, and cancel BBOalert's
	// interval so we cannot end up with two observers on the same callback.
	//
	// BBOobserver / config / tmr are declared in the vendored BBOobserver.js, which is
	// concatenated into this same scope AFTER us - safe to reference from a timer callback,
	// which by definition runs after load.
	var brillObserverStarted = false;
	var brillObserverFailed = false;
	
	function ensureObserver() {
		if (brillObserverStarted) return;
		try {
			if (typeof BBOobserver === 'undefined' || !PWD || !PWD.body) return;
			if (typeof tmr !== 'undefined') clearInterval(tmr);
	
			// initGlobals() is NOT optional, even though it looks like BBOalert bookkeeping.
			// BBOobserver.checkAnnouncementPanel() reads `announcemenDisplayed` - note the
			// missing 't'; globals.js declares the correctly spelled `announcementDisplayed`
			// and never uses it. The typo'd name only ever comes into existence because
			// initGlobals() does a bare `announcemenDisplayed = false` (globals.js:143), which
			// creates it as an implicit global.
			//
			// Skipping initGlobals here meant the first mutation threw ReferenceError inside
			// the observer callback - and because that callback disconnects at the top and
			// re-observes at the bottom, the throw left the observer PERMANENTLY detached.
			// Symptom: seated at a table, hooks loaded, and absolute silence.
			initGlobals();
			navDivDisplayed = true;
			setScriptList();
			brillDataLoad();
	
			// Guard the callback rather than handing BBOobserverCallback straight to the
			// observer. Its disconnect-first/re-observe-last shape means ANY exception in any
			// check kills observation for good, with no further output. Re-attaching on throw
			// turns that from fatal into a logged glitch.
			var guarded = new MutationObserver(function (list, obs) {
				try {
					BBOobserverCallback(list, obs);
				} catch (e) {
					lobbyLog('observer callback threw (re-attaching): ' + (e && e.message));
					try { obs.observe(PWD.body, config); } catch (e2) { }
				}
			});
			guarded.observe(PWD.body, config);
			brillObserverStarted = true;
			lobbyLog('MutationObserver started (watchdog); helpers=' +
				(typeof getCardByValue === 'function'));
		} catch (e) {
			// Report once, then stay quiet: this used to log every 2s forever, which buried
			// everything else. The failure is still visible, just not repeated.
			if (!brillObserverFailed) {
				brillObserverFailed = true;
				lobbyLog('observer start FAILED (will keep retrying quietly): ' + (e && e.message));
			}
		}
	}
	
	function lobbyTick() {
		ensureObserver();
		if (!scriptList.length && BRILL_SCRIPTS.length) setScriptList();   // backstop
		if (lobbyBusy) return;
		if (atTable()) return;             // PlayWithBrill's hooks own the table
	
		// Chicken-and-egg: we learn about challenges from the page's own ard.php responses, but
		// the page only fetches ard.php on the Challenges screen. Starting on the lobby home we
		// therefore have no data, conclude there is nothing to play, and never navigate - so we
		// never get data. Seed ourselves by going to the challenge list once.
		// Only in autoplay mode: report-only must stay passive and not move the user's screen.
		if (autoPlay() && !Object.keys(tlist).length) {
			if (!onChallengeList()) {
				var seed = challengesNavButton();
				if (seed.length) {
					lobbyLog('no challenge data yet - opening Challenges to load it');
					lobbyBusy = true;
					seed[0].click();
					setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 2);
				}
			}
			return;   // on the list already: just wait for the ard.php response to land
		}
	
		var todo = robotChallenges();
		var msg = todo.length
			? todo.map(function (c) { return c.tid.slice(0, 8) + ' ' + c.done + '/' + c.total; }).join(', ')
			: 'nothing to play';
		if (msg !== lastLobbyLog) { lobbyLog(msg + (autoPlay() ? '' : '  (autoplay off)')); lastLobbyLog = msg; }
		if (!todo.length || !autoPlay()) return;
	
		var target = todo[0];
		lobbyBusy = true;
	
		// If the details modal is already up, finish the job.
		if (detailsPanel().length) {
			var pn = playNowButton();
			if (pn.length) { lobbyLog('clicking "Play now!"'); pn[0].click(); }
			setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 3);
			return;
		}
	
		if (!onChallengeList()) {
			var nav = challengesNavButton();
			if (nav.length) { lobbyLog('opening Challenges'); nav[0].click(); }
			setTimeout(function () { lobbyBusy = false; }, LOBBY.settle);
			return;
		}
	
		var row = robotRow();
		if (!row.length) {
			lobbyLog('no robot row on screen for ' + target.tid.slice(0, 8) + ' - backing off');
			lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
			lobbyBusy = false;
			return;
		}
		// Guard against re-entering a challenge whose board count is not advancing.
		//
		// Observed live: both robot challenges sat at 3/4 in the tlist while the driver
		// re-entered them every few seconds forever, because the cooldown only applied when the
		// ROW was missing - not when entry produced no progress. The account owner confirmed all
		// four boards had in fact been played, so c_boards_completed_* evidently lags the last
		// board (it appears to settle only once the match is recorded as finished).
		//
		// That makes this guard load-bearing rather than a workaround: a completed challenge can
		// still read done < boards for a while, and without the cooldown the driver would keep
		// re-entering a match it has already finished.
		var prev = lobbyEntered[target.tid];
		if (prev && prev.done === target.done && (Date.now() - prev.at) > LOBBY.stallMs) {
			lobbyLog('challenge ' + target.tid.slice(0, 8) + ' stalled at ' + target.done + '/' +
				target.total + ' - cooling down instead of re-entering');
			lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
			delete lobbyEntered[target.tid];
			lobbyBusy = false;
			return;
		}
		if (!prev || prev.done !== target.done) {
			lobbyEntered[target.tid] = { done: target.done, at: Date.now() };
		}
	
		lobbyLog('entering robot challenge ' + target.tid.slice(0, 8) +
			' (' + target.done + '/' + target.total + ' boards done)');
		var item = $('div.itemClass', row);
		(item.length ? item[0] : row[0]).click();
		setTimeout(function () { lobbyBusy = false; }, LOBBY.settle);
	}
	
	setInterval(lobbyTick, LOBBY.poll);
	
	// Console handle, mirroring CuebidsWithBrill's __brill.
	window.__brillChallenge = {
		tlist: function () { return tlist; },
		todo: function () { return robotChallenges(); },
	
		// Which nav button did the language-independent matcher find? Returns null if none -
		// the first thing to check if the driver reports "nothing to play" on a non-English BBO.
		nav: function () {
			var b = challengesNavButton();
			return b.length ? b.text().replace(/\s+/g, ' ').trim() : null;
		},
	
		// Open the challenge list without enabling autoplay, so the page fetches ard.php and
		// the harvester has something to read. Read-only: it navigates, it enters nothing.
		openList: function () {
			var b = challengesNavButton();
			if (!b.length) return 'challenges nav button NOT FOUND';
			b[0].click();
			return 'clicked: ' + b.text().replace(/\s+/g, ' ').trim();
		},
		autoplay: function (on) {
			if (on === undefined) return autoPlay();
			if (on) localStorage.setItem('BRILL_CHALLENGE_AUTOPLAY', '1');
			else localStorage.removeItem('BRILL_CHALLENGE_AUTOPLAY');
			return autoPlay();
		},
		where: function () {
			return { list: onChallengeList(), table: atTable(), details: detailsPanel().length > 0 };
		},
		reset: function () { lobbyCooldown = {}; lobbyEntered = {}; lobbyBusy = false; return 'ok'; }
	};
	
	// Everything in this build lives inside one IIFE, so the vendored BBOalert accessors are
	// not reachable from the devtools console (or from a test driver's page.evaluate). Expose
	// the ones worth poking at - this is how you check the DOM layer is alive at a table.
	window.__brillDom = {
		whoAmI: function () { return whoAmI(); },
		mySeat: function () { return mySeat(); },
		dealNumber: function () { return getDealNumber(); },
		tableType: function () { return tableType(); },
		context: function () { return getContext(); },
		activePlayer: function () { return getActivePlayer(); },
		scripts: function () { return scriptList.length; },
		hooks: function () {
			return scriptList.map(function (s) { return s.split(',')[1].trim(); })
				.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
		},
		exec: function (name) { return execUserScript('%' + name + '%'); },
	
		// Why is nothing happening? Start here.
		diag: function () {
			var nav = null;
			try { nav = getNavDiv(); } catch (e) { }
			return {
				observerStarted: brillObserverStarted,
				navDivPresent: !!nav,
				navDivVisible: !!nav && isVisible(nav),
				scripts: scriptList.length,
				helpersLoaded: typeof getCardByValue === 'function',
				tableDisplayed: typeof tableDisplayed !== 'undefined' ? tableDisplayed : null
			};
		}
	};

	// ==========================================================================
	// vendored: generated: Custom/PlayWithBrill.js -> scriptList
	// ==========================================================================
	BRILL_SCRIPTS = [
	 "//Script,onAnnouncementDisplayed,\nconsole.log(getNow(true) + \" onAnnouncementDisplayed Dealnumber: \" + getDealNumber() + \" \" + JSON.stringify(deal));\nvar isClaimDialog = false;\ntry {\n\tvar panel = getAnnouncementPanel();\n\tvar panelText = $(panel).text().replace(/\\s+/g, \" \").trim();\n\tvar visibleButtons = $(\"button:visible\", panel).map(function () { return $(this).text().trim(); }).get();\n\tconsole.log(getNow(true) + \" onAnnouncementDisplayed text: \\\"\" + panelText + \"\\\" buttons: \" + JSON.stringify(visibleButtons));\n\tisClaimDialog = /\\bI claim\\b/i.test(panelText);\n\tif (isClaimDialog) {\n\t\t// Mark that a real claim happened on this deal - used by sendFinalPlay to decide whether\n\t\t// to attach &claim=true to /pbn/finalize. Without this flag we'd incorrectly tag any deal\n\t\t// with played < 52 (e.g. one missed card during capture) as a claim.\n\t\tclaimDetected = true;\n\t\t// Parse \"<Dir>: I claim <N> more tricks. Contract <making|down> <±N>. Do you accept?\"\n\t\tvar claimMatch = /\\bI claim (\\d+)\\b/i.exec(panelText);\n\t\tvar dirMatch = /^(North|South|East|West):/i.exec(panelText);\n\t\tvar resultMatch = /Contract (making|down)(?:\\s*([+\\-]?\\d+))?/i.exec(panelText);\n\t\tvar tricksClaimed = claimMatch ? parseInt(claimMatch[1], 10) : null;\n\t\tvar claimerDir = dirMatch ? dirMatch[1].charAt(0).toUpperCase() : null;\n\t\tvar resultKind = resultMatch ? resultMatch[1].toLowerCase() : null;\n\t\tvar resultDelta = resultMatch && resultMatch[2] ? parseInt(resultMatch[2], 10) : 0;\n\t\tconsole.log(getNow(true) + \" CLAIM parsed: claimer=\" + claimerDir +\n\t\t\t\" tricks=\" + tricksClaimed + \" result=\" + resultKind + \" delta=\" + resultDelta);\n\t\tvalidateClaimWithServer(panel, tricksClaimed, claimerDir, resultKind, resultDelta);\n\t}\n} catch (e) {\n\tconsole.error(getNow(true) + \" onAnnouncementDisplayed log error:\", e);\n}\n// Auto-click Yes on regular (non-claim) announcements\nif (!isClaimDialog) {\n\t$(\"button:visible:contains('Yes')\", getAnnouncementPanel()).click();\n}",
	 "//Script,onNewActivePlayer,\n// Be aware of timing, so keep animations on\ndummy = getDummyCards().join(\"\")\nconsole.log(getNow(true) +  \" onNewActivePlayer  \" + dummyCardsDisplayed + \" Dummy: \" + dummy)\nif ((dummyCardsDisplayed != dummy) && (dummy.length == 26)) {\n    dummyCardsDisplayed = dummy;\n    onDummyCardsDisplayed();\n} else if (dummy.length > 0 && dummy.length < 26 && dummyCardsDisplayed.length < 26) {\n    // BBO might not have rendered all dummy cards yet, retry with increasing delays\n    console.log(getNow(true) + \" Dummy not fully rendered (\" + (dummy.length/2) + \" cards), retrying...\");\n    var retryDelays = [50, 100, 200, 400];\n    retryDelays.forEach(function(delay) {\n        setTimeout(function() {\n            if (dummyCardsDisplayed.length == 26) return; // Already captured\n            var retryDummy = getDummyCards().join(\"\");\n            console.log(getNow(true) + \" Retry dummy after \" + delay + \"ms: \" + retryDummy + \" (\" + (retryDummy.length/2) + \" cards)\");\n            if ((dummyCardsDisplayed != retryDummy) && (retryDummy.length == 26)) {\n                dummyCardsDisplayed = retryDummy;\n                onDummyCardsDisplayed();\n            }\n        }, delay);\n    });\n}\n",
	 "//Script,onNewDeal,\nconsole.log(getNow(true) + \" onNewDeal \" + getDealNumber() + \" \" + myCardsDisplayed);\nnewdeal = true\ndummyCardsDisplayed = \"\";\nmyCardsDisplayed = \"\";\n",
	 "//Script,onMyCardsDisplayed,\nconsole.log(getNow(true) + \" onMyCardsDisplayed \" + myCardsDisplayed + \" Dealnumber: \" + getDealNumber() + \" \" + JSON.stringify(deal));\n",
	 "//Script,onNewAuction,\nconsole.log(getNow(true) + \" onNewAuction\");\nvar ctx = getContext();\nif (ctx.endsWith(\"------\") && ctx != \"--------\" && ctx.length >= 8) {\n    execUserScript('%onBeforeFirstLead%');\n}\n",
	 "//Script,onNewState,\nconsole.log(getNow(true) + \" onNewState \" + currentAuction);\nif ((currentAuction.length >= 8) && (currentAuction.endsWith('------'))) {\n    execUserScript('%onAuctionEnd%');\n} else {\n    console.log(getNow(true) + \" onNewState myTurn \" + isMyTurn()) + \" \" + (isItMe(getPlayerAtSeat(getDirectionToBid()))+ \" \" + getPlayerAtSeat(getDirectionToBid()) + \" \" + getDirectionToBid());\n    if (isMyTurn()) execUserScript('%onMyTurnToBid%');\n}",
	 "//Script,onAuctionBegin,\nconsole.log(getNow(true) + \" onAuctionBegin\");\nexecUserScript('%onNewState%');\n",
	 "//Script,onAuctionEnd,\nconsole.log(getNow(true) + \" onAuctionEnd\");\nexecUserScript('%onBeforePlayingCard%');\nif (isMyTurnToPlay()) execUserScript('%onMyTurnToPlay%');\n",
	 "//Script,onBiddingBoxDisplayed,\nconsole.log(getNow(true) + \" onBiddingBoxDisplayed\");\n",
	 "//Script,onAuctionBoxDisplayed,\nconsole.log(getNow(true) + \" onAuctionBoxDisplayed\");\n",
	 "//Script,onMyLead,\nconsole.log(getNow(true) + \" onMyLead\");\n",
	 "//Script,onDealEnd,\nconsole.log(getNow(true) + \" onDealEnd\");\n",
	 "//Script,onNewPlayedCard,\nconsole.log(getNow(true) + \" onNewPlayedCard \" + getPlayedCards() + \" turn \" + whosTurn());\nif (whosTurn() != \"\") {\n    execUserScript('%onBeforePlayingCard%');\n    if (isMyTurnToPlay()) execUserScript('%onMyTurnToPlay%');\n}",
	 "//Script,onBeforePlayingCard,\nconsole.log(getNow(true) + \" onBeforePlayingCard \" + whosTurn());",
	 "//Script,onNewActivePlayer,\nconsole.log(getNow(true) + \" onNewActivePlayer \" + activePlayer);",
	 "//Script,onMyTurnToBid,\nconsole.log(getNow(true) + \" onMyTurnToBid context: \" + getContext());",
	 "//Script,onMyTurnToPlay,\nconsole.log(getNow(true) + \" onMyTurnToPlay Cards played: \" + getPlayedCards());",
	 "//Script,onAnnouncement,\nconsole.log(getNow(true) + \" onAnnouncement event fired\");\ntry {\n\tvar annText = $(\".announcementClass:visible\", parent.window.document).text().replace(/\\s+/g, \" \").trim();\n\tconsole.log(getNow(true) + \" onAnnouncement text: \\\"\" + annText + \"\\\"\");\n} catch (e) { }",
	 "//Script,onNotification,\nconsole.log(getNow(true) + \" onNotification event fired\");\ntry {\n\tvar notifText = $(\".notificationClass:visible\", parent.window.document).text().replace(/\\s+/g, \" \").trim();\n\tconsole.log(getNow(true) + \" onNotification text: \\\"\" + notifText + \"\\\"\");\n} catch (e) { }",
	 "//Script,onNotificationDisplayed,\nconsole.log(getNow(true) + \" onNotificationDisplayed event fired\");\ntry {\n\tvar notifText = $(\".notificationClass:visible\", parent.window.document).text().replace(/\\s+/g, \" \").trim();\n\tconsole.log(getNow(true) + \" onNotificationDisplayed text: \\\"\" + notifText + \"\\\"\");\n} catch (e) { }",
	 "//Script,onDataLoad,\ncurrentContext = \"??\";\ndummyCardsDisplayed = \"\";\ngetCardByValue = function (cval) {\n    let cv =  cval.replace(\"T\", \"10\");\n    var card = $(\"bridge-screen\", parent.window.document).find(\".topLeft:visible\").filter(function () {\n        if (replaceSuitSymbols(this.textContent, \"\") == cv) return this;\n    });\n    if (card.length != 0) return card[0];\n    return null;\n}\n\nplayCardByValue = function (cv) {\n    var card = getCardByValue(cv);\n    if (card != null) {\n        card.click();\n        card.click();\n    }\n}\n\ngetCardsByDirection = function (direction) {\n    let cards = [];\n    let zidx = \"\";\n    switch (direction) {\n        case \"S\" : zidx = \"1\"; break;\n        case \"W\" : zidx = \"2\"; break;\n        case \"N\" : zidx = \"3\"; break;\n        case \"E\" : zidx = \"4\"; break;\n        default : return cards;\n    }\n    $(\"bridge-screen .cardSurfaceClass\", getNavDiv()).find(\".cardClass:visible\").each(function () {\n        if (this.style.zIndex.startsWith(zidx)) {\n            let c = $(this).find(\".topLeft\").text();\n            c = replaceSuitSymbols(c, \"\").replace(\"10\", \"T\");\n            if (c.length == 2) cards.push(c);\n        }\n    });\n    return cards;\n}\n\nfunction getCard(index) {\n    var card = parent.$(\".cardClass:visible\").filter(function () {\n        return $(this).css('z-index') == index;\n    }).text();\n    if (card.length == 6) {\n        card = \"T\" + card.slice(-1);\n    } else card = card.slice(0, 2);\n    return card;\n}\n\ngetMyCards = function () {\n    return getCardsByDirection(mySeat());\n}\n\ngetDummyCards = function () {\n    return getCardsByDirection(getDummyDirection());\n}\n\ngetDeclarerCards = function () {\n    return getCardsByDirection(getDeclarerDirection());\n}\n\nisMyTurnToBid = function () {\n    return isItMe(getPlayerAtSeat(getDirectionToBid()));\n}\n\nisMyTurnToPlay = function () {\n    if (whosTurn() == getDummyDirection())\n        if (isItMe(getPlayerAtSeat(getDeclarerDirection()))) return true;\n    return isItMe(getPlayerAtSeat(whosTurn()));\n}\n\nisMyTurn = function () {\n    return (isMyTurnToBid()||isMyTurnToPlay());\n}\n\nwhosTurn = function () {\n    return $(\"bridge-screen,parent\", parent.window.document).find(\".nameBarClass:visible\").filter(function () {\n        if (this.style.backgroundColor == 'rgb(255, 206, 0)') return this;\n    }).find(\".directionClass\").text();\n}\n\ndelayedAlert = function (txt, delay = 0) {\n    setTimeout(function () {\n        alert(txt);\n    }, delay)\n}\n\nselectBid = function (bid, alert = false) {\n    let bbb = parent.$(\"bidding-box button\");\n    if (bbb.length != 17) return;\n    if (alert != (bbb[15].style.backgroundColor == 'rgb(255, 255, 255)')) bbb[15].click();\n    switch (bid) {\n        case \"--\": bbb[12].click(); break;\n        case \"Db\": bbb[13].click(); break;\n        case \"Rd\": bbb[14].click(); break;\n        default:\n            $(bbb).each(function (idx) {\n                if (idx < 12)\n                    if (bid.indexOf(replaceSuitSymbols(this.textContent.substring(1), \"\")) != -1) this.click();\n            });\n    }\n}\n\nisItMe = function (uid) {\n    return ((uid.toLowerCase() == whoAmI().toLowerCase()));\n}\n\nonNewState = function () {\n    execUserScript('%onNewState%');\n}\n\ngetDealerDirection = function () {\n    return \"NESW\".charAt((getDealNumber() - 1) % 4);\n}\n\ngetDirectionToBid = function () {\n    if (getContext() == \"??\") return \"\";\n    return \"NESW\".charAt((getDealNumber() - 1 + getContext().length / 2) % 4);\n}\n\ngetPlayerAtSeat2 = function (seat) {\n    let player = $(\".nameBarDivClass\", getNavDiv()).filter(function () {\n        return (this.textContent.startsWith(seat));\n    }).text();\n\tconsole.log(player)\n    // Extract everything before \"@font-face\"\n    let cutoff = player.indexOf(\" @font-face\");\n    if (cutoff !== -1) {\n        player = player.substring(0, cutoff);\n    }\n    return player.substring(1);\n}\n\ngetPlayerAtSeat = function (seat) {\n    return $(\".nameBarDivClass\", getNavDiv()).filter(function () {\n        return (this.textContent.startsWith(seat));\n    }).find(\".nameDisplayClass\").text();\n}\n\ngetDeclarerDirection = function () {\n    return $(\".tricksPanelTricksLabelClass:visible\", getNavDiv()).text().substring(0, 1);\n}\n\ngetDummyDirection = function () {\n    let declarer = getDeclarerDirection();\n    if (declarer == \"\") return \"\";\n    return \"NESWNESW\".charAt(\"NESW\".indexOf(declarer) + 2);\n}\n\nwindow.getCard = function (index) {\n    $(\".tricksPanelTricksLabelClass:visible\", getNavDiv()).text().substring(0, 1);\n    var card = parent.$(\".cardClass:visible\").filter(function () {\n        return ($(this).css('z-index') == index);\n    }).text();\n    if (card.length == 6) {\n        card = \"T\" + card.slice(-1);\n    } else card = card.slice(0, 2);\n    return card;\n}\n\nwindow.onAuctionBoxHidden = function () {\n    activePlayer = '';\n    BBOalertEvents().dispatchEvent(E_onAuctionBoxHidden);\n    execUserScript('%onAuctionBoxHidden%');\n}\nwindow.getActivePlayer = function getActivePlayer() {\n    var name = $('bridge-screen deal-viewer .nameBarClass', PWD)\n        .filter(function () {\n            return this.style.backgroundColor === \"rgb(255, 206, 0)\";\n        }).find(\":lt(2)\").text();\n    if (name == '') {\n        name = $('bridge-screen deal-viewer .nameBarClass', PWD)\n            .filter(function () {\n                return this.style.backgroundColor === \"rgb(204, 204, 154)\";\n            }).find(\":lt(2)\").text();\n    }\n    // return direction + UID in lower case\n\t// console.log(name);\n    return name.charAt(0) + name.substring(1).toLowerCase();\n}\n\nwindow.onNewAuction = function onNewAuction() {\n    if (!auctionBoxDisplayed) return;\n    execUserScript('%onNewState%');\n    if (currentAuction != '')\n        if (currentAuction != '??') {\n            ctxArray = bidArray(stripContext(getContext()));\n            BBOalertEvents().dispatchEvent(E_onNewAuction);\n            execUserScript('%onNewAuction%');\n\t\t\tactivePlayer = getActivePlayer();\n            console.log(getNow(true) + \" Next Active player \" + activePlayer);\n            if (activePlayer.slice(0, 1) == directionRHO()) {\n                console.log(getNow(true) + \" Partner bid \" + getContext().slice(-2));\n                BBOalertEvents().dispatchEvent(E_onPartnerAuction);\n                execUserScript('%onPartnerAuction%');\n            }\n            if (activePlayer.slice(0, 1) == directionLHO()) {\n                console.log(getNow(true) + \" My bid \" + getContext().slice(-2));\n                BBOalertEvents().dispatchEvent(E_onMyAuction);\n                execUserScript('%onMyAuction%');\n            }\n            if (activePlayer.slice(0, 1) == myDirection()) {\n                console.log(getNow(true) + \" RHO bid \" + getContext().slice(-2));\n                BBOalertEvents().dispatchEvent(E_onRHOAuction);\n                execUserScript('%onRHOAuction%');\n            }\n            if (activePlayer.slice(0, 1) == partnerDirection()) {\n                console.log(getNow(true) + \" LHO bid \" + getContext().slice(-2));\n                BBOalertEvents().dispatchEvent(E_onLHOAuction);\n                execUserScript('%onLHOAuction%');\n            }\n        }\n}\n\nwindow.onAuctionBoxHidden = function () {\n    activePlayer = '';\n    BBOalertEvents().dispatchEvent(E_onAuctionBoxHidden);\n    execUserScript('%onAuctionBoxHidden%');\n}\n\nwindow.onNewActivePlayer = function () {\n    if (lastDealNumber != \"\") {\n        BBOalertEvents().dispatchEvent(E_onNewActivePlayer);\n        execUserScript('%onNewActivePlayer%');\n    }\n}\n\nwindow.mySeat = function() {\n    return $(\".auction-header\",getNavDiv()).text().slice(-2,-1);\n}\n\nwindow.onDummyCardsDisplayed = function () {\n    execUserScript('%onDummyCardsDisplayed%');\n}",
	 "//Script,onDummyCardsDisplayed,\nconsole.log(getNow(true) + \" onDummyCardsDisplayedBrill \" + dummyCardsDisplayed);\nif (deal[\"finished\"]) {\n\tconsole.log(getNow(true) + \" onDummyCardsDisplayed after deal finished \" + dummyCardsDisplayed + \" \" + JSON.stringify(deal))\n} else {\n\tif (deal[\"played\"] && deal[\"played\"].length > 4 && deal[\"dummy\"] != \"\") {\n\t\t// Ignore the display of dummy\n\t\t// But sometimes it might be late, so grab it if we have no dummy\n\t} else {\n\t\tif (dummyCardsDisplayed.length == 26) {\n\t\t\t// When playing defend only the order is a bit different\n\t\t\tif (newdeal) {\n\t\t\t\t// Defensive: onDataLoad block may not have run yet (BBOalert script evaluation race).\n\t\t\t\t// initdeal lives in the bottom onDataLoad block - skip if not yet defined.\n\t\t\t\tif (typeof initdeal === \"function\") initdeal();\n\t\t\t\telse console.warn(getNow(true) + \" onDummyCardsDisplayed: initdeal not yet defined, skipping init\");\n\t\t\t}\n\t\t\tdeal[\"dummy\"] = formatCardsDisplayed(dummyCardsDisplayed)\n\t\t\tif (deal[\"dummy\"] == deal[\"hand\"]) {\n\t\t\t\tconsole.log(getNow(true) + \" BBO moved me to the declarer position\");\n\t\t\t\tdeal[\"hand\"] = formatCards(getDeclarerCards())\n\t\t\t\tdeal[\"seat\"] = getDeclarerDirection()\n\t\t\t\tconsole.log(getNow(true) + \" \" + JSON.stringify(deal))\n\t\t\t}\n\t\t\tsavedeal(dealnumber, deal)\n\t\t} else {\n\t\t\tif (deal[\"dummy\"] == \"\" || !deal[\"dummy\"]) {\n\t\t\t\tconsole.log(getNow(true) + \" Dummy incomplete (\" + (dummyCardsDisplayed.length/2) + \" cards), will retry in BrillsTurnToPlay\");\n\t\t\t}\n\t\t}\n\t}\n\t\n}\n",
	 "//Script,onMyCardsDisplayed,\nconsole.log(getNow(true) + \" onMyCardsDisplayedYY \" + myCardsDisplayed);\n// BBO will redisplay the hand after the deal finish\nif (deal[\"finished\"]) {\n\tconsole.log(getNow(true) + \" myCardsDisplayed after deal finished \" + dummyCardsDisplayed + \" \" + JSON.stringify(deal))\n} else {\n\tif (deal[\"played\"] && deal[\"played\"].length > 4) {\n\t\tconsole.log(getNow(true) + \" onMyCardsDisplayed after deal in progress \" + myCardsDisplayed + \" \" + JSON.stringify(deal))\n\t} else {\n\t\tif (deal[\"hand\"]) {\n\t\t\tconsole.log(getNow(true) + \" myCardsDisplayed with hand already \" + deal[\"hand\"] + \" \" + dummyCardsDisplayed + \" \" + getMyCards())\n\t\t} else {\n\t\t\tif (myCardsDisplayed.length == 26) {\n\t\t\t\tdeal[\"hand\"] = formatCardsDisplayed(getMyCards())\n\t\t\t\tdeal[\"seat\"] = myDirection()\n\t\t\t\tconsole.log(getNow(true) + \" Updated hand with myCardsDisplayed \" + myCardsDisplayed + \" \" + getMyCards() + \" \" + deal[\"hand\"] + \" dealnumber: \" + getDealNumber())\n\t\t\t\tsavedeal(getDealNumber(), deal)\n\t\t\t}\n\t\t}\n\t}\n}\n",
	 "//Script,onNewDeal,\nremoveAds(true);\nnewdeal = true\ndeal = {}\ndeal[\"number\"] = getDealNumber()\nbiddingInProgress = false\nplayInProgress = false\nlastBidCtx = null\nlastPlayKey = null\nfinalPlaySent = false\nclaimDetected = false\n",
	 "//Script,onDealEnd,\ndealnumber = getDealNumber()\ndeal[\"finished\"] = true\nsendFinalPlay()\nremovedeal()\nconsole.log(getNow(true) + \" onDealEnd - Deal removed\")\nnewdeal = true;\n",
	 "//Script,onAuctionEnd,\n// Detect passed-out auction (4 passes, no contract) and finalize the deal so it shows up in the PBN file.\n// onDealEnd often doesn't fire for passed-out auctions, so we need to finalize here.\nif (getContext() === \"--------\") {\n\tconsole.log(getNow(true) + \" onAuctionEnd - passed out auction detected, finalizing\");\n\tsendFinalPlay();\n}\nif (tableType() == \"no\") {\n\tdealnumber = getDealNumber()\n\tremovedeal()\n\tconsole.log(getNow(true) + \" onAuctionEnd - Deal removed\")\n\tnewdeal = true\n}\n",
	 "//Script,onBeforeFirstLead,\nif (getActivePlayer().substring(0,1) == mySeat()) {\n    execUserScript('%onMyTurnToPlay%');\n}\n\n",
	 "//Script,onBeforePlayingCard,\nconsole.log(getNow(true) + \" onMyBeforePlayingCard \" + getPlayedCards() + \" turn \" + whosTurn());\n",
	 "//Script,onMyTurnToBid,\nconsole.log(getNow(true) + \" onMyTurnToBidBrill \"+ getContext());\nif (deal[\"finished\"] && getDealNumber() != deal[\"number\"]) {\n\tconsole.log(getNow(true) + \" onMyTurnToBid new board detected, reinitializing deal\");\n\tnewdeal = true;\n\tdeal[\"finished\"] = false;\n}\nvar currentBidCtx = getContext();\nif (deal[\"finished\"]) {\n\tconsole.log(getNow(true) + \" onMyTurnToBid called after deal finished\" + \" \" + JSON.stringify(deal))\n} else if (biddingInProgress) {\n\tconsole.log(getNow(true) + \" onMyTurnToBid skipped, bid request already in progress\")\n} else if (lastBidCtx === currentBidCtx) {\n\tconsole.log(getNow(true) + \" onMyTurnToBid skipped, already processed ctx: \" + currentBidCtx)\n} else {\n\tbiddingInProgress = true;\n\tlastBidCtx = currentBidCtx;\n\t// Give BBO time to get stuff in place\n\tvar overlay = addSpinner()\n\tctx = currentBidCtx\n\tif (ctx == \"\") {\n\t\tsetTimeout(function () {\n\t\t\trequestIdleCallback(() => BrillsTurnToBid(overlay), { timeout: 3000 });\n\t\t}, 3000)\n\t} else {\n\t\tsetTimeout(function () {\n\t\t\trequestIdleCallback(() => BrillsTurnToBid(overlay), { timeout: 3000 });\n\t\t}, 500)\n\t}\n}\n",
	 "//Script,onMyTurnToPlay,\nconsole.log(getNow(true) + \" onMyTurnToPlayBrill\");\nif (deal[\"finished\"] && getDealNumber() != deal[\"number\"]) {\n\tconsole.log(getNow(true) + \" onMyTurnToPlay new board detected, reinitializing deal\");\n\tnewdeal = true;\n\tdeal[\"finished\"] = false;\n}\n// Dedup key combines played-count and current played cards on screen so repeated fires for the same turn are skipped\nvar currentPlayKey = (deal[\"played\"] ? deal[\"played\"].length : 0) + \"|\" + getPlayedCards();\nif (deal[\"finished\"]) {\n\tconsole.log(getNow(true) + \" onMyTurnToPlay called after deal finished\" + \" \" + JSON.stringify(deal))\n} else if (playInProgress) {\n\tconsole.log(getNow(true) + \" onMyTurnToPlay skipped, play request already in progress\")\n} else if (lastPlayKey === currentPlayKey) {\n\tconsole.log(getNow(true) + \" onMyTurnToPlay skipped, already processed key: \" + currentPlayKey)\n} else {\n\tplayInProgress = true;\n\tlastPlayKey = currentPlayKey;\n\tconsole.log(getNow(true) + \" onMyTurnToPlay current trick: \" + deal[\"played\"])\n\tvar overlay = addSpinner()\n\tif (deal[\"played\"] && deal[\"played\"].length > 0) {\n\t\tsetTimeout(function () {\n\t\t\trequestIdleCallback(() => BrillsTurnToPlay(overlay), { timeout: 3000 });\n\t\t}, 500)\n\t} else {\n\t\tsetTimeout(function () {\n\t\t\trequestIdleCallback(() => BrillsTurnToPlay(overlay), { timeout: 3000 });\n\t\t}, 2000)\n\t}\n}\n",
	 "//Script,onNewPlayedCard,\n// This event calls onMyTurnToPlay, so make no change here\nif (!isMyTurnToPlay()) {\n\tdeal[\"played\"] = updatePlayedCards(deal[\"played\"])\n\tsavedeal(dealnumber, deal)\n}\n// Send final /play as soon as the 52nd card is recorded - before any onDealEnd/onNewDeal race can wipe deal state\nif (deal[\"played\"] && deal[\"played\"].length == 52 && !finalPlaySent) {\n\tsendFinalPlay()\n}\n",
	 "//Script,onDataLoad,\n\ncardExists = function (card, array) {\n\treturn array.some(function (existingCard) {\n\t\t// Assuming cards are objects with unique identifiers like 'id'\n\t\treturn existingCard === card\n\t});\n}\n// Server selection: in the BBO browser console run\n//   localStorage.BRILL_SERVER = 'local'     -> http://localhost:5200\n//   localStorage.BRILL_SERVER = 'localssl'  -> https://localhost:7200  (note: https, not http)\n//   localStorage.removeItem('BRILL_SERVER') -> back to brillservice (default)\n// BRILL_SERVER accepts:\n//   (unset)      https://brillservice.aalborgdata.dk   - the default\n//   'local'      http://localhost:5200                 - Brill's plain HTTP port\n//   'localssl'   https://localhost:7200                - Brill's SSL port\n//   any URL      used verbatim, e.g. 'https://localhost:7200' or a staging host\n//\n// The SSL port is worth preferring for local work: BBO is served over HTTPS, so calling\n// http://localhost:5200 is a mixed-content request. Browsers normally exempt localhost from\n// mixed-content blocking, but that exemption has moved around between versions - if bids\n// silently stop arriving with 'local', check the console for a blocked request and switch\n// to 'localssl'.\ngetBrillBaseUrl = function () {\n\tvar s = localStorage.getItem('BRILL_SERVER');\n\tif (!s) return 'https://brillservice.aalborgdata.dk';\n\tif (/^https?:\\/\\//i.test(s)) return s.replace(/\\/+$/, '');\n\tif (s === 'local') return 'http://localhost:5200';\n\tif (s === 'localssl') return 'https://localhost:7200';\n\treturn 'https://brillservice.aalborgdata.dk';\n}\n// Player naming for the saved PBN. The server stamps names on the board-saving calls (/play,\n// /claim, /pbn/finalize) into [North]/[East]/[South]/[West] and derives [Room] from the board\n// label (Open, or Closed when it ends in _robot).\n//\n// On a live BBO table Brill drives ONLY our own seat (every action is gated on isItMe()==whoAmI),\n// so the OTHER three seats are BBO's own robots (GIB / Ben / an opponent), each with its own name.\n// Recording all three as \"Brill\" (the old getRobotName) was wrong on two counts: they aren't Brill,\n// and the seat Brill actually played was ours. So we now send the ACTUAL name at each seat and label\n// only the Brill-driven seat \"Brill\". getSeatDisplayName(dir) returns \"Brill\" for our own seat and\n// BBO's on-screen name for the rest; sent per-seat as &south/&north/&east/&west.\n// user= is a caller/tool identity tag the server ignores, so it is not sent on these calls.\ngetRobotName = function () {\n\treturn \"Brill\";\n}\ngetSeatDisplayName = function (dir) {\n\tvar name = (getPlayerAtSeat(dir) || \"\").trim();\n\t// Our own seat is the one Brill operates -- match on the on-screen name (same test isItMe uses)\n\t// with deal[\"seat\"] as a fallback for when the name isn't rendered at save time. Label it \"Brill\".\n\tvar me = (typeof whoAmI === \"function\" ? (whoAmI() || \"\") : \"\").trim();\n\tvar isHeroSeat = (name && me && name.toLowerCase() === me.toLowerCase())\n\t\t|| (typeof deal !== \"undefined\" && deal && deal[\"seat\"] === dir);\n\tif (isHeroSeat) return getRobotName();\n\treturn name; // BBO's own name for this seat (GIB / Ben / opponent)\n}\nnewdeal = true\ndealnumber = \"\"\ndeal = {}\nbiddingInProgress = false\nplayInProgress = false\nlastBidCtx = null\nlastPlayKey = null\nfinalPlaySent = false\nclaimDetected = false\ngetSuit = function (txt) {\n\tlet t = txt;\n\tswitch (t) {\n\t\tcase 'C':\n\t\tcase '♣':\n\t\tcase '♧':\n\t\t\treturn 3; // Clubs\n\t\tcase 'D':\n\t\tcase '♦':\n\t\tcase '♢':\n\t\t\treturn 2; // Diamonds\n\t\tcase 'H':\n\t\tcase '♥':\n\t\tcase '♡':\n\t\t\treturn 1; // Hearts\n\t\tcase 'S':\n\t\tcase '♠':\n\t\tcase '♤':\n\t\t\treturn 0; // Spades\n\t\tdefault:\n\t\t\treturn -1; // Unknown symbol\n\t}\n}\n\ngetSuitPlayed = function (txt) {\n\tlet t = txt;\n\tswitch (t) {\n\t\tcase 'C':\n\t\tcase '♣':\n\t\tcase '♧':\n\t\t\treturn 'C'; // Clubs\n\t\tcase 'D':\n\t\tcase '♦':\n\t\tcase '♢':\n\t\t\treturn 'D'; // Diamonds\n\t\tcase 'H':\n\t\tcase '♥':\n\t\tcase '♡':\n\t\t\treturn 'H'; // Hearts\n\t\tcase 'S':\n\t\tcase '♠':\n\t\tcase '♤':\n\t\t\treturn 'S'; // Spades\n\t\tdefault:\n\t\t\treturn -1; // Unknown symbol\n\t}\n}\n\nformatCards = function (cards) {\n\tlet suits = [\"\", \"\", \"\", \"\"];\n\tfor (c of cards) {\n\t\tlet suit = getSuit(c[c.length - 1])\n\t\tif (suit != -1) {\n\t\t\tsuits[suit] = c[0].replace(\"1\", \"T\") + suits[suit];\n\t\t}\n\t}\n\tlet hand = suits.join(\".\");\n\treturn hand;\n}\n\nformatCardsPlayed = function (cards) {\n\tlet played = cards.join(\"\");\n\treturn played;\n}\n\nformatCardsDisplayed = function (cards) {\n\tlet played = \"\";\n\tlet suits = [\"\", \"\", \"\", \"\"];\n\t// Loop over the string in steps of 2 characters\n\tif (typeof cards !== \"string\") {\n\t\t//console.error(\"Invalid input: cards should be a string.\");\n\t\t//console.error(\"Received: \", cards);\n\t\tcards = cards.join(\"\");\n\t}\n\t\n\tfor (let i = 0; i < cards.length; i += 2) {\n\t\tlet card = cards.substring(i, i + 2); // Get a pair of characters from the string\n\t\tlet suit = getSuit(card.charAt(1)); // Get the suit from the second character\n\t\tif (suit != -1) {\n\t\t\tsuits[suit] = card[0].replace(\"1\", \"T\") + suits[suit];\n\t\t}\n\t}\n\tplayed = suits.join(\".\")\n\treturn played;\n}\n\n// Inject a stylesheet ONCE that hides ad slots with !important so GPT/Prebid\n// re-injection can't override it. Also nukes ad iframes to kill their scripts\n// (GPT refresh cycles burn CPU even on display:none elements).\nremoveAds = function (on) {\n\tif (!on) return;\n\ttry {\n\t\tvar doc = parent.window.document;\n\t\t// 1) Persistent CSS - hides ads even if BBO/GPT re-injects them\n\t\tif (!doc.getElementById(\"brill-no-ads-css\")) {\n\t\t\tvar style = doc.createElement(\"style\");\n\t\t\tstyle.id = \"brill-no-ads-css\";\n\t\t\tstyle.textContent =\n\t\t\t\t\"#bbo_ad1, #bbo_ad2, [id^='bbo_ad'], \" +\n\t\t\t\t\"iframe[src*='googleads'], iframe[src*='securepubads'], \" +\n\t\t\t\t\"iframe[src*='doubleclick'], iframe[src*='amazon-adsystem'], \" +\n\t\t\t\t\"iframe[src*='adnxs'], iframe[src*='googlesyndication'], \" +\n\t\t\t\t\".adsbygoogle { display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; }\" +\n\t\t\t\t\"#bbo_app { left: 0px !important; right: 0px !important; width: auto !important; }\";\n\t\t\tdoc.head.appendChild(style);\n\t\t}\n\t\t// 2) Actively remove ad iframes - stops their JS from running and saves CPU\n\t\t$(\"iframe[src*='googleads'], iframe[src*='securepubads'], \" +\n\t\t  \"iframe[src*='doubleclick'], iframe[src*='amazon-adsystem'], \" +\n\t\t  \"iframe[src*='adnxs'], iframe[src*='googlesyndication']\", doc).remove();\n\t\t// 3) Empty the ad slot containers (their inner GPT div+iframe go away)\n\t\t$(\"#bbo_ad1, #bbo_ad2\", doc).empty();\n\t} catch (e) {\n\t\tconsole.error(getNow(true) + \" removeAds error:\", e);\n\t}\n};\n\nremoveAds(true);\n// GPT re-runs auctions every ~30s. Re-empty the ad slots periodically to keep iframes from\n// taking back over. Cheap: one jQuery query + .remove() per tick. CSS keeps them invisible.\nif (typeof brillAdInterval === \"undefined\" || !brillAdInterval) {\n\tbrillAdInterval = setInterval(function () { removeAds(true); }, 15000);\n}\n\nupdatePlayedCards = function (recordedPlays) {\n\tlet cards = getPlayedCards()\n\n\tfor (let i = 0; i < cards.length; i += 2) {\n\t\tlet card = cards.substring(i, i + 2); // Get a pair of characters from the string\n\t\tlet suit = getSuitPlayed(card.charAt(1)); // Get the suit from the second character\n\t\tif (suit != -1) {\n\t\t\tvar played = suit + card.charAt(0).replace(\"1\", \"T\"); // Append the suit and rank to the result\n\t\t\tif (!cardExists(played, recordedPlays)) {\n\t\t\t\trecordedPlays.push(played);\n\t\t\t}\n\t\t}\n\t}\n\treturn recordedPlays;\n}\n\n// Defensive dedupe - despite cardExists checks, duplicates have been observed (probably from brief\n// screen states where a previous trick's winning card is still rendered alongside the new trick).\n// Sending duplicates to the server triggers \"No cards remaining\" errors.\ndedupePlayedCards = function (cards) {\n\tif (!cards || cards.length == 0) return cards;\n\tvar seen = {};\n\tvar result = [];\n\tfor (var i = 0; i < cards.length; i++) {\n\t\tvar c = cards[i];\n\t\tif (seen[c]) {\n\t\t\tconsole.warn(getNow(true) + \" dedupe: dropping duplicate \" + c + \" at index \" + i);\n\t\t\tcontinue;\n\t\t}\n\t\tseen[c] = true;\n\t\tresult.push(c);\n\t}\n\treturn result;\n}\n\ngetTrumpSuit = function(ctx) {\n\t// Find the last real bid (not pass/double/redouble) to determine trump suit\n\tfor (var i = ctx.length - 2; i >= 0; i -= 2) {\n\t\tvar bid = ctx.substring(i, i + 2);\n\t\tif (bid != \"--\" && bid != \"Db\" && bid != \"Rd\") {\n\t\t\tvar suit = bid.charAt(1);\n\t\t\tif (suit == \"N\") return \"\"; // No Trump\n\t\t\treturn suit; // S, H, D, or C\n\t\t}\n\t}\n\treturn \"\";\n}\n\n// Reconstruct any direction's original 13-card hand by combining the cards\n// currently visible on screen with the cards that direction has already played.\nreconstructHand = function (direction, currentCards, playedCards, declarerDir, ctx) {\n\tif (!playedCards || playedCards.length == 0) return formatCards(currentCards || []);\n\tif (!declarerDir) return formatCards(currentCards || []);\n\n\tvar trumpSuit = getTrumpSuit(ctx);\n\tvar leaderDir = \"NESWNESW\".charAt(\"NESW\".indexOf(declarerDir) + 1);\n\tvar ranks = \"23456789TJQKA\";\n\tvar dirPlayedCards = [];\n\tvar currentLeader = leaderDir;\n\n\tvar fullTricks = Math.floor(playedCards.length / 4);\n\tfor (var t = 0; t < fullTricks; t++) {\n\t\tvar trickStart = t * 4;\n\t\tvar playOrder = [];\n\t\tvar dir = currentLeader;\n\t\tfor (var j = 0; j < 4; j++) {\n\t\t\tplayOrder.push(dir);\n\t\t\tdir = \"NESWNESW\".charAt(\"NESW\".indexOf(dir) + 1);\n\t\t}\n\t\tfor (var j = 0; j < 4; j++) {\n\t\t\tif (playOrder[j] == direction) {\n\t\t\t\tdirPlayedCards.push(playedCards[trickStart + j]);\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\t\t// Determine winner to track next leader\n\t\tvar leadSuit = playedCards[trickStart].charAt(0);\n\t\tvar winnerIdx = 0;\n\t\tvar winnerRank = ranks.indexOf(playedCards[trickStart].charAt(1));\n\t\tvar winnerIsTrump = (leadSuit == trumpSuit);\n\t\tfor (var j = 1; j < 4; j++) {\n\t\t\tvar cardSuit = playedCards[trickStart + j].charAt(0);\n\t\t\tvar cardRank = ranks.indexOf(playedCards[trickStart + j].charAt(1));\n\t\t\tif (trumpSuit != \"\" && cardSuit == trumpSuit && !winnerIsTrump) {\n\t\t\t\twinnerIdx = j; winnerRank = cardRank; winnerIsTrump = true;\n\t\t\t} else if (trumpSuit != \"\" && cardSuit == trumpSuit && winnerIsTrump && cardRank > winnerRank) {\n\t\t\t\twinnerIdx = j; winnerRank = cardRank;\n\t\t\t} else if (cardSuit == leadSuit && !winnerIsTrump && cardRank > winnerRank) {\n\t\t\t\twinnerIdx = j; winnerRank = cardRank;\n\t\t\t}\n\t\t}\n\t\tcurrentLeader = playOrder[winnerIdx];\n\t}\n\t// Handle incomplete trick (cards played but trick not finished)\n\tvar remainingCards = playedCards.length % 4;\n\tif (remainingCards > 0) {\n\t\tvar trickStart = fullTricks * 4;\n\t\tvar dir = currentLeader;\n\t\tfor (var j = 0; j < remainingCards; j++) {\n\t\t\tif (dir == direction) {\n\t\t\t\tdirPlayedCards.push(playedCards[trickStart + j]);\n\t\t\t}\n\t\t\tdir = \"NESWNESW\".charAt(\"NESW\".indexOf(dir) + 1);\n\t\t}\n\t}\n\t// Combine: currentCards is rank+suit format (\"KD\"); playedCards entries are suit+rank (\"DK\")\n\t// Dedupe defensively - currentCards may already include cards from the current trick that are\n\t// also in the played array, which would otherwise produce a hand > 13 cards.\n\tvar seen = {};\n\tvar allCards = [];\n\tfor (var i = 0; i < (currentCards || []).length; i++) {\n\t\tvar c = currentCards[i];\n\t\tif (!seen[c]) { seen[c] = true; allCards.push(c); }\n\t}\n\tfor (var i = 0; i < dirPlayedCards.length; i++) {\n\t\tvar played = dirPlayedCards[i];\n\t\tvar asCard = played.charAt(1) + played.charAt(0);\n\t\tif (!seen[asCard]) { seen[asCard] = true; allCards.push(asCard); }\n\t}\n\treturn formatCards(allCards);\n}\n\n// True iff a hand string has exactly 13 cards across 4 dot-separated suits.\nisValidHand = function (handStr) {\n\tif (!handStr) return false;\n\tvar parts = handStr.split(\".\");\n\tif (parts.length != 4) return false;\n\treturn (parts[0].length + parts[1].length + parts[2].length + parts[3].length) == 13;\n}\n\n// Read all 4 hands from the screen, reconstructing originals when only remaining cards are visible.\n// Returns { N, E, S, W } - each value is a hand string in PBN-suit format (e.g. \"AKx.xxxx.xx.xxx\")\n// or \"\" if the seat isn't visible / produced an invalid count. Server tolerates \"\" and fills via\n// 52-card-elimination from the seats it does receive.\n//\n// Seeds with reliable deal[\"hand\"]/deal[\"dummy\"] data first, since at claim time the announcement\n// panel may obscure cards or BBO may be in a transitional render state where getCardsByDirection\n// returns nothing. Screen reads override the seed if they produce a valid 13-card hand.\ngetAllHands = function () {\n\tvar hands = { N: \"\", E: \"\", S: \"\", W: \"\" };\n\tvar declarerDir = getDeclarerDirection();\n\tvar ctx = (deal && deal[\"ctx\"]) || getContext() || \"\";\n\tvar played = (deal && deal[\"played\"]) || [];\n\n\t// Seed with deal data: our seat's hand and the dummy's hand are known reliably from earlier\n\t// in the deal, so use them as defaults regardless of whether the screen reads succeed.\n\tif (deal && deal[\"seat\"] && deal[\"hand\"] && isValidHand(deal[\"hand\"])) {\n\t\thands[deal[\"seat\"]] = deal[\"hand\"];\n\t}\n\tif (deal && deal[\"dummy\"] && declarerDir && isValidHand(deal[\"dummy\"])) {\n\t\tvar dummySeat = \"NESWNESW\".charAt(\"NESW\".indexOf(declarerDir) + 2);\n\t\thands[dummySeat] = deal[\"dummy\"];\n\t}\n\n\t// Then try screen reads - a successful 13-card read overrides the seed (more authoritative)\n\t// and may also fill in opponents we couldn't seed.\n\tvar dirs = [\"N\", \"E\", \"S\", \"W\"];\n\tfor (var i = 0; i < dirs.length; i++) {\n\t\tvar dir = dirs[i];\n\t\tvar cards = getCardsByDirection(dir);\n\t\tif (!cards || cards.length == 0) continue;\n\t\t// Defensive: if zIndex filter picked up too many cards (e.g. animation pushed everything\n\t\t// to z-index \"100\" which startsWith(\"1\") matches for S), skip - sending garbage hurts more.\n\t\tif (cards.length > 13) {\n\t\t\tconsole.warn(getNow(true) + \" getAllHands: \" + dir + \" has \" + cards.length + \" visible cards (>13), skipping\");\n\t\t\tcontinue;\n\t\t}\n\t\tvar formatted;\n\t\tif (cards.join(\"\").length == 26) {\n\t\t\t// 13 cards visible -> hand is original\n\t\t\tformatted = formatCards(cards);\n\t\t} else if (declarerDir && played.length > 0) {\n\t\t\tformatted = reconstructHand(dir, cards, played, declarerDir, ctx);\n\t\t} else {\n\t\t\tformatted = formatCards(cards);\n\t\t}\n\t\tif (isValidHand(formatted)) {\n\t\t\thands[dir] = formatted;\n\t\t} else if (!hands[dir]) {\n\t\t\tconsole.warn(getNow(true) + \" getAllHands: \" + dir + \" produced invalid hand \\\"\" + formatted +\n\t\t\t\t\"\\\" (visible=\" + cards.length + \", played=\" + played.length + \"), keeping empty\");\n\t\t}\n\t}\n\treturn hands;\n}\n\nreconstructDummy = function(currentDummyCards, playedCards, declarerDir, ctx) {\n\t// Reconstruct original dummy hand by adding back cards played from dummy's position\n\tif (!playedCards || playedCards.length == 0) return formatCards(currentDummyCards);\n\n\tvar trumpSuit = getTrumpSuit(ctx);\n\tvar dummyDir = \"NESWNESW\".charAt(\"NESW\".indexOf(declarerDir) + 2);\n\t// Opening leader is to the left of declarer (clockwise)\n\tvar leaderDir = \"NESWNESW\".charAt(\"NESW\".indexOf(declarerDir) + 1);\n\n\tvar ranks = \"23456789TJQKA\";\n\tvar dummyPlayedCards = [];\n\tvar currentLeader = leaderDir;\n\n\t// Process complete tricks\n\tvar fullTricks = Math.floor(playedCards.length / 4);\n\tfor (var t = 0; t < fullTricks; t++) {\n\t\tvar trickStart = t * 4;\n\t\t// Determine play order for this trick: leader, then clockwise\n\t\tvar playOrder = [];\n\t\tvar dir = currentLeader;\n\t\tfor (var j = 0; j < 4; j++) {\n\t\t\tplayOrder.push(dir);\n\t\t\tdir = \"NESWNESW\".charAt(\"NESW\".indexOf(dir) + 1);\n\t\t}\n\n\t\t// Find dummy's card in this trick\n\t\tfor (var j = 0; j < 4; j++) {\n\t\t\tif (playOrder[j] == dummyDir) {\n\t\t\t\tdummyPlayedCards.push(playedCards[trickStart + j]);\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\n\t\t// Determine trick winner to know who leads next\n\t\tvar leadSuit = playedCards[trickStart].charAt(0);\n\t\tvar winnerIdx = 0;\n\t\tvar winnerRank = ranks.indexOf(playedCards[trickStart].charAt(1));\n\t\tvar winnerIsTrump = (leadSuit == trumpSuit);\n\n\t\tfor (var j = 1; j < 4; j++) {\n\t\t\tvar cardSuit = playedCards[trickStart + j].charAt(0);\n\t\t\tvar cardRank = ranks.indexOf(playedCards[trickStart + j].charAt(1));\n\n\t\t\tif (trumpSuit != \"\" && cardSuit == trumpSuit && !winnerIsTrump) {\n\t\t\t\twinnerIdx = j;\n\t\t\t\twinnerRank = cardRank;\n\t\t\t\twinnerIsTrump = true;\n\t\t\t} else if (trumpSuit != \"\" && cardSuit == trumpSuit && winnerIsTrump && cardRank > winnerRank) {\n\t\t\t\twinnerIdx = j;\n\t\t\t\twinnerRank = cardRank;\n\t\t\t} else if (cardSuit == leadSuit && !winnerIsTrump && cardRank > winnerRank) {\n\t\t\t\twinnerIdx = j;\n\t\t\t\twinnerRank = cardRank;\n\t\t\t}\n\t\t}\n\t\tcurrentLeader = playOrder[winnerIdx];\n\t}\n\n\t// Handle incomplete trick (cards played but trick not finished)\n\tvar remainingCards = playedCards.length % 4;\n\tif (remainingCards > 0) {\n\t\tvar trickStart = fullTricks * 4;\n\t\tvar dir = currentLeader;\n\t\tfor (var j = 0; j < remainingCards; j++) {\n\t\t\tif (dir == dummyDir) {\n\t\t\t\tdummyPlayedCards.push(playedCards[trickStart + j]);\n\t\t\t}\n\t\t\tdir = \"NESWNESW\".charAt(\"NESW\".indexOf(dir) + 1);\n\t\t}\n\t}\n\n\t// Combine current visible dummy cards with dummy's played cards\n\t// currentDummyCards: array of \"rank+suit\" like [\"KD\", \"4S\"]\n\t// dummyPlayedCards: array of \"suit+rank\" like [\"DK\", \"S4\"]\n\tvar allDummyCards = currentDummyCards.slice();\n\tfor (var i = 0; i < dummyPlayedCards.length; i++) {\n\t\tvar played = dummyPlayedCards[i];\n\t\tvar asCard = played.charAt(1) + played.charAt(0); // \"DK\" -> \"KD\"\n\t\tallDummyCards.push(asCard);\n\t}\n\n\tconsole.log(getNow(true) + \" reconstructDummy: visible=\" + currentDummyCards.length +\n\t\t\" dummyPlayed=\" + JSON.stringify(dummyPlayedCards) + \" total=\" + allDummyCards.length);\n\treturn formatCards(allDummyCards);\n}\n\ntriggerMouseEvent = function (node, eventType) {\n\tlet clickEvent = document.createEvent('MouseEvents');\n\tclickEvent.initEvent(eventType, true, true);\n\tnode.dispatchEvent(clickEvent);\n}\n\nmakePlay = function(cv) {\n    var card = getCardByValue(cv);\n    if (card != null) {\n\t\ttriggerMouseEvent(card, 'mouseover');\n\t\ttriggerMouseEvent(card, 'mousedown');\n\t\ttriggerMouseEvent(card, 'mouseup');\n\t\t//card.click();\n\t}\n}\n\n// Poll test() every interval ms until it returns something truthy or timeout ms have passed.\n// Calls back with the truthy value, or with null on timeout.\nwaitFor = function (test, timeout, interval, callback) {\n    var waited = 0;\n    (function poll() {\n        var result = null;\n        try { result = test(); } catch (e) { }\n        if (result) return callback(result);\n        if (waited >= timeout) return callback(null);\n        waited += interval;\n        setTimeout(poll, interval);\n    })();\n}\n\ngetClaimRejectedNotification = function () {\n    var n = $(\".notificationClass div:visible:contains('Claim rejected')\", PWD);\n    return n.length > 0 ? n : null;\n}\n\n// Claim 'tricks' tricks. The callback gets true only when the claim really went through.\n// Every other outcome - rejected, dialog never opened, opponents never answered - calls back\n// with false, because the caller then has to play a card: after a claim that goes nowhere no\n// card is played, so BBO fires no onNewPlayedCard and nothing else restarts the play flow.\nmakeClaim = function (tricks, card, callback) {\n    var tricksText = parseInt(tricks);\n    var settled = false;\n    var finish = function (accepted, reason) {\n        if (settled) return;\n        settled = true;\n        console.log(getNow(true) + \" Claim \" + (accepted ? \"accepted\" : \"not accepted\") + \" - \" + reason);\n        callback(accepted);\n    };\n    var cancelDialog = function () {\n        $(\"claim-dialog button:contains('Cancel')\", PWD).first().click();\n    };\n\n    // Step 1: Click the initial Claim button\n    $(\".claimButtonClass:contains('Claim')\", PWD).click();\n\n    // Step 2: wait for the dialog to render, then click the button for the number of tricks\n    waitFor(function () {\n        var b = $(\"claim-dialog button\", PWD).filter(function () {\n            return $(this).text().trim() === tricksText.toString();\n        });\n        return b.length > 0 ? b.first() : null;\n    }, 3000, 100, function (trickButton) {\n        if (!trickButton) {\n            cancelDialog();\n            return finish(false, \"claim dialog did not offer \" + tricksText + \" tricks\");\n        }\n        trickButton.click();\n\n        // Step 3: wait for the final 'Claim' confirmation button, then click it\n        waitFor(function () {\n            var b = $(\"claim-dialog button\", PWD).filter(function () {\n                var t = $(this).text().trim();\n                return t.toLowerCase() === \"claim\" ||\n                    (t.indexOf(\"Claim\") > -1 && t.toLowerCase().indexOf(\"cancel\") === -1);\n            });\n            return b.length > 0 ? b.first() : null;\n        }, 2000, 100, function (confirmButton) {\n            if (!confirmButton) {\n                cancelDialog();\n                return finish(false, \"confirmation button never appeared\");\n            }\n            confirmButton.click();\n\n            // Step 4: opponents can take several seconds to answer, so poll for the outcome\n            // instead of deciding after a fixed delay. Only an emptied hand counts as accepted -\n            // a timeout while we still hold cards is treated as \"not accepted\" so we play on.\n            waitFor(function () {\n                var rejected = getClaimRejectedNotification();\n                if (rejected) return { rejected: rejected };\n                if (getMyCards().length == 0) return { accepted: true };\n                return null;\n            }, 10000, 200, function (outcome) {\n                if (outcome && outcome.rejected) {\n                    outcome.rejected.parent().hide();\n                    return finish(false, \"claim rejected\");\n                }\n                if (outcome && outcome.accepted) return finish(true, \"claimed \" + tricks + \" tricks\");\n                finish(false, \"no answer to the claim\");\n            });\n        });\n    });\n};\n\n// Check if this should be changed to SelectBid\nmakeBid = function (bid, artificial, explain) {\n\tlet elBiddingBox = parent.document.querySelector('.biddingBoxClass');\n\tif (elBiddingBox != null) {\n\t\tlet elBiddingButtons = elBiddingBox.querySelectorAll('.biddingBoxButtonClass');\n\t\tlet alertField = elBiddingBox.querySelector('.mat-form-field-infix').querySelector('input');\n\t\talertField.value = unescape(explain);\n\t\tlet eventInput = new Event('input');\n\t\talertField.dispatchEvent(eventInput);\n\t\tif (elBiddingButtons != null) {\n\t\t\tif (elBiddingBox.style.display != 'none') {\n\t\t\t\tif (artificial == 1) elBiddingButtons[15].click();\n\t\t\t\tif (bid == 'PASS') triggerMouseEvent(elBiddingButtons[12], 'mousedown');\n\t\t\t\tif (bid == 'PASS') elBiddingButtons[12].click();\n\t\t\t\tif (bid == 'P') triggerMouseEvent(elBiddingButtons[12], 'mousedown');\n\t\t\t\tif (bid == 'P') elBiddingButtons[12].click();\n\t\t\t\tif (bid == 'X') triggerMouseEvent(elBiddingButtons[13], 'mousedown');\n\t\t\t\tif (bid == 'X') elBiddingButtons[13].click();\n\t\t\t\tif (bid == 'XX') triggerMouseEvent(elBiddingButtons[14], 'mousedown');\n\t\t\t\tif (bid == 'XX') elBiddingButtons[14].click();\n\t\t\t\tif (bid[0] == '1') elBiddingButtons[0].click();\n\t\t\t\tif (bid[0] == '2') elBiddingButtons[1].click();\n\t\t\t\tif (bid[0] == '3') elBiddingButtons[2].click();\n\t\t\t\tif (bid[0] == '4') elBiddingButtons[3].click();\n\t\t\t\tif (bid[0] == '5') elBiddingButtons[4].click();\n\t\t\t\tif (bid[0] == '6') elBiddingButtons[5].click();\n\t\t\t\tif (bid[0] == '7') elBiddingButtons[6].click();\n\t\t\t\tif (bid[1] == 'C') triggerMouseEvent(elBiddingButtons[7], 'mousedown');\n\t\t\t\tif (bid[1] == 'C') elBiddingButtons[7].click();\n\t\t\t\tif (bid[1] == 'D') triggerMouseEvent(elBiddingButtons[8], 'mousedown');\n\t\t\t\tif (bid[1] == 'D') elBiddingButtons[8].click();\n\t\t\t\tif (bid[1] == 'H') triggerMouseEvent(elBiddingButtons[9], 'mousedown');\n\t\t\t\tif (bid[1] == 'H') elBiddingButtons[9].click();\n\t\t\t\tif (bid[1] == 'S') triggerMouseEvent(elBiddingButtons[10], 'mousedown');\n\t\t\t\tif (bid[1] == 'S') elBiddingButtons[10].click();\n\t\t\t\tif (bid[1] == 'N') triggerMouseEvent(elBiddingButtons[11], 'mousedown');\n\t\t\t\tif (bid[1] == 'N') elBiddingButtons[11].click();\n\t\t\t}\n\t\t}\n\t};\n}\n\naddSpinner = function () {\n\t// Create the spinner element\n\tconst spinner = parent.document.createElement('div');\n\tspinner.classList.add('spinner');\n\tspinner.style.width = '50px';\n\tspinner.style.height = '50px';\n\tspinner.style.border = '5px solid #f3f3f3';\n\tspinner.style.borderRadius = '50%';\n\tspinner.style.borderTop = '5px solid #3498db';\n\tspinner.style.animation = 'loader 1s linear infinite';\n\n\t// Create the overlay element\n\tconst overlay = parent.document.createElement('div');\n\toverlay.classList.add('overlay');\n\toverlay.style.position = 'fixed';\n\toverlay.style.top = '58%'; // Adjust top position to center vertically\n\toverlay.style.left = '40%'; // Adjust left position to center horizontally\n\toverlay.style.transform = 'translate(-50%, -50%)'; // Center the overlay\n\toverlay.style.width = '160px'; // Adjust the width of the overlay\n\toverlay.style.height = '160px'; // Adjust the height of the overlay\n\toverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Adjust the transparency\n\toverlay.style.zIndex = '9999';\n\toverlay.style.display = 'flex';\n\toverlay.style.justifyContent = 'center';\n\toverlay.style.alignItems = 'center';\n\t// Append the spinner to the overlay\n\toverlay.appendChild(spinner);\n\n\t// Append the overlay to the document body\n\tparent.document.body.appendChild(overlay);\n\t//console.log(\"adding spinner\")\n\treturn overlay\n}\n\nremoveSpinner = function (overlay) {\n\tif (overlay) {\n\t\tparent.document.body.removeChild(overlay);\n\t\t//console.log(\"removing spinner\")\n\t\toverlay = null;\n\t}\n\treturn overlay;\n}\n\nBrillsTurnToBid = function (overlay) {\n\tif (newdeal) {\n\t\tif (typeof initdeal === \"function\") initdeal();\n\t}\n\ttry {\n\t\t// State may have advanced while this call was deferred - bail if it's no longer our turn\n\t\tif (!isMyTurnToBid()) {\n\t\t\tconsole.log(getNow(true) + \" BrillsTurnToBid aborted - no longer my turn to bid\");\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tbiddingInProgress = false;\n\t\t\treturn;\n\t\t}\n\t\t// alert(getMyCards())\n\t\t// Due to timing we don't have the hand, so we try to get it again\n\t\tif (!deal[\"hand\"]  || deal[\"hand\"].length < 13) {\n\t\t\tconsole.log(getNow(true) + \" Updated hand due to timing\" + deal[\"hand\"] + \" \" + myCardsDisplayed)\n\t\t\tif (getMyCards().length > 26) {\n\t\t\t\tconsole.warn(getNow(true) + \" Hand is too big, something is wrong: \" + getMyCards())\n\t\t\t}\n\t\t\tdeal[\"hand\"] = formatCards(getMyCards())\n\t\t}\n\n\t\tvar ctx = getContext()\n\t\tdeal[\"ctx\"] = ctx\n\t\tvar user = deal[\"user\"]\n\t\tvar dealer = deal[\"dealer\"]\n\t\tvar seat = deal[\"seat\"]\n\t\tvar vul = deal[\"vul\"]\n\t\tvar hand = deal[\"hand\"]\n\t\tvar dealnumber = getDealNumber()\n\t\t// Same board/session tagging as /lead and /play: board = the PLAIN board number,\n\t\t// pbn_label = the groupable \"<session>_b<N>\" (names the bid log), event = the match\n\t\t// name. The server stamps board + event onto the game it bids, so a missing auction\n\t\t// context recorded here says which board of which tournament produced it.\n\t\tvar url = getBrillBaseUrl() + \"/bid?user=\" + user + \"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat + \"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\"&event=\" + encodeURIComponent(getEventName())\n\t\tvar bidTournamentType = getTournamentType()\n\t\tif (bidTournamentType != \"\") {\n\t\t\turl += \"&tournament=\" + bidTournamentType\n\t\t}\n\t\tconsole.log(getNow(true) + \" BrillsTurnToBid Requesting \" + url)\n\t\ttry {\n\t\t\tfetch(url, {\n\t\t\t\tcache: \"no-store\"\n\t\t\t})\n\t\t\t\t.then(function (response) {\n\t\t\t\t\tconsole.log(getNow(true) + \" BrillsTurnToBid Response from \" + url)\n\t\t\t\t\t// Check if the response is successful\n\t\t\t\t\tif (!response.ok) {\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\t// Log the response status and status text\n\t\t\t\t\t\tconsole.error(getNow(true) + 'Response not OK:', response.status, response.statusText);\n\n\t\t\t\t\t\t// Parse the response body as JSON and handle the error\n\t\t\t\t\t\treturn response.json().then(function (errorResponse) {\n\t\t\t\t\t\t\t// Extract the error message from the JSON response\n\t\t\t\t\t\t\tconst errorMessage = errorResponse.error || 'Unknown error occurred';\n\n\t\t\t\t\t\t\t// Show the error message to the user\n\t\t\t\t\t\t\talert(errorMessage);\n\t\t\t\t\t\t\tthrow new Error(errorMessage); // Throw an error to skip to the catch block\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\n\t\t\t\t\t// If response is OK, parse the response as JSON\n\t\t\t\t\treturn response.json();\n\t\t\t\t})\n\t\t\t\t.then(function (data) {\n\t\t\t\t\t// Proceed with the logic if the response was successful\n\t\t\t\t\tif (data.message) {\n\t\t\t\t\t\tconsole.log(getNow(true) + \" Brill return message:\",data.message)\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\tbiddingInProgress = false;\n\t\t\t\t\t} else {\n\t\t\t\t\t\tconsole.log(getNow(true) + \" BrillsTurnToBid Brill would like to bid:\",data.bid)\n\t\t\t\t\t\t// Re-check turn AT CLICK TIME (inside setTimeout) - state may advance between now and when the macrotask runs\n\t\t\t\t\t\tsetTimeout(() => {\n\t\t\t\t\t\t\tif (isMyTurnToBid()) {\n\t\t\t\t\t\t\t\tmakeBid(data.bid, 0, \"\");\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Skipping bid click - no longer my turn to bid\")\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}, 0);\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\tbiddingInProgress = false;\n\t\t\t\t\t}\n\t\t\t\t})\n\t\t\t\t.catch(function (error) {\n\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\tbiddingInProgress = false;\n\t\t\t\t\t// Catch any errors that occurred during the fetch or processing\n\t\t\t\t\tconsole.error('Error occurred:', error.message);\n\t\t\t\t});\n\t\t} catch (error) {\n\t\t\t// Handle any errors that occur during the fetch request\n\t\t\talert('Error fetching data: ' + error.message);\n\t\t\t// Show an error message to the user or perform other error handling actions\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tbiddingInProgress = false;\n\t\t}\n\t\t// Before bid update and save deal - BBO seems to forget the bid if we leave after the bid / play\n\t\tsavedeal(dealnumber, deal)\n\t} catch (error) {\n\t\toverlay = removeSpinner(overlay);\n\t\tbiddingInProgress = false;\n\t}\n}\n\nBrillsTurnToPlay = function (overlay) {\n\tconsole.log(getNow(true) + \" BrillsTurnToPlay called\");\n\tif (newdeal) {\n\t\tif (typeof initdeal === \"function\") initdeal();\n\t}\n\ttry {\n\t\t// State may have advanced while this call was deferred - bail if it's no longer our turn\n\t\tif (!isMyTurnToPlay()) {\n\t\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay aborted - no longer my turn to play\");\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tplayInProgress = false;\n\t\t\treturn;\n\t\t}\n\t\t// if (myCardsDisplayed.length == 26) {\n\t\t// \tconsole.log(getNow(true) + \" Updated hand with myCardsDisplayed \" + myCardsDisplayed + \" \" + deal[\"hand\"])\n\t\t// \tdeal[\"hand\"] = formatCardsDisplayed(myCardsDisplayed)\n\t\t// }\n\n\t\t// Due to timing we don't have the hand, so we try to get it again\n\t\tif (!deal[\"hand\"]  ||  deal[\"hand\"].length < 13) {\n\t\t\tconsole.log(getNow(true) + \" Updated hand due to timing\" + deal[\"hand\"] + \" \" + myCardsDisplayed)\n\t\t\tif (getMyCards().length > 26) {\n\t\t\t\tconsole.warn(getNow(true) + \" Too many cards in hand, something is wrong: \" + getMyCards())\n\t\t\t}\n\t\t\tdeal[\"hand\"] = formatCards(getMyCards())\n\t\t}\n\t\t\n\t\t// If we see 13 cards in dummy, we update the deal\n\t\tdc = getDummyCards()\n\t\tif (dc.join(\"\").length == 26) {\n\t\t\tdeal[\"dummy\"] = formatCards(dc)\n\t\t\t// We update both hand as BBO might rotate the deal\n\t\t\tif (deal[\"dummy\"] == deal[\"hand\"]) {\n\t\t\t\tconsole.log(getNow(true) + \" same hand for dummy and hand\")\n\t\t\t\tdeal[\"hand\"] = formatCards(getDeclarerCards())\n\t\t\t\tdeal[\"seat\"] = getDeclarerDirection()\n\t\t\t\tconsole.log(getNow(true) + \" \" + JSON.stringify(deal))\n\t\t\t}\n\t\t}\n\t\t\n\t\tdeal[\"played\"] = updatePlayedCards(deal[\"played\"])\n\t\tdeal[\"played\"] = dedupePlayedCards(deal[\"played\"])\n\n\t\t// Bail out if I have no cards left to play - the deal is effectively over\n\t\t// (this happens when an opponent claim transitions BBO state mid-call)\n\t\tif (getMyCards().length == 0 && deal[\"played\"].length > 0) {\n\t\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay aborted - no cards in my hand, deal must be ending\");\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tplayInProgress = false;\n\t\t\treturn;\n\t\t}\n\n\t\thand = deal[\"hand\"]\n\t\tvar ctx = getContext()\n\t\tdeal[\"ctx\"] = ctx\n\t\tvar user = deal[\"user\"]\n\t\tvar dealer = deal[\"dealer\"]\n\t\tvar seat = deal[\"seat\"]\n\t\tvar vul = deal[\"vul\"]\n\t\tvar dealnumber = getDealNumber()\n\t\tif (deal[\"played\"].length == 52) {\n\t\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay called, but Board is finished\");\n\t\t\tsendFinalPlay();\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tplayInProgress = false;\n\t\t\treturn\n\t\t}\n\t\tif (deal[\"played\"].length == 0) {\n\t\t\t// board = the PLAIN board number ([Board] tag / log context); pbn_label carries the\n\t\t\t// groupable \"<session>_b<N>\" name and event the challenge name (see getBoardLabel).\n\t\t\tvar url = getBrillBaseUrl() + \"/lead?user=\" + user + \"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat + \"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\t\"&event=\" + encodeURIComponent(getEventName());\n\n\t\t} else {\n\t\t\tvar dummyhand = deal[\"dummy\"]\n\t\t\tif (dummyhand == \"\" || !dummyhand || dummyhand == \"...\") {\n\t\t\t\tconsole.log(getNow(true) + \" No dummy stored - getting dummy cards from screen\")\n\t\t\t\tdc = getDummyCards()\n\t\t\t\tif (dc.join(\"\").length == 26) {\n\t\t\t\t\tdeal[\"dummy\"] = formatCards(dc)\n\t\t\t\t} else {\n\t\t\t\t\t// Dummy cards incomplete on screen - reconstruct by adding back played cards\n\t\t\t\t\tconsole.log(getNow(true) + \" Dummy incomplete on screen (\" + dc.length + \" cards), reconstructing from played cards\")\n\t\t\t\t\tdeal[\"dummy\"] = reconstructDummy(dc, deal[\"played\"], getDeclarerDirection(), ctx)\n\t\t\t\t}\n\t\t\t\tdummyhand = deal[\"dummy\"]\n\t\t\t\tsavedeal(dealnumber, deal)\n\t\t\t}\n\t\t\t// Verify dummy has 13 cards before sending to API\n\t\t\tvar dummyCardCount = dummyhand.replace(/\\./g, \"\").length;\n\t\t\tif (dummyCardCount != 13) {\n\t\t\t\tconsole.error(getNow(true) + \" Dummy has \" + dummyCardCount + \" cards instead of 13: \" + dummyhand);\n\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\tplayInProgress = false;\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tvar playedCardsXX = formatCardsPlayed(deal[\"played\"])\n\t\t\tvar url = getBrillBaseUrl() + \"/play?user=\" + user + \"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat + \"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\t\"&dummy=\" + dummyhand + \"&played=\" + playedCardsXX +\n\t\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\t\"&event=\" + encodeURIComponent(getEventName()) +\n\t\t\t\t\"&south=\" + encodeURIComponent(getSeatDisplayName(\"S\")) +\n\t\t\t\t\"&north=\" + encodeURIComponent(getSeatDisplayName(\"N\")) +\n\t\t\t\t\"&east=\" + encodeURIComponent(getSeatDisplayName(\"E\")) +\n\t\t\t\t\"&west=\" + encodeURIComponent(getSeatDisplayName(\"W\"));\n\t\t}\n\t\tvar tournamentType = getTournamentType()\n\t\tif (tournamentType != \"\") {\n\t\t\turl += \"&tournament=\" + tournamentType\n\t\t}\n\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay Requesting \" + url)\n\t\ttry {\n\t\t\tfetch(url, {\n\t\t\t\tcache: \"no-store\"\n\t\t\t})\n\t\t\t\t.then(function (response) {\n\t\t\t\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay Response from \" + url)\n\t\t\t\t\t// Check if the response is successful\n\t\t\t\t\tif (!response.ok) {\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t\t// Log the response status and status text\n\t\t\t\t\t\tconsole.error(getNow(true) + ' Response not OK:', response.status, response.statusText);\n\t\t\n\t\t\t\t\t\t// Parse the response body as JSON and handle the error\n\t\t\t\t\t\treturn response.json().then(function (errorResponse) {\n\t\t\t\t\t\t\t// Extract the error message from the JSON response\n\t\t\t\t\t\t\tconst errorMessage = errorResponse.error || 'Unknown error occurred';\n\t\t\n\t\t\t\t\t\t\t// Show the error message to the user\n\t\t\t\t\t\t\tconsole.error(getNow(true) + ' Error:', errorMessage);\n\t\t\t\t\t\t\tthrow new Error(errorMessage); // Throw an error to skip to the catch block\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\n\t\t\t\t\t// If response is OK, parse the response as JSON\n\t\t\t\t\treturn response.json();\n\t\t\t\t})\n\t\t\t\t.then(function (data) {\n\t\t\t\t\t// Proceed with the logic if the response was successful\n\t\t\t\t\tif (data.message) {\n\t\t\t\t\t\tconsole.log(getNow(true) + \" Brill return message:\",data.message)\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t} else {\n\t\t\t\t\t\t// Re-check turn before clicking - state may have advanced during the fetch\n\t\t\t\t\t\tvar stillMyTurn = isMyTurnToPlay();\n\t\t\t\t\t\t// Only claim as declarer or dummy. As defender we can only conceed\n\t\t\t\t\t\tif (data.claim && (data.player == 1 || data.player == 3)) {\n\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Claiming \" + data.claim + \" tricks\")\n\t\t\t\t\t\t\tmakeClaim(data.claim, data.card, function (accepted) {\n\t\t\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t\t\t\tif (accepted) return;\n\t\t\t\t\t\t\t\t// The claim did not go through, so we have to play after all.\n\t\t\t\t\t\t\t\t// Nothing else will restart us: no card was played, so there is no\n\t\t\t\t\t\t\t\t// onNewPlayedCard, and the dedup key is unchanged - clear it as well.\n\t\t\t\t\t\t\t\tlastPlayKey = null;\n\t\t\t\t\t\t\t\t// Re-check the turn here, not before the claim - the dialog took seconds\n\t\t\t\t\t\t\t\tif (!isMyTurnToPlay()) {\n\t\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Claim not accepted, but no longer my turn to play\")\n\t\t\t\t\t\t\t\t\treturn;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Claim not accepted - playing \" + data.card + \" instead\")\n\t\t\t\t\t\t\t\tvar playedBefore = getPlayedCards();\n\t\t\t\t\t\t\t\tsetTimeout(() => makePlay(data.card[1].replace(\"T\", \"10\") + data.card[0]), 0);\n\t\t\t\t\t\t\t\t// If that click did not register we would be stuck, so re-drive the flow.\n\t\t\t\t\t\t\t\t// Only when nothing was played since - otherwise the normal flow took over.\n\t\t\t\t\t\t\t\tsetTimeout(function () {\n\t\t\t\t\t\t\t\t\tif (!playInProgress && isMyTurnToPlay() && getPlayedCards() == playedBefore) {\n\t\t\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Card not played after rejected claim - retrying\")\n\t\t\t\t\t\t\t\t\t\tplayInProgress = true;\n\t\t\t\t\t\t\t\t\t\tBrillsTurnToPlay(addSpinner());\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}, 3000);\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tconsole.log(getNow(true) + \" BrillsTurnToBid Brill would like to play:\",data.card)\n\t\t\t\t\t\t\tif (stillMyTurn) {\n\t\t\t\t\t\t\t\tsetTimeout(() => makePlay(data.card[1].replace(\"T\", \"10\") + data.card[0]),0);\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Skipping play click - no longer my turn to play\")\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t})\n\t\t\t\t.catch(function (error) {\n\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t// Catch any errors that occurred during the fetch or processing\n\t\t\t\t\tconsole.error(getNow(true) + ' Error occurred:', error.message);\n\t\t\t\t});\n\t\t\n\t\t} catch (error) {\n\t\t\t// Handle any errors that occur during the fetch request\n\t\t\tconsole.error(getNow(true) + ' Error fetching data:', errorMessage);\n\t\t\t// Show an error message to the user or perform other error handling actions\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tplayInProgress = false;\n\t\t}\n\n\t\t// Before play update and save deal - BBO seems to forget the bid if we leave after the bid / play\n\t\tsavedeal(dealnumber, deal)\n\t} catch (error) {\n\t\toverlay = removeSpinner(overlay);\n\t\tplayInProgress = false;\n\t}\n}\n\nvalidateClaimWithServer = function (panel, tricksClaimed, claimerDir, resultKind, resultDelta) {\n\t// Called when an opponent claim dialog appears. Sends /claim to the server for validation,\n\t// then auto-clicks Accept (Yes) or Reject (No) based on the response.\n\t// On any error or missing data, leaves the dialog up for the user to decide manually.\n\tif (!tricksClaimed) {\n\t\tconsole.warn(getNow(true) + \" validateClaimWithServer: no tricks parsed, leaving dialog for manual decision\");\n\t\treturn;\n\t}\n\t// Defer briefly so BBO has time to reveal all 4 hands as part of the claim presentation.\n\t// At claim time BBO normally exposes the claimer's hand (and often dummy already, plus our own\n\t// seat) so the opposing side can verify the claim. The hand reads in getAllHands() depend on\n\t// those cards being rendered face-up; firing synchronously is too early.\n\tsetTimeout(function () {\n\t\tvalidateClaimWithServerInternal(panel, tricksClaimed, claimerDir, resultKind, resultDelta);\n\t}, 500);\n}\n\nvalidateClaimWithServerInternal = function (panel, tricksClaimed, claimerDir, resultKind, resultDelta) {\n\ttry {\n\t\t// Initialize deal struct from localStorage / fresh if not done yet\n\t\tif (newdeal || !deal[\"number\"]) {\n\t\t\tif (typeof initdeal === \"function\") initdeal();\n\t\t}\n\t\t// Populate any missing fields from the screen on demand - the claim may arrive before\n\t\t// our other handlers got a chance to fill them in.\n\t\tif (!deal[\"played\"]) deal[\"played\"] = [];\n\t\tdeal[\"played\"] = updatePlayedCards(deal[\"played\"]);\n\t\tdeal[\"played\"] = dedupePlayedCards(deal[\"played\"]);\n\t\tif (!deal[\"hand\"] || deal[\"hand\"].length < 13) {\n\t\t\tvar myCards = getMyCards();\n\t\t\tif (myCards.length > 0) deal[\"hand\"] = formatCards(myCards);\n\t\t}\n\t\tif (!deal[\"dummy\"]) {\n\t\t\tvar dc = getDummyCards();\n\t\t\tif (dc.length > 0) {\n\t\t\t\tdeal[\"dummy\"] = (dc.join(\"\").length == 26)\n\t\t\t\t\t? formatCards(dc)\n\t\t\t\t\t: reconstructDummy(dc, deal[\"played\"], getDeclarerDirection(), getContext());\n\t\t\t}\n\t\t}\n\t\tif (!deal[\"dealer\"]) deal[\"dealer\"] = getDealerDirection();\n\t\tif (!deal[\"vul\"]) deal[\"vul\"] = getAbsoluteVulnerability();\n\t\tif (!deal[\"seat\"]) deal[\"seat\"] = mySeat();\n\t\tif (!deal[\"user\"]) deal[\"user\"] = getActivePlayer();\n\t\tif (!deal[\"ctx\"]) deal[\"ctx\"] = getContext();\n\t\tif (!deal[\"number\"]) deal[\"number\"] = getDealNumber();\n\t\t// Final check - we still need at minimum hand and number to send\n\t\tif (!deal[\"hand\"] || !deal[\"number\"]) {\n\t\t\tconsole.warn(getNow(true) + \" validateClaimWithServer: still missing hand/number after fallback (hand=\" +\n\t\t\t\tdeal[\"hand\"] + \", number=\" + deal[\"number\"] + \"), leaving dialog for manual decision\");\n\t\t\treturn;\n\t\t}\n\t\tvar ctx = deal[\"ctx\"];\n\t\tvar user = deal[\"user\"];\n\t\tvar dealer = deal[\"dealer\"];\n\t\tvar seat = deal[\"seat\"];\n\t\tvar vul = deal[\"vul\"];\n\t\tvar hand = deal[\"hand\"];\n\t\tvar dummyhand = deal[\"dummy\"] || \"\";\n\t\tvar dealnumber = deal[\"number\"];\n\t\tvar playedCardsXX = formatCardsPlayed(deal[\"played\"] || []);\n\t\t// Read all 4 hands from screen - BBO reveals all hands when an opponent claims, so the\n\t\t// server can verify the claim against everyone's actual cards.\n\t\tvar allHands = getAllHands();\n\t\tconsole.log(getNow(true) + \" validateClaim allHands: N=\" + allHands.N + \" E=\" + allHands.E + \" S=\" + allHands.S + \" W=\" + allHands.W);\n\t\tvar url = getBrillBaseUrl() + \"/claim?south=\" + encodeURIComponent(getSeatDisplayName(\"S\")) +\n\t\t\t\"&north=\" + encodeURIComponent(getSeatDisplayName(\"N\")) +\n\t\t\t\"&east=\" + encodeURIComponent(getSeatDisplayName(\"E\")) +\n\t\t\t\"&west=\" + encodeURIComponent(getSeatDisplayName(\"W\")) +\n\t\t\t\"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat +\n\t\t\t\"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\"&dummy=\" + dummyhand + \"&played=\" + playedCardsXX +\n\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\"&event=\" + encodeURIComponent(getEventName()) +\n\t\t\t\"&tricks=\" + tricksClaimed +\n\t\t\t\"&n=\" + allHands.N + \"&e=\" + allHands.E + \"&s=\" + allHands.S + \"&w=\" + allHands.W;\n\t\tif (claimerDir) url += \"&claimer=\" + claimerDir;\n\t\tvar tournamentType = getTournamentType();\n\t\tif (tournamentType != \"\") url += \"&tournament=\" + tournamentType;\n\t\tconsole.log(getNow(true) + \" validateClaim Requesting \" + url);\n\t\tfetch(url, { cache: \"no-store\" })\n\t\t\t.then(function (response) {\n\t\t\t\tconsole.log(getNow(true) + \" validateClaim Response status: \" + response.status);\n\t\t\t\tif (!response.ok) {\n\t\t\t\t\tconsole.warn(getNow(true) + \" validateClaim non-OK response, leaving for manual decision\");\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t\treturn response.json();\n\t\t\t})\n\t\t\t.then(function (data) {\n\t\t\t\tif (!data) return;\n\t\t\t\tconsole.log(getNow(true) + \" validateClaim response data:\", JSON.stringify(data));\n\t\t\t\t// Note: do NOT set finalPlaySent here. /claim is for validation only.\n\t\t\t\t// /pbn/finalize fires later from onDealEnd when BBO has revealed all 4 hands,\n\t\t\t\t// so the server can construct a complete PBN.\n\t\t\t\t// Server fields: { saved: bool, claim: N, result: N, board: ... }\n\t\t\t\t// Accept-signal field names: saved | accept | ok | valid (true to accept).\n\t\t\t\tvar accept = (data.saved === true) || (data.accept === true) || (data.ok === true) || (data.valid === true);\n\t\t\t\tvar reject = (data.saved === false) || (data.accept === false) || (data.reject === true) || (data.valid === false);\n\t\t\t\tif (accept) {\n\t\t\t\t\tconsole.log(getNow(true) + \" validateClaim: server accepted (claim=\" + data.claim + \", result=\" + data.result + \"), clicking Yes\");\n\t\t\t\t\t$(\"button.accept-button:visible\", panel).click();\n\t\t\t\t} else if (reject) {\n\t\t\t\t\tconsole.log(getNow(true) + \" validateClaim: server rejected, clicking No\");\n\t\t\t\t\t$(\"button.reject-button:visible\", panel).click();\n\t\t\t\t} else {\n\t\t\t\t\tconsole.log(getNow(true) + \" validateClaim: server response unclear, leaving for manual decision\");\n\t\t\t\t}\n\t\t\t})\n\t\t\t.catch(function (error) {\n\t\t\t\tconsole.error(getNow(true) + \" validateClaim error:\", error.message);\n\t\t\t});\n\t} catch (e) {\n\t\tconsole.error(getNow(true) + \" validateClaim exception:\", e);\n\t}\n}\n\nsendFinalPlay = function () {\n\t// Record the completed deal via /pbn/finalize with all 4 hands.\n\t// Called from onDealEnd (after BBO reveals all hands) or onAuctionEnd (passed out).\n\t// /claim is a separate endpoint that fires at claim-dialog time for live validation only;\n\t// it does NOT save the PBN, because at that moment opponent hands aren't yet visible.\n\tif (finalPlaySent) {\n\t\tconsole.log(getNow(true) + \" sendFinalPlay skipped - already sent for this deal\");\n\t\treturn;\n\t}\n\t// Defer ~1.5s so BBO has time to settle the last trick animation and reveal all 4 hands.\n\t// Earlier 500ms was too aggressive - we were reading mid-animation and losing the last\n\t// trick's cards. The hand reads in getAllHands() depend on cards being rendered face-up.\n\tsetTimeout(function () { sendFinalPlayInternal(); }, 1500);\n}\n\nsendFinalPlayInternal = function () {\n\tif (finalPlaySent) return;\n\ttry {\n\t\t// Make sure we've captured all played cards still visible on screen, then dedupe defensively\n\t\tif (deal[\"played\"]) {\n\t\t\tdeal[\"played\"] = updatePlayedCards(deal[\"played\"]);\n\t\t\tdeal[\"played\"] = dedupePlayedCards(deal[\"played\"]);\n\t\t}\n\t\t// Pull missing fields from the screen so this works even before bidding/play populated them\n\t\tif (!deal[\"hand\"] || deal[\"hand\"].length < 13) {\n\t\t\tvar myCards = getMyCards();\n\t\t\tif (myCards.length > 0) deal[\"hand\"] = formatCards(myCards);\n\t\t}\n\t\tif (!deal[\"dealer\"]) deal[\"dealer\"] = getDealerDirection();\n\t\tif (!deal[\"vul\"]) deal[\"vul\"] = getAbsoluteVulnerability();\n\t\tif (!deal[\"seat\"]) deal[\"seat\"] = mySeat();\n\t\tif (!deal[\"user\"]) deal[\"user\"] = getActivePlayer();\n\t\tif (!deal[\"ctx\"]) deal[\"ctx\"] = getContext();\n\t\tif (!deal[\"number\"]) deal[\"number\"] = getDealNumber();\n\t\t// Need at least hand and number to send anything meaningful\n\t\tif (!deal[\"hand\"] || !deal[\"number\"]) {\n\t\t\tconsole.log(getNow(true) + \" sendFinalPlay skipped - missing hand or deal number\");\n\t\t\treturn;\n\t\t}\n\t\tfinalPlaySent = true;\n\t\tvar playedCount = deal[\"played\"] ? deal[\"played\"].length : 0;\n\t\tvar complete = (playedCount == 52);\n\t\tvar ctx = deal[\"ctx\"];\n\t\tvar passedOut = (ctx === \"--------\" || /^-+$/.test(ctx));\n\t\tvar user = deal[\"user\"];\n\t\tvar dealer = deal[\"dealer\"];\n\t\tvar seat = deal[\"seat\"];\n\t\tvar vul = deal[\"vul\"];\n\t\tvar hand = deal[\"hand\"];\n\t\tvar dummyhand = deal[\"dummy\"] || \"\";\n\t\tvar dealnumber = deal[\"number\"];\n\t\tvar playedCardsXX = formatCardsPlayed(deal[\"played\"] || []);\n\t\t// Read all 4 hands from screen - at deal end BBO reveals all opponents, so this is\n\t\t// where we get a complete deal for the PBN.\n\t\tvar allHands = getAllHands();\n\t\tconsole.log(getNow(true) + \" sendFinalPlay allHands: N=\" + allHands.N + \" E=\" + allHands.E + \" S=\" + allHands.S + \" W=\" + allHands.W);\n\t\t// Always use /pbn/finalize - the server's universal \"save PBN\" endpoint.\n\t\t// Deal type is signalled by &passedout / &claim / &final query params.\n\t\tvar url = getBrillBaseUrl() + \"/pbn/finalize?south=\" + encodeURIComponent(getSeatDisplayName(\"S\")) +\n\t\t\t\"&north=\" + encodeURIComponent(getSeatDisplayName(\"N\")) +\n\t\t\t\"&east=\" + encodeURIComponent(getSeatDisplayName(\"E\")) +\n\t\t\t\"&west=\" + encodeURIComponent(getSeatDisplayName(\"W\")) +\n\t\t\t\"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat +\n\t\t\t\"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\"&dummy=\" + dummyhand + \"&played=\" + playedCardsXX +\n\t\t\t// board = the PLAIN board number so the [Board] tag stays numeric (match pairing);\n\t\t\t// pbn_label names the file \"<session>_b<N>.pbn\" so the /pbn page groups every board\n\t\t\t// of this sitting under one heading, and event supplies that heading.\n\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\"&event=\" + encodeURIComponent(getEventName()) +\n\t\t\t\"&final=true\" +\n\t\t\t\"&n=\" + allHands.N + \"&e=\" + allHands.E + \"&s=\" + allHands.S + \"&w=\" + allHands.W;\n\t\tif (passedOut) {\n\t\t\turl += \"&passedout=true\";\n\t\t} else if (claimDetected) {\n\t\t\t// A real claim dialog was seen on this deal. Send the actual remaining-trick count.\n\t\t\tvar remainingTricks = Math.ceil((52 - playedCount) / 4);\n\t\t\turl += \"&claim=true&tricks=\" + remainingTricks;\n\t\t} else if (!complete) {\n\t\t\t// Less than 52 cards but no claim was observed - we just missed capturing some cards\n\t\t\t// during play (timing issue with screen reads). Don't tag as claim; let the server\n\t\t\t// reconstruct from the hands we are sending.\n\t\t\tvar missingCount = 52 - playedCount;\n\t\t\tif (missingCount <= 2) {\n\t\t\t\tconsole.log(getNow(true) + \" sendFinalPlay: \" + playedCount + \"/52 cards (missing \" +\n\t\t\t\t\tmissingCount + \") - acceptable shortfall, sending without claim flag\");\n\t\t\t} else {\n\t\t\t\tconsole.warn(getNow(true) + \" sendFinalPlay: only \" + playedCount + \"/52 cards captured (missing \" +\n\t\t\t\t\tmissingCount + \") but no claim was detected - significant shortfall, server may reject\");\n\t\t\t}\n\t\t}\n\t\tvar tournamentType = getTournamentType();\n\t\tif (tournamentType != \"\") url += \"&tournament=\" + tournamentType;\n\t\t// Count how many of the 4 hands are populated - server needs >= 3 to construct full PBN\n\t\tvar handsPopulated = (allHands.N ? 1 : 0) + (allHands.E ? 1 : 0) + (allHands.S ? 1 : 0) + (allHands.W ? 1 : 0);\n\t\tvar dealTypeLabel = passedOut ? \"passed out\" :\n\t\t\t(claimDetected ? playedCount + \"/52 cards, CLAIM\" :\n\t\t\t\tcomplete ? playedCount + \"/52 cards, complete\" : playedCount + \"/52 cards, INCOMPLETE-no-claim\");\n\t\tconsole.log(getNow(true) + \" sendFinalPlay -> /pbn/finalize (\" + dealTypeLabel +\n\t\t\t\", hands populated: \" + handsPopulated + \"/4) \" + url);\n\t\tif (handsPopulated < 3) {\n\t\t\tconsole.warn(getNow(true) + \" sendFinalPlay: only \" + handsPopulated + \"/4 hands populated - server may not be able to construct full PBN\");\n\t\t}\n\t\tfetch(url, { cache: \"no-store\" })\n\t\t\t.then(function (response) {\n\t\t\t\tconsole.log(getNow(true) + \" sendFinalPlay Response status: \" + response.status);\n\t\t\t})\n\t\t\t.catch(function (error) {\n\t\t\t\tconsole.error(getNow(true) + \" sendFinalPlay error:\", error.message);\n\t\t\t});\n\t} catch (e) {\n\t\tconsole.error(getNow(true) + \" sendFinalPlay exception:\", e);\n\t}\n}\n\nremovedeal = function () {\n\t// Loop through all keys in localStorage\n\t// Should perhaps include a table type\n\tfor (var key in localStorage) {\n\t\t// Check if the key starts with 'BidWithBrill' and ends with the value of dealnumber\n\t\tif (key.startsWith('BidWithBrill')) {\n\t\t\t// If the key matches, remove the item from localStorage\n\t\t\tlocalStorage.removeItem(key);\n\t\t}\n\t}\n}\n\nsavedeal = function (dealnumber, deal) {\n\tif (dealnumber) {\n\t\tif (deal[\"dummy\"] == deal[\"hand\"]) {\n\t\t\t// BBO rotated the deal - skip saving, we recover on the next update\n\t\t\tconsole.warn(getNow(true) + \" savedeal: hand and dummy are the same - BBO rotated the deal, not saving\")\n\t\t} else {\n\t\t\tlocalStorage.setItem('BidWithBrill' + dealnumber, JSON.stringify(deal))\n\t\t}\n\t}\n}\n\ngetTournamentType = function() {\n\tlet text = $(\"#navDiv score-panel, #navDiv .score-panel\", parent.window.document).text().toLowerCase();\n\tif (text.indexOf(\"imp\") > -1) return \"IMP\";\n\tif (text.indexOf(\"mp\") > -1) return \"MP\";\n\treturn \"\";\n}\n\ngetMatchName = function() {\n\tvar title = $(\"nav-bar h2.titleClass\", parent.window.document).first().text().trim();\n\tif (!title) return \"\";\n\tvar stopWords = [\"a\", \"an\", \"the\", \"of\", \"for\", \"against\", \"vs\", \"and\", \"with\", \"in\", \"on\", \"at\", \"to\", \"board\"];\n\tvar words = title.split(/\\s+/).filter(function (w) {\n\t\treturn w && stopWords.indexOf(w.toLowerCase()) === -1 && !/^\\d+$/.test(w);\n\t});\n\tif (words.length === 0) return \"\";\n\tvar compact;\n\tif (words.length <= 2) {\n\t\tcompact = words.join(\"-\");\n\t} else {\n\t\tvar initials = words.slice(0, -1).map(function (w) { return w.charAt(0).toUpperCase(); }).join(\"\");\n\t\tcompact = initials + \"-\" + words[words.length - 1];\n\t}\n\treturn compact.replace(/[^A-Za-z0-9\\-]/g, \"\");\n}\n\ngetDateStamp = function() {\n\tvar now = new Date();\n\treturn now.getFullYear() +\n\t\tString(now.getMonth() + 1).padStart(2, '0') +\n\t\tString(now.getDate()).padStart(2, '0');\n}\n\n// The session slug every board of this sitting shares - date, scoring type and match name,\n// with NO board number in it. Brill.Service's /pbn page groups saved boards by their filename\n// after stripping a trailing \"_b<N>\" (PbnChallengeKey), so boards only land in one group when\n// they share this prefix. (The old getBoardID() buried the board number in the MIDDLE, which\n// is why every board showed up as its own \"Brill.Service /play\" challenge - all endpoints now\n// send the plain board number plus this slug via pbn_label.)\ngetChallengeSlug = function() {\n\tvar slug = getDateStamp() + \"_\" + (getTournamentType() || \"X\");\n\tvar matchName = getMatchName();\n\tif (matchName) slug += \"_\" + matchName;\n\treturn slug;\n}\n\n// Filename label for one saved board: \"<session slug>_b<board>\" - the same shape BridgeChallenge\n// sends as pbn_label, so Brill.Service names and groups our boards exactly the same way.\ngetBoardLabel = function() {\n\treturn getChallengeSlug() + \"_b\" + String(getDealNumber());\n}\n\n// Readable [Event] tag for the saved PBN, i.e. the group heading on the Completed Boards page.\n// Without it the server falls back to the default \"Brill.Service /play\". Any \"board <n>\" in the\n// nav-bar title is stripped so every board of the session reports the same event.\ngetEventName = function() {\n\tvar title = $(\"nav-bar h2.titleClass\", parent.window.document).first().text().trim();\n\tif (title) {\n\t\tvar cleaned = title.replace(/\\bboard\\s*\\d+\\b/ig, \"\").replace(/\\s{2,}/g, \" \").trim();\n\t\tif (cleaned) return cleaned;\n\t}\n\tvar tournament = getTournamentType();\n\treturn \"BBO\" + (tournament ? \" \" + tournament : \"\") + \" \" + getDateStamp();\n}\n\ninitdeal = function() {\n\ttry {\n\t\tdealnumber = getDealNumber()\n\t\tdealString = localStorage.getItem('BidWithBrill' + dealnumber);\n\t\tif (dealString) {\n\t\t\tdeal = JSON.parse(dealString);\n\t\t\tconsole.log(getNow(true) + \" Found in storage: \" + dealString);\n\t\t\tif (!deal[\"played\"]) deal[\"played\"] = []\n\t\t\tif (!deal[\"ctx\"]) deal[\"ctx\"] = \"\"\n\t\t\tdeal[\"dealer\"] = getDealerDirection()\n\t\t\tdeal[\"vul\"] = getAbsoluteVulnerability()\n\t\t\tdeal[\"seat\"] = mySeat()\n\t\t\tdeal[\"user\"] = getActivePlayer()\n\t\t}\n\t\tif (!dealString || !deal[\"number\"]) {\n\t\t\tdeal = {}\n\t\t\tdeal[\"number\"] = dealnumber\n\t\t\tdeal[\"dealer\"] = getDealerDirection()\n\t\t\tdeal[\"vul\"] = getAbsoluteVulnerability()\n\t\t\tdeal[\"seat\"] = mySeat()\n\t\t\tdeal[\"user\"] = getActivePlayer()\n\t\t\tdeal[\"hand\"] = \"\"\n\t\t\tdeal[\"ctx\"] = \"\"\n\t\t\tdeal[\"dummy\"] = \"\"\n\t\t\tdeal[\"played\"] = []\n\t\n\t\t\tlocalStorage.setItem('BidWithBrill' + dealnumber, JSON.stringify(deal))\n\t\t}\n\t\tconsole.log(getNow(true) + \" onMyDeal\", JSON.stringify(deal))\n\t} catch (error) {\n\t\tconsole.log(getNow(true) + \" onMyDeal error\", error)\n\t}\n\tnewdeal = false\n\treturn deal;\n\t\n}\n\ngetAbsoluteVulnerability = function() {\n\t// Convert from relative (us/them) to absolute (NS/EW) vulnerability format\n\t// Brill API expects: None, NS, EW, All\n\tconst seat = mySeat();\n\tconst isNS = (seat === 'N' || seat === 'S');\n\tconst weAreVul = areWeVulnerable() === '@v';\n\tconst theyAreVul = areTheyVulnerable() === '@V';\n\n\t// Convert relative to absolute\n\tconst nsVul = isNS ? weAreVul : theyAreVul;\n\tconst ewVul = isNS ? theyAreVul : weAreVul;\n\n\tif (nsVul && ewVul) return 'All';\n\tif (nsVul) return 'NS';\n\tif (ewVul) return 'EW';\n\treturn 'None';\n}\n"
	];
	setScriptList();
	console.log("[brill] " + scriptList.length + " script blocks loaded");

	// ==========================================================================
	// vendored: src/iframe/BBOobserver.js (self-starts - must be last)
	// ==========================================================================
	// Options for the observer (which mutations to observe)
	const config = {
	    attributes: true,
	    attributeFilter: ['id', 'class', 'style'],
	    childList: true,
	    subtree: true
	};
	
	// Callback function to execute when mutations are observed
	const BBOobserverCallback = function (mutationsList, observer) {
	    observer.disconnect();
	    checkBiddingBox();
	    checkNavDiv();
	    checkTableDisplayed();
	    checkBiddingBoxDisplayed();
	    checkAuctionBoxDisplayed();
	    checkAnnouncementPanel();
	    checkNotificationPanel();
	    checkFinalContractPanel();
	    checkCurrentAuction();
	    checkActivePlayer();
	    checkExplainCallBox();
	    checkDealEndPanel();
	    checkOpponents();
	    checkDealNumber();
	    checkCallText();
	    checkOKbuttonVisible();
	    checkOKbuttonPressed();
	    checkChatMessage();
	    checkCardLead();
	    checkPlayedCards();
	    checkCallExplanationPanel();
	    checkMyCardsDisplayed();
	    checkProfileBoxDisplayed();
	    checkOpenProfileBBOalertURL();
	    onAnyMutation();
	    observer.observe(targetNode, config);
	};
	
	function checkBiddingBox() {
	    if ((getBiddingBox() != null) != biddingBoxExists) {
	        biddingBoxExists = !biddingBoxExists;
	        if (biddingBoxExists) onBiddingBoxCreated();
	        else onBiddingBoxRemoved();
	    }
	}
	
	function checkNavDiv() {
	    if (isVisible(getNavDiv()) != navDivDisplayed) {
	        navDivDisplayed = !navDivDisplayed;
	        if (navDivDisplayed) onNavDivDisplayed();
	        else onNavDivHidden();
	    }
	}
	
	function checkTableDisplayed() {
	    if ($("bridge-screen", window.parent.document).is(":visible") != tableDisplayed) {
	        tableDisplayed = !tableDisplayed;
	        if (tableDisplayed) onTableDisplayed();
	        else onTableHidden();
	    }
	}
	
	function checkBiddingBoxDisplayed() {
	    if (isVisible(getBiddingBox()) != biddingBoxDisplayed) {
	        biddingBoxDisplayed = !biddingBoxDisplayed;
	        if (biddingBoxDisplayed) onBiddingBoxDisplayed();
	        else onBiddingBoxHidden();
	    }
	}
	
	function checkAuctionBoxDisplayed() {
	    if (isVisible(getAuctionBox()) != auctionBoxDisplayed) {
	        auctionBoxDisplayed = !auctionBoxDisplayed;
	        if (auctionBoxDisplayed) onAuctionBoxDisplayed();
	        else onAuctionBoxHidden();
	    }
	}
	
	function checkAnnouncementPanel() {
	    if (isVisible(getAnnouncementPanel()) != announcemenDisplayed) {
	        announcemenDisplayed = !announcemenDisplayed;
	        if (announcemenDisplayed) onAnnouncementDisplayed();
	    }
	}
	
	function checkNotificationPanel() {
	    if (isVisible(getNotificationPanel()) != notificationDisplayed) {
	        notificationDisplayed = !notificationDisplayed;
	        if (notificationDisplayed) onNotificationDisplayed();
	    }
	}
	
	function checkFinalContractPanel() {
	    if (isVisible(getFinalContractPanel()) != finalContractDisplayed) {
	        finalContractDisplayed = !finalContractDisplayed;
	        if (finalContractDisplayed) onFinalContractDisplayed();
	    }
	}
	
	function checkCurrentAuction() {
	    if (currentAuction != getContext()) {
	        currentAuction = getContext();
	        onNewAuction();
	    }
	}
	
	function checkActivePlayer() {
	    if (activePlayer != getActivePlayer()) {
	        activePlayer = getActivePlayer();
	        callText = '';
	        lastSelectedCall = callText;
	        if (activePlayer != '') onNewActivePlayer();
	    }
	}
	
	function checkExplainCallBox() {
	    if (isVisible(getExplainCallBox()) != explainCallDisplayed) {
	        explainCallDisplayed = !explainCallDisplayed;
	        if (explainCallDisplayed) onExplainCallDisplayed();
	        else onExplainCallHidden();
	    }
	}
	
	function checkDealEndPanel() {
	    if (isVisible(getDealEndPanel()) != dealEndPanelDisplayed) {
	        dealEndPanelDisplayed = !dealEndPanelDisplayed;
	        if (dealEndPanelDisplayed) onDealEndPanelDisplayed();
	    }
	}
	
	function checkOpponents() {
	    if ((myOpponent(true) != LHOpponent) || (myOpponent(false) != RHOpponent)) {
	        onAnyOpponentChange();
	    }
	}
	
	function checkDealNumber() {
	    if (getDealNumber() != lastDealNumber) {
	        if (getDealNumber() != '') {
	            onNewDeal();
	        }
	        lastDealNumber = getDealNumber();
	    }
	}
	
	function checkCallText() {
	    if (getMyCall() != lastSelectedCall) {
	        lastSelectedCall = getMyCall();
	        if (isVisible(getAuctionBox())) onNewCallSelected();
	    }
	}
	function checkOKbuttonVisible() {
	    if (buttonOKvisible() != OKbuttonVisible) {
	        OKbuttonVisible = buttonOKvisible();
	        if (isVisible(getAuctionBox())) {
	            if (OKbuttonVisible) {
	                onOKbuttonDisplayed();
	            } else { onOKbuttonHidden(); }
	        }
	    }
	}
	
	function checkOKbuttonPressed() {
	    if (buttonOKpressed() != OKbuttonPressed) {
	        OKbuttonPressed = buttonOKpressed();
	        if (isVisible(getAuctionBox())) {
	            if (OKbuttonPressed) { onOKbuttonPressed(); }
	        }
	    }
	}
	
	function checkChatMessage() {
	    if (getLastChatMessaage() != lastChatMessage) {
	        lastChatMessage = getLastChatMessaage();
	        onNewChatMessage();
	    }
	}
	
	function checkCardLead() {
	    if (cardLead != getCard(90)) {
	        cardLead = getCard(90);
	        onNewLead();
	    }
	}
	
	function checkPlayedCards() {
	    if (playedCards != getPlayedCards()) {
	        playedCards = getPlayedCards();
	        onNewPlayedCard();
	    }
	}
	
	function checkCallExplanationPanel() {
	    if (isVisible(getCallExplanationPanel()) != callExplanationPanelDisplayed) {
	        callExplanationPanelDisplayed = !callExplanationPanelDisplayed;
	        if (callExplanationPanelDisplayed) onCallExplanationPanelDisplayed();
	    }
	}
	
	function checkMyCardsDisplayed() {
	    if ((myCardsDisplayed != getMyHand()) && (getMyHand().length == 26)) {
	        myCardsDisplayed = getMyHand();
	        onMyCardsDisplayed();
	    }
	}
	
	function checkProfileBoxDisplayed() {
	    if (getOpenProfileBBOid() != openProfileBBOid) {
	        openProfileBBOid = getOpenProfileBBOid();
	    }
	}
	
	function checkOpenProfileBBOalertURL() {
	    if (getOpenProfileBBOalertURL() != openProfileBBOalertURL) {
	        openProfileBBOalertURL = getOpenProfileBBOalertURL();
	        if (openProfileBBOalertURL != "") {
	            addBBOalertButtonToProfile();
	        } else {
	            removeBBOalertButtonFromProfile();
	        }
	    }
	}  
	
	/**
	 * @ignore
	 */
	
	// openAccountTab();
	
	
	
	// Create an observer instance linked to the callback function
	const BBOobserver = new MutationObserver(BBOobserverCallback);
	
	// Start observing the target node for configured mutations
	const targetNode = parent.document.body;
	var tmr = setInterval(function () {
	    if (!isVisible(getNavDiv())) return;
	    initGlobals();
	    navDivDisplayed = true;
	    onNavDivDisplayed();
	    clearInterval(tmr);
	    BBOobserver.observe(targetNode, config);
	}, 100);
	

})();

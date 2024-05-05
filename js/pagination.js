import {
  $,
  ptL,
  pass,
  comp,
  curryFactory,
  invokeMethod,
  invokeMethodPair,
  getProp,
  isArray,
} from "./meta.js";

function insertAlready(el, ref) {
  ref.parentNode.insertBefore(el, ref);
  return el;
}

const main = document.querySelector("main"),
  lookup = ["one", "two", "three"],
  evCB = (e) => {
    let el = e.target;
    e.preventDefault();
    if (el.nodeName === "A") {
      let i = el.innerHTML - 1;
      main.className = lookup[i];
    }
  },
  curry2 = curryFactory(2),
  curry4 = curryFactory(4),
  mittel = (m) => (o) => ptL(invokeMethod, o, m),
  mittelPair = (m, p) => (v) => curry4(invokeMethodPair)(v)(p)(m),
  parent = curry2(getProp)("parentNode"),
  appendChild = mittel("appendChild"),
  doTextNow = ptL(invokeMethod, document, "createTextNode"),
  doMake = ptL(invokeMethod, document, "createElement"),
  andAppend = comp(appendChild, doMake),
  setHref = pass(mittelPair("setAttribute", "href")("#")),
  setId = pass(mittelPair("setAttribute", "id")("pagination")),
  nodes = lookup.map(comp(doTextNow, (el, i) => i + 1)),
  links = nodes.map((txtnode) => {
    let f = andAppend("a");
    return comp(setHref, parent, f)(txtnode);
  }),
  lists = links.map((a) => {
    let f = andAppend("li");
    return comp(parent, f)(a);
  }),
  paginate = mittelPair("addEventListener", "click")(evCB),
  doKids = (str, gang) => {
    let el = null,
      cb = comp(parent, andAppend(str)),
      group = isArray(gang) ? gang : [gang];
    group.forEach((node) => {
      if (!el) {
        el = cb(node);
      } else {
        appendChild(el)(node);
      }
    });
    return el;
  };

comp(
  paginate,
  curry2(insertAlready)($("curl")),
  setId,
  ptL(doKids, "nav")
)(doKids("ul", lists));

//trigger
evCB({ target: links[0], preventDefault: () => null });

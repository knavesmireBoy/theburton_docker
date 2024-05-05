import {
  $,
  ptL,
  defer,
  pass,
  comp,
  curryFactory,
  invokeMethod,
  invokeMethodPair,
  invokeSub,
  doWhenPred,
  getProp,
} from "./meta.js";

function insertAlready(el, ref) {
  ref.parentNode.insertBefore(el, ref);
  return el;
}

function backButtonCB(e) {
  if (isButton(e)) {
    let [inc] = getInc();
    doHide("end");
    px -= inc;
    px = Math.max(0, Math.ceil(px));
    doShowStart(px);
    move(px * -1);
  }
}

function foreButtonCB(e) {
  if (isButton(e)) {
    let [inc, limit] = getInc(),
      mayAdvance = mayAdvanceDefer(inc)(limit),
      doGetNext = doGetNextDefer(inc)(limit);
    //https://stackoverflow.com/questions/11160227/translate-x-and-y-percentage-values-based-on-elements-height-and-width
    //https://stackoverflow.com/questions/43065579/how-to-convert-css-transform-matrix-back-to-its-component-properties
    px = getOffset();
    if (mayAdvance(px)) {
      doHide("start");
      px += inc;
      let pix = doGetNext(Math.ceil(px));
      doShowEnd(px, pix);
      px = pix;
      move(px * -1);
    }
  }
}

function select(e) {
  e.preventDefault();
  if (e.target.nodeName === "IMG") {
    let src = e.target.getAttribute("src");
    $("preview").setAttribute("src", src);
  }
}

const slice = Array.prototype.slice,
  andcomp = (f1, f2, seed) => comp(f1, f2)(seed),
  curry2 = curryFactory(2),
  curry3 = curryFactory(3),
  curry4 = curryFactory(4),
  mittel4 = (f) => (m, p) => (v) => curry4(f)(v)(p)(m),
  prepAnchor = (m) => (o) => ptL(invokeMethod, o, m),
  mittelPair = mittel4(invokeMethodPair),
  mittelSub = mittel4(invokeSub),
  build =
    (...funcs) =>
    (o) => {
      funcs.forEach((f) => f(o));
      return o;
    },
  getTarget = curry2(getProp)("target"),
  doPreventDefault = pass(curry3(invokeMethod)(null)('preventDefault')),
  lead_slide = document.querySelector("#slides a"),
  $slides = $("slides"),
  $viewer = $("viewer"),
  $article = document.querySelector("main > article"),
  appendArticle = ptL(invokeMethod, $article, "appendChild"),
  appendViewer = ptL(invokeMethod, $viewer, "appendChild"),
  doMake = ptL(invokeMethod, document, "createElement"),
  doMakeDefer = defer(invokeMethod, document, "createElement"),
  doControlKlas = pass(mittelSub("classList", "add")("control")),
  viewerAppend = comp(appendViewer, doControlKlas, doMake),
  setId = mittelPair("setAttribute", "id"),
  setAlt = mittelPair("setAttribute", "alt")("preview pic"),
  setSrc = mittelPair("setAttribute", "src")(lead_slide.getAttribute("href")),
  setPreview = setId("preview"),
  doPreviewKlas = mittelSub("classList", "add")("prev"),
  prepPic =
    (...funcs) =>
    (seed) => {
      return build(...funcs)(seed);
    },
  doPic = prepPic(setPreview, setAlt, setSrc),
  setFore = comp(doControlKlas, setId("forward")),
  setAft = comp(doControlKlas, setId("back")),
  factor = 4,
  extent = document.querySelectorAll("#slides img").length,
  fraction = extent / factor,
  slideAppend = curry2(insertAlready)($slides),
  all_slides = slice.call(document.querySelectorAll("#slides a")),
  doViewKlas = ptL(invokeSub, $viewer, "classList"),
  doViewKlasDefer = defer(invokeSub, $viewer, "classList"),
  link = comp(
    ptL(andcomp),
    prepAnchor("appendChild"),
    pass(doPreviewKlas),
    comp(appendArticle, doMake)
  )("a"),
  doShow = doViewKlas("add"),
  doShowStart = doWhenPred((x) => !x, doViewKlasDefer("add")("start")),
  doShowEnd = doWhenPred((a, b) => a !== b, doViewKlasDefer("add")("end")),
  doHide = doViewKlas("remove"),
  move = (pix, flag = false) => {
    let p = Math.ceil((pix * 400) / $slides.clientWidth),
      n = Math.round(p / 100) * 100;
    all_slides.forEach((element) => {
      element.style.transform = `translateX(${n}%)`;
      if (!flag) element.classList.add("foo");
    });
  },
  doAdvance = (pix, lmt, incr) => pix !== lmt - incr,
  getNext = (pix, lmt, incr) => (pix + incr > lmt ? lmt - incr : pix),
  mayAdvanceDefer = curry3(doAdvance),
  doGetNextDefer = curry3(getNext),
  validateButton = (tgt) => {
    return tgt.classList.contains("control");
  },
  isButton = comp(validateButton, getTarget, doPreventDefault),
  getInc = () => {
    let item = document.querySelector("#slides img").clientWidth,
      inc = item * factor,
      limit = inc * fraction;
    return [inc, limit];
  },
  getOffset = () => {
    let style = window.getComputedStyle(lead_slide, null),
      values = style.transform.match(/-?\d+\.?\d*/g);
    return values ? Math.abs(Math.ceil(values[4])) : 0;
  },
  backCB = curry4(invokeMethodPair)(backButtonCB)("click")("addEventListener"),
  forwardCB =
    curry4(invokeMethodPair)(foreButtonCB)("click")("addEventListener"),
  selectCB = curry4(invokeMethodPair)(select)("click")("addEventListener"),
  decoForward = comp(forwardCB, pass(setId("forward"))),
  decoBack = comp(backCB, slideAppend, pass(setId("back")), doControlKlas);

link(doPic, doMake("img"));

comp(decoForward, viewerAppend)("div");
comp(decoBack, doMake)("div");
selectCB($slides);
let px = getOffset();

/*
let rtime,
  timeout = false,
  delta = 200,
  win = 0;

function resizeend() {
  if (new Date() - rtime < delta) {
    setTimeout(resizeend, delta);
  } else {
    timeout = false;
    let w = window.viewportSize.getWidth() / win;
    //  px *= w;
  }
}

window.addEventListener("resize", () => {
  rtime = new Date();
  if (timeout === false) {
    win = window.viewportSize.getWidth();
    timeout = true;
    setTimeout(resizeend, delta);
  }
});
*/

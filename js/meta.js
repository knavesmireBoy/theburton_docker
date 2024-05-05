const tagTester = (name) => {
    let tag = "[object " + name + "]";
    return function (obj) {
      return toString.call(obj) === tag;
    };
  },
  isFunction = tagTester("Function"),
  doPartial = (flag) => {
    return function p(f, ...args) {
      if (f.length === args.length) {
        return flag ? () => f(...args) : f(...args);
      }
      return (...rest) => p(f, ...args, ...rest);
    };
  },
  resolve = (o) => (isFunction(o) ? o() : o),
  invoke = (f, o) => f(o),
  con = (x) => {
    console.log(x);
    return x;
  },
  always = (arg) => () => arg,
  identity = (arg) => arg,
  wrap =
    (f) =>
    (...args) =>
      f(...args);

export const $ = (id) => document.getElementById(id);
export const ptL = doPartial();
export const defer = doPartial(true);
export const pass = (partial) => (o) => {
  partial(o);
  return o;
};
export const comp = (...fns) =>
  fns.reduce(
    (f, g) =>
      (...vs) =>
        f(g(...vs))
  );

export const curryFactory = (i) => {
  const zero = arg => arg,
  one = (f) => (a) => f(a),
    two = (f) => (b) => (a) => f(a, b),
    three = (f) => (c) => (b) => (a) => f(a, b, c),
    four = (f) => (d) => (c) => (b) => (a) => f(a, b, c, d),
    ret = [
      zero,
      one,
      two,
      three,
      four
    ]
  return ret[i] ?? ret[0];
};

export const invokeMethod = (o, m, v) => resolve(o)[m](v);
export const invokeMethodPair = (o, m, p, v) => resolve(o)[m](p, v);
export const invokeSub = (o, m, k, v) => o[m][k](v);

export const doWhenPred = (pred, action) => {
  return  (...args) => {
    if (pred(...args)) {
      return action(...args);
    }
  };
};

export const getProp = (o, p) => o[p];

export const isArray = tagTester("Array");

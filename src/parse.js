import { parse as pegParse } from "./loglan";

const hashCode = function (s) {
  return s.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
};

const number2ColorHue = (number) => Math.floor(((number * 360) / 7.618) % 360);

const bgString2Int = (number, { s = "90%", l = "80%" }) =>
  `hsl(${number2ColorHue(hashCode(number))},${s},${l})`;

function getNodesNEdges(obj, opts) {
  let node_id = 0;
  let arr = [];
  function eachRecursive(leaf) {
    if (leaf.rule) {
      //add id prop to this leaf
      leaf.id = node_id;
      node_id++;

      //prettify leaf's children
      if (
        opts.lowNodes?.includes(leaf.rule) ||
        (!opts.morphemes &&
          /^([A-Z]+[0-9]*|comma\b|comma2\b|period\b|end\b)/.test(leaf.rule))
      ) {
        leaf.children = [];
      } else {
        leaf.children = leaf.children
          ? Array.isArray(leaf.children)
            ? leaf.children
            : [leaf.children]
          : [];
        leaf.children = leaf.children.flat(Infinity).filter(Boolean);

        //remove intermediate nodes
        if (opts.removeIntermediateNodes)
          while (
            leaf.children.length === 1 &&
            !opts.importantNodes.includes(leaf.children[0].rule)
            && (leaf.children[0].children ?? []).length > 0
          ) {
            leaf.children = leaf.children[0].children ?? [];
          }

        //add parent key to each child
        leaf.children = leaf.children.map((child) => ({
          ...child,
          parent: leaf.id,
        }));
      }

      
      //add to flat array our leaf
      arr.push({
        // group: "nodes",
        data: {
          id: leaf.id,
          displayName: `[${leaf.rule || ""}] ${leaf.text || ""}`.trim(),
          rule: leaf.rule,
          text: leaf.text,
          display: 1,
          collapse: 0,
          color: bgString2Int(leaf.rule, { s: "90%", l: "70%" }),
        },
        // classes: "nodeIcon",
      });
      if (typeof leaf.parent !== "undefined")
        arr.push({
          data: { group: "edges", source: leaf.parent, target: leaf.id },
        });

      //traverse children
      leaf.children.forEach((child) => eachRecursive(child));
    }
  }
  eachRecursive(obj);
  return arr;
}

export function parse(text, options) {
  if (!text) return;
  try {
    const parsed = pegParse(text, {
      startRule: options.startRule || "utterance",
    });

    const tree = getNodesNEdges(parsed, options);
    return tree;
  } catch (error) {
    console.log({ error, text });
  }
}

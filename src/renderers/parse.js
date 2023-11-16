import { parse as pegParse } from "../camxes";
import { generate as generateCy } from "./cytoscape";
import { generate as generateThree } from "./three";
import { getNLPTree } from "./syntax-tree";
import { regexpCompressPointyRules } from "../options";

const hashCode = function (s) {
  return s.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
};

const number2ColorHue = (number) => Math.floor(((number * 360) / 7.618) % 360);

const bgString2Int = (number, { s = "90%", l = "80%" }) =>
  `hsl(${number2ColorHue(hashCode(number))},${s},${l})`;

function cleanUpChildren(children) {
  if (typeof children === "string") children = [];
  children = children ? (Array.isArray(children) ? children : [children]) : [];
  return children
    .flat(Infinity)
    .filter(Boolean)
    .filter((child) => !(Array.isArray(child) && child.length === 0))
    .flat(Infinity);
}

function getNodesNEdges(obj, opts) {
  if (opts.layout.renderer === "NLPTree") return getNLPTree(obj, opts);
  const generate =
    opts.layout.renderer === "three.js" ? generateThree : generateCy;
  const { pics } = opts;
  let node_id = 0;
  let arr = [];
  function eachRecursive(
    leaf,
    { ancestorId, ancestorHasPic, parentLeaf, ancestorLeafIsGroup }
  ) {
    if (typeof leaf.rule === "undefined") return;
    //add id prop to this leaf
    leaf.id = node_id;
    node_id++;

    leaf.children = leaf.children
      ? Array.isArray(leaf.children)
        ? leaf.children
        : [leaf.children]
      : [];

    //prettify leaf's children
    if (opts.lowNodes?.includes(leaf.rule)) {
      leaf.children = [];
    } else if (!opts.morphemes && regexpCompressPointyRules.test(leaf.rule)) {
      leaf.children = [];
    } else {
      leaf.children = cleanUpChildren(leaf.children);

      //remove intermediate nodes
      if (opts.removeIntermediateNodes)
        while (
          leaf.children.length === 1 &&
          !opts.importantNodes
            .concat(opts.hyperedgeRules)
            .includes(leaf.children[0].rule) &&
          cleanUpChildren(leaf.children[0].children).length > 0
        ) {
          leaf.children = cleanUpChildren(leaf.children[0].children);
        }

      //add parent key to each child
      leaf.children = leaf.children.map((child) => ({
        ...child,
        parent: leaf.id,
      }));
    }

    leaf.text = (leaf.text ?? "").trim();
    leaf.rule = (leaf.rule ?? "").trim();

    leaf.pic =
      !ancestorHasPic &&
      !parentLeaf?.pic &&
      opts.pictureRules.includes(leaf.rule) &&
      pics[leaf.text]
        ? encodeURIComponent(pics[leaf.text])
        : undefined;

    //check if this rule contains morphemes
    let containsMorphemes;
    if (!ancestorLeafIsGroup) {
      containsMorphemes = opts.hyperedgeRules.includes(leaf.rule);
      if (!containsMorphemes)
        leaf.children.forEach((child) => {
          if (RegExp("^[a-z' .]$").test(child.rule)) containsMorphemes = true;
        });
    }

    let parent;

    if (containsMorphemes) {
      if (!opts.morphemes) {
        leaf.children = [];
      } else {
        parent = "group" + node_id;
      }
    }

    //add our node
    arr.push(
      generate.node({
        id: leaf.id,
        displayName: `[${leaf.rule || ""}] ${leaf.text}`.trim(),
        rule: leaf.rule.replace(/_/g, "-"),
        pic: leaf.pic,
        text: leaf.text,
        parent: parent ?? ancestorId,
        display: 1,
        collapse: 0,
        color: bgString2Int(leaf.rule, { s: "90%", l: "70%" }),
      })
    );

    //add our edge

    if (typeof leaf.parent !== "undefined")
      arr.push(
        generate.edge({
          source: leaf.parent,
          target: leaf.id,
        })
      );

    //add our hyperedge
    if (parent) {
      arr.push(generate.hyperedge({ parent }));
    }

    arr = arr.filter(Boolean);
    //traverse children
    leaf.children.forEach((child) =>
      eachRecursive(child, {
        ancestorLeafIsGroup: ancestorLeafIsGroup || containsMorphemes,
        ancestorId: parent ?? ancestorId,
        ancestorHasPic: ancestorHasPic ?? typeof leaf.pic !== "undefined",
        parentLeaf: leaf,
      })
    );
  }
  eachRecursive(obj, {});
  return arr;
}

export function parse(text, options) {
  if (!text) return;
  try {
    const parsed = pegParse(text, {
      startRule: options.startRule || "text",
    });
    // const parsed = {};

    // console.log("parse tree: ", JSON.stringify(parsed), options);
    const tree = getNodesNEdges(parsed, options);

    return tree;
  } catch (error) {
    throw error;
    // console.log({ error, text });
  }
}

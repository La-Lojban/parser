import { parse as pegParse } from "../camxes";
import { generate as generateCy } from "./cytoscape";
import { generate as generateThree } from "./three";
import { getNLPTree } from "./syntax-tree";
import { eachRecursive, cleanUpAllChildren } from "./utils/fns";

function getNodesNEdges(obj, opts) {
  if (opts.layout.renderer === "NLPTree") return getNLPTree(obj, opts);
  const generate =
    opts.layout.renderer === "three.js" ? generateThree : generateCy;

  const res = eachRecursive(cleanUpAllChildren(obj, opts), {
    opts,
    generate,
    mode: "nlp",
  });
  return res.array;
}

export function parse(text, options) {
  if (!text) return;
  try {
    const parsed = pegParse(text, {
      startRule: options.startRule || "text",
    });
    const tree = getNodesNEdges(parsed, options);

    return tree;
  } catch (error) {
    throw error;
  }
}

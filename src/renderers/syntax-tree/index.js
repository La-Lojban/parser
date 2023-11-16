import Tree from "./tree";

import { cleanUpChildren } from "../utils/fns";

function eachRecursive(leaf, { parentLeaf, node_id, pics }, opts) {
  if (typeof leaf.rule === "undefined") return;
  leaf.type = parentLeaf ? "NODE" : "ROOT";
  //add id prop to this leaf
  leaf.id = node_id.num;
  node_id.num = node_id.num + 1;

  //prettify leaf's children
  if (opts.lowNodes?.includes(leaf.rule)) {
    leaf.children = [];
  } else {
    leaf.children = cleanUpChildren(leaf.children, opts);

    //remove intermediate nodes
    if (opts.removeIntermediateNodes)
      while (
        leaf.children.length === 1 &&
        !opts.importantNodes
          .concat(opts.hyperedgeRules)
          .includes(leaf.children[0].rule) &&
        cleanUpChildren(leaf.children[0].children, opts).length > 0
      ) {
        leaf.children = cleanUpChildren(leaf.children[0].children, opts);
      }

    leaf.children = cleanUpChildren(leaf.children, opts);

    //add parent key to each child
    leaf.children = leaf.children.map((child) => ({
      ...child,
      parent: leaf.id,
    }));
  }

  leaf.text = (leaf.text ?? "").trim();
  leaf.rule = (leaf.rule ?? "").trim();
  leaf.pic =
    !parentLeaf?.pic && opts.pictureRules.includes(leaf.rule) && pics[leaf.text]
      ? encodeURIComponent(pics[leaf.text])
      : undefined;

  //check if this rule contains morphemes
  let containsMorphemes;
  containsMorphemes = opts.hyperedgeRules.includes(leaf.rule);
  if (!containsMorphemes)
    leaf.children.forEach((child) => {
      if (RegExp("^[a-z' .]$").test(child.rule)) containsMorphemes = true;
    });

  let parent;

  if (containsMorphemes) {
    if (!opts.morphemes) {
      leaf.children = [];
    } else {
      parent = "group" + node_id;
    }
  }

  //traverse children
  leaf.children = leaf.children.map((child) =>
    eachRecursive(
      child,
      {
        parentLeaf: leaf,
        pics,
        node_id,
      },
      opts
    )
  );
  if (leaf.children.length == 0) {
    leaf.type = "VALUE";
  }
  leaf.children = cleanUpChildren(leaf.children, opts);

  return leaf;
}

export const getNLPTree = (obj, opts) => {
  const { pics } = opts;
  return eachRecursive(obj, { node_id: { num: 0 }, pics }, opts);
};

export function renderNLPTree({ data, options }) {
  const canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.height = canvas.offsetHeight;
  document.getElementById("cy").appendChild(canvas);
  const tree = new Tree(document.getElementById("canvas"));
  tree.setAlignBottom(!!options.layout.config.alignBottom);
  tree.draw(data);
}

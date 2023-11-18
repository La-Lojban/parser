import Tree from "./tree";

import { eachRecursive, cleanUpAllChildren } from "../utils/fns";

export const getNLPTree = (obj, opts) => {
  return eachRecursive(cleanUpAllChildren(obj, opts), {
    opts,
    mode: "syntax-tree",
  }).leaf;
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

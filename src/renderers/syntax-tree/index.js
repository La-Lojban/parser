import Tree from "./tree";

function normalizeChildren(leaf, opts) {
  let children = leaf.children ?? [];
  if (
    opts.lowNodes?.includes(leaf.rule) ||
    (!opts.morphemes &&
      /^([A-Z]+[0-9]*|comma\b|comma2\b|period\b|end\b)/.test(leaf.rule))
  ) {
    children = [];
    if (typeof children === "string") children = [];
    children = Array.isArray(children) ? children : [children];
    children = children.flat(Infinity).filter((_) => _?.rule);
  }
  return { ...leaf, children };
}

function cleanUpChildren(children) {
  if (typeof children === "string") children = [];
  children = children ? (Array.isArray(children) ? children : [children]) : [];
  return children
    .filter(Boolean)
    .filter((child) => !(Array.isArray(child) && child.length === 0));
}

function eachRecursive(leaf, { parentLeaf, node_id, pics }, opts) {
  if (typeof leaf.rule === "undefined") return leaf;
  leaf.type = parentLeaf ? "NODE" : "ROOT";
  if (!leaf.rule) return leaf;
  //add id prop to this leaf
  leaf.id = node_id.num;
  node_id.num = node_id.num + 1;

  //prettify leaf's children
  if (
    opts.lowNodes?.includes(leaf.rule) ||
    (!opts.morphemes &&
      /^([A-Z]+[0-9]*|comma\b|comma2\b|period\b|end\b)/.test(leaf.rule))
  ) {
    leaf.children = [];
  } else {
    leaf = normalizeChildren(leaf, opts);
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

    leaf.children = Array.isArray(leaf.children)
      ? leaf.children
      : leaf.children
      ? [leaf.children]
      : [];
    leaf.children = leaf.children.flat(Infinity).filter((_) => _?.rule) ?? [];

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

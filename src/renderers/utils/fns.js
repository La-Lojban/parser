import { regexpCompressPointyRules } from "../../options";

export function cleanUpChildren(children, opts) {
  if (typeof children === "string") children = [];
  children = children ? (Array.isArray(children) ? children : [children]) : [];
  children = children
    .flat(Infinity)
    .filter(
      (child) =>
        !(Array.isArray(child) && child.length === 0) &&
        !!child &&
        typeof child !== "string"
    )
    .flat(Infinity);
  if (opts.removeDeletableNodes) {
    children = children.filter(
      (leaf) => !opts.nodesToDelete.some((rx) => rx.test(leaf.rule))
    );
  }
  return children;
}

const hashCode = (s) =>
  s.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);

const number2ColorHue = (number) => Math.floor(((number * 360) / 7.618) % 360);

const bgString2Int = (number, { s = "90%", l = "80%" }) =>
  `hsl(${number2ColorHue(hashCode(number))},${s},${l})`;

function recursivelyCleanUpIntermediateChildren(leaf, opts) {
  while (
    leaf.children.length === 1 &&
    !opts.importantNodes
      .concat(opts.hyperedgeRules)
      .includes(leaf.children[0].rule) &&
    cleanUpChildren(leaf.children[0].children, opts).length > 0
  ) {
    leaf.children = cleanUpChildren(leaf.children[0].children, opts);
  }
  return leaf;
}

export function cleanUpAllChildren(leaf, opts) {
  leaf.children = cleanUpChildren(leaf.children, opts);
  if (!leaf.children) return leaf;
  leaf.children = leaf.children
    .map((child) => cleanUpAllChildren(child, opts))
    .filter(Boolean);
  return leaf;
}

export function eachRecursive(
  leaf,
  {
    ancestorId,
    ancestorHasPic,
    parentLeaf,
    ancestorLeafIsGroup,
    opts,
    node_id = 0,
    generate,
    array = [],
    mode,
  }
) {
  if (leaf.rule === undefined) return;

  Object.assign(leaf, {
    type: parentLeaf ? "NODE" : "ROOT",
    id: node_id++,
    text: leaf.text?.trim() ?? "",
    rule: leaf.rule?.trim() ?? "",
  });

  if (
    opts.lowNodes?.includes(leaf.rule) ||
    (mode === "nlp" &&
      !opts.morphemes &&
      regexpCompressPointyRules.test(leaf.rule))
  ) {
    leaf.children = [];
  } else {
    if (opts.removeIntermediateNodes) {
      leaf = recursivelyCleanUpIntermediateChildren(leaf, opts);
    }
  }

  leaf.children = leaf.children.map((child) => ({ ...child, parent: leaf.id }));

  leaf.pic =
    !ancestorHasPic &&
    !parentLeaf?.pic &&
    opts.pictureRules.includes(leaf.rule) &&
    opts.pics[leaf.text]
      ? encodeURIComponent(opts.pics[leaf.text])
      : undefined;

  const containsMorphemes =
    (!ancestorLeafIsGroup && opts.hyperedgeRules.includes(leaf.rule)) ||
    leaf.children.some((child) => RegExp("^[a-z' .]$").test(child.rule));

  let parent;

  if (containsMorphemes) {
    if (!opts.morphemes) {
      leaf.children = [];
    } else {
      parent = "group" + node_id;
    }
  }

  if (generate) {
    array.push(
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

    leaf.parent !== undefined &&
      array.push(generate.edge({ source: leaf.parent, target: leaf.id }));

    parent && array.push(generate.hyperedge({ parent }));

    array = array.filter(Boolean);
  }

  leaf.children =
    mode === "syntax-tree"
      ? leaf.children
          .map((child) => {
            const res = eachRecursive(child, {
              parentLeaf: leaf,
              node_id,
              opts,
              mode,
            });
            node_id = res?.node_id ?? node_id;
            array = res?.array ?? array;
            return res?.leaf;
          })
          .filter(Boolean)
      : leaf.children.forEach((child, i) => {
          const res = eachRecursive(child, {
            ancestorLeafIsGroup: ancestorLeafIsGroup || containsMorphemes,
            ancestorId: parent ?? ancestorId,
            ancestorHasPic: ancestorHasPic ?? typeof leaf.pic !== "undefined",
            parentLeaf: leaf,
            opts,
            node_id,
            generate,
            array,
            mode,
          });
          node_id = res?.node_id ?? node_id;
          array = res?.array ?? array;
          leaf.children[i] = res?.leaf;
        });

  leaf.type = leaf.children?.length === 0 ? "VALUE" : leaf.type;

  return { node_id, array, leaf };
}

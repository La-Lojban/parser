export function cleanUpChildren(children, opts) {
  if (typeof children === "string") children = [];
  children = children ? (Array.isArray(children) ? children : [children]) : [];
  children = children
    .flat(Infinity)
    .filter(Boolean)
    .filter((child) => !(Array.isArray(child) && child.length === 0))
    .flat(Infinity);
  if (opts.removeDeletableNodes) {
    children = children.filter(
      (leaf) => !opts.nodesToDelete.some((rx) => rx.test(leaf.rule))
    );
  }
  return children;
}

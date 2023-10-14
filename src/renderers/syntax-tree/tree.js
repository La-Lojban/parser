"use strict";

const NODE_PADDING = 20;

const NodeType = {
  ROOT: "ROOT",
  NODE: "NODE",
  VALUE: "VALUE",
};

export default class Tree {
  constructor(c) {
    this.nodeColor = true;
    this.font = "sans-serif";
    this.terminalColor = "#BB1100";
    this.labelColor = "#0044BB";
    this.ruleColor = "#666666";
    this.fontSize = 16;
    this.triangles = true;
    this.subscript = true;
    this.alignTerminals = false;
    this.canvas = c;
    this.vscaler = 1;
    this.context = c.getContext("2d");
  }

  CCtextWidth(t) {
    this.context.font = [this.fontSize, "px ", this.font].join("");
    return this.context.measureText(t).width;
  }

  CCtext({
    text,
    x,
    y,
    italic,
    bold,
    fontsize = this.fontSize,
    shadowColor = "transparent",
    shadowBlur = 0,
    shadowOffsetX = 0,
    shadowOffsetY = 0,
    fillStyle,
  }) {
    this.context.font = [
      italic ? "italic " : "",
      bold ? "bold " : "",
      fontsize,
      `px `,
      this.font,
    ].join("");
    if (fillStyle) this.CCsetFillStyle(fillStyle);

    this.CCsetShadow({ shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY });
    this.context.fillText(text, x, y);
    this.CCsetShadow({
      shadowColor: "transparent",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    });
  }

  CCsetShadow({ shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY }) {
    this.context.shadowColor = shadowColor;
    this.context.shadowBlur = shadowBlur;
    this.context.shadowOffsetX = shadowOffsetX;
    this.context.shadowOffsetY = shadowOffsetY;
  }

  CCsetFillStyle(s) {
    this.context.fillStyle = s;
  }

  CCsetStrokeStyle(s) {
    this.context.strokeStyle = s;
  }

  CCsetLineWidth(w) {
    this.context.lineWidth = w;
  }

  CCline(x1, y1, x2, y2) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  CCtriangle(x1, y1, x2, y2, x3, y3, fill = false) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x1, y1);
    if (fill) ctx.fill();
    ctx.stroke();
  }

  CCcurve(x1, y1, x2, y2, cx1, cy1, cx2, cy2) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    ctx.stroke();
  }

  resizeCanvas(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.textAlign = "center";
    this.context.textBaseline = "top";

    this.context.translate(0, this.fontSize / 2);
  }

  draw(syntax_tree) {
    const drawables = drawableFromNode(this, syntax_tree);
    const max_depth = getMaxDepth(drawables);
    if (this.alignTerminals) moveLeafsToBottom(drawables, max_depth);
    if (this.subscript) calculateAutoSubscript(drawables);
    const has_arrow = calculateDrawablePositions(this, drawables, this.vscaler);
    const arrowSet = makeArrowSet(drawables, this.fontSize);
    const arrowScaler = Math.pow(
      Math.sqrt(arrowSet.maxBottom) / arrowSet.maxBottom,
      1 / 50
    );

    this.resizeCanvas(
      drawables.width + 1,
      Math.max(
        (max_depth + 1) * (this.fontSize * this.vscaler * 3),
        has_arrow ? arrowSet.maxBottom * arrowScaler : 0
      )
    );
    drawables.children.forEach((child) => this.drawNode(child));
    this.drawArrows(arrowSet.arrows);
  }

  drawNode(drawable) {
    this.drawLabel(drawable);

    drawable.children.forEach((child) => {
      this.drawNode(child);
      this.drawConnector(drawable, child);
    });
  }

  drawLabel(drawable) {
    const terminalCoincidesWithRule = doesTerminalCoincideWithRule(drawable);
    this.CCtext({
      fillStyle: terminalCoincidesWithRule
        ? this.terminalColor
        : this.ruleColor,
      text: drawable.rule,
      x: getDrawableCenter(drawable),
      y: terminalCoincidesWithRule ? drawable.top + 7 : drawable.top - 7,
      italic: true,
    });

    this.drawSubscript(drawable);

    if (!terminalCoincidesWithRule) {
      this.CCtext({
        fillStyle: drawable.is_leaf ? this.terminalColor : this.labelColor,
        text: drawable.text,
        x: getDrawableCenter(drawable),
        y: drawable.top + 7,
        // bold: true,
        shadowColor: "#666",
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      });
    }
  }

  drawSubscript(drawable) {
    if (drawable.subscript == null || drawable.subscript == "") return;
    let offset =
      1 + getDrawableCenter(drawable) + this.CCtextWidth(drawable.rule) / 2;
    offset += this.CCtextWidth(drawable.subscript) / 2;
    this.CCtext({
      fillStyle: '#666',
      text: drawable.subscript,
      x: offset,
      y: drawable.top + this.fontSize / 2 - 9,
      italic: true,
      fontsize: this.fontSize * 0.75,
    });
  }

  drawConnector(parent, child) {
    const terminalCoincidesWithRule = doesTerminalCoincideWithRule(child);
    if (this.triangles && child.is_leaf && child.rule.includes(" ")) {
      const text_width = this.CCtextWidth(child.rule);
      this.CCtriangle(
        getDrawableCenter(parent),
        parent.top + this.fontSize + 2,
        getDrawableCenter(child) + text_width / 2 - 4,
        child.top - 3,
        getDrawableCenter(child) - text_width / 2 + 4,
        child.top - 3
      );
    } else {
      this.CCline(
        getDrawableCenter(parent),
        parent.top + this.fontSize + 9,
        getDrawableCenter(child),
        terminalCoincidesWithRule ? child.top + 3 : child.top - 10
      );
    }
  }

  drawArrows(arrows) {
    const arrow_color = this.nodeColor ? "#909" : "#999";
    this.CCsetFillStyle(arrow_color);
    this.CCsetStrokeStyle("white");
    this.CCsetLineWidth(2);
    for (const arrow of arrows) {
      this.CCcurve(
        arrow.from_x,
        arrow.from_y,
        arrow.to_x,
        arrow.to_y,
        arrow.from_x,
        arrow.bottom,
        arrow.to_x,
        arrow.bottom
      );
      if (arrow.ends_to) this.drawArrowHead(arrow.to_x, arrow.to_y);
      if (arrow.ends_from) this.drawArrowHead(arrow.from_x, arrow.from_y);
    }
  }

  drawArrowHead(x, y) {
    const cx = this.fontSize / 4;
    const cy = this.fontSize / 2;
    this.CCtriangle(x, y, x - cx, y + cy, x + cx, y + cy, true);
  }

  setAlignBottom(a) {
    this.alignTerminals = a;
  }
}

class Arrow {
  constructor(from_x, from_y, to_x, to_y, bottom, ends_to, ends_from) {
    this.from_x = from_x;
    this.from_y = from_y;
    this.to_x = to_x;
    this.to_y = to_y;
    this.bottom = bottom;
    this.ends_to = ends_to;
    this.ends_from = ends_from;
  }
}

class ArrowSet {
  constructor() {
    this.arrows = [];
    this.maxBottom = 0;
  }

  add(arrow) {
    this.arrows.push(arrow);
    this.maxBottom = Math.max(this.maxBottom, arrow.bottom);
  }

  concatenate(arrowSet) {
    this.arrows = this.arrows.concat(arrowSet.arrows);
    this.maxBottom = Math.max(this.maxBottom, arrowSet.maxBottom);
  }
}

function doesTerminalCoincideWithRule(drawable) {
  return drawable.is_leaf && drawable.rule === drawable.text;
}

function drawableFromNode(tree, node, depth = -1) {
  const drawable = {
    rule: node.rule,
    text: node.text,
    subscript: node.subscript,
    width: getNodeWidth(tree, node),
    depth: depth,
    is_leaf: node.type == NodeType.VALUE,
    arrow: "arrow" in node ? node.arrow : null,
    children: [],
  };

  if (node.type != NodeType.VALUE) {
    node.children.forEach((child) => {
      drawable.children.push(drawableFromNode(tree, child, depth + 1));
    });
  }

  return drawable;
}

function getNodeWidth(tree, node) {
  let label_width =
    node.type != NodeType.ROOT
      ? Math.max(tree.CCtextWidth(node.rule), tree.CCtextWidth(node.text)) +
        NODE_PADDING
      : 0;
  if (node.subscript)
    label_width += ((tree.CCtextWidth(node.subscript) * 3) / 4) * 2;
  if (node.type != NodeType.VALUE) {
    return Math.max(label_width, getChildWidth(tree, node));
  } else {
    return label_width;
  }
}

function calculateDrawablePositions(
  tree,
  drawable,
  vscaler,
  parent_offset = 0
) {
  let offset = 0;
  let scale = 1;
  let hasArrow = drawable.arrow;

  if (drawable.depth >= 0) {
    const child_width = getDrawableChildWidth(drawable);
    if (drawable.width > child_width) scale = drawable.width / child_width;
  }

  drawable.children.forEach((child) => {
    child.top = child.depth * (tree.fontSize * 3 * vscaler) + NODE_PADDING / 2;
    child.left = offset + parent_offset;
    child.width *= scale;
    const child_has_arrow = calculateDrawablePositions(
      tree,
      child,
      vscaler,
      child.left
    );
    if (child_has_arrow) hasArrow = true;
    offset += child.width;
  });

  return hasArrow;
}

function getChildWidth(tree, node) {
  if (node.type == NodeType.VALUE) return 0;
  let child_width = 0;
  node.children.forEach((child) => {
    child_width += getNodeWidth(tree, child);
  });
  return child_width;
}

function getDrawableChildWidth(drawable) {
  if (drawable.children.length == 0) return drawable.width;
  let child_width = 0;
  drawable.children.forEach((child) => {
    child_width += child.width;
  });
  return child_width;
}

function getMaxDepth(drawable) {
  let max_depth = drawable.depth;
  drawable.children.forEach((child) => {
    const child_depth = getMaxDepth(child);
    if (child_depth > max_depth) max_depth = child_depth;
  });
  return max_depth;
}

function moveLeafsToBottom(drawable, bottom) {
  if (drawable.is_leaf) drawable.depth = bottom;
  drawable.children.forEach((child) => moveLeafsToBottom(child, bottom));
}

function calculateAutoSubscript(drawables) {
  const map = countNodes(drawables);
  map.forEach((value, key, map) => {
    if (value === 1) map.delete(key);
  });
  assignSubscripts(drawables, Array.from(map.keys()), new Map());
}

function assignSubscripts(drawable, keys, tally) {
  if (
    !drawable.is_leaf &&
    (drawable.subscript == null || drawable.subscript == "") &&
    keys.includes(drawable.rule)
  ) {
    mapInc(tally, drawable.rule);
    drawable.subscript = "" + tally.get(drawable.rule);
  }
  drawable.children.forEach((child) => assignSubscripts(child, keys, tally));
}

function countNodes(drawable) {
  let map = new Map();
  if (drawable.is_leaf) return map;
  if (drawable.subscript == null || drawable.subscript == "")
    mapInc(map, drawable.rule);

  drawable.children.forEach((child) => {
    const child_map = countNodes(child);
    map = mapMerge(map, child_map);
  });

  return map;
}

function findTarget(drawable, arrow_idx) {
  const [, target] = findTargetLeaf(drawable, arrow_idx, 0);
  return target;
}

function findTargetLeaf(drawable, arrow_idx, count) {
  if (drawable.is_leaf && ++count == arrow_idx) return [count, drawable];
  for (const child of drawable.children) {
    let target = null;
    [count, target] = findTargetLeaf(child, arrow_idx, count);
    if (target != null) return [count, target];
  }
  return [count, null];
}

function mapInc(map, key) {
  if (!map.has(key)) map.set(key, 1);
  else map.set(key, map.get(key) + 1);
}

function mapMerge(one, two) {
  two.forEach((value, key) => {
    if (one.has(key)) one.set(key, one.get(key) + value);
    else one.set(key, value);
  });
  return one;
}

function getDrawableCenter(drawable) {
  return drawable.left + drawable.width / 2;
}

function findMaxDepthBetween(drawable, left, right, max_y = 0) {
  drawable.children.forEach((child) => {
    const child_low = findMaxDepthBetween(child, left, right, max_y);
    max_y = Math.max(child_low, max_y);
  });

  if (drawable.is_leaf && drawable.left >= left && drawable.left <= right) {
    max_y = Math.max(drawable.top, max_y);
  }

  return max_y;
}

function makeArrowSet(root, fontsize) {
  return makeArrowSetOn(root, root, fontsize);
}

function makeArrowSetOn(root, drawable, fontsize) {
  const arrowSet = new ArrowSet();
  drawable.children.forEach((child) => {
    arrowSet.concatenate(makeArrowSetOn(root, child, fontsize));
  });

  if (!drawable.is_leaf || !drawable.arrow) return arrowSet;

  const target = findTarget(root, drawable.arrow.target);
  if (!target) return arrowSet;

  const from = {
    x: getDrawableCenter(drawable),
    y: drawable.top + fontsize * 1.2,
  };
  const to = { x: getDrawableCenter(target), y: target.top + fontsize * 1.2 };

  const bottom =
    1.4 *
    findMaxDepthBetween(
      root,
      Math.min(drawable.left, target.left),
      Math.max(drawable.left, target.left)
    );

  const ends_to = drawable.arrow.ends.to;
  const ends_from = drawable.arrow.ends.from;

  arrowSet.add(
    new Arrow(from.x, from.y, to.x, to.y, bottom, ends_to, ends_from)
  );
  return arrowSet;
}

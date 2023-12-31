import { parse } from "./renderers/parse";
import { renderGraph } from "./renderers/cytoscape";
import { optionsDefault, layouts, examples } from "./options";
import { render3DGraph } from "./renderers/three";

import { clearElement, destroyAll } from "./renderers/common";
import { renderNLPTree } from "./renderers/syntax-tree";

let opts = {
  ...optionsDefault,
  removeIntermediateNodes: true,
  removeDeletableNodes: true,
  layout: layouts.dagreH,
  morphemes: false,
};

if (module.hot) {
  module.hot.accept();
}

async function runParse(text) {
  if (!window.loaded) return;
  destroyAll();
  clearElement("cy");
  // clearElement('navigator');

  text = text.replace(/\./g, " ").replace(/ {2,}/g, " ");
  const parseResult = await parse(text, { ...opts });
  if (opts.layout.renderer === "NLPTree")
    renderNLPTree({ options: opts, data: parseResult });
  else if (opts.layout.renderer === "three.js")
    render3DGraph({ options: opts, data: parseResult });
  else renderGraph({ options: opts, data: parseResult });
  localStorage.setItem("input", text);
  history.pushState(
    null,
    null,
    `#${jsonToQueryString({
      q: text.replace(/ /g, "_"),
      l: document.getElementById("layouter").value,
      c: document.getElementById("compactor").value,
    })}`
  );
  document.title = text ? `${text} - Visual Lojban` : `Visual Lojban`;
}

document.getElementById("input").addEventListener("keyup", (e) => {
  runParse(e.target.value);
});

Object.keys(examples).forEach((key) => {
  document.getElementById(`example${key}`).addEventListener("click", (e) => {
    document.getElementById("input").value = examples[key];
    runParse(examples[key]);
  });
});

document.getElementById("compactor").addEventListener("change", (e) => {
  compactor();
});

const layouter = document.getElementById("layouter");
Object.keys(layouts).forEach((name) => {
  const layout = layouts[name];
  const el = document.createElement("option");
  el.value = name;
  el.innerText = layout.label;
  if (layout.selected) el.selected = true;
  layouter.appendChild(el);
});

document.getElementById("layouter").addEventListener("change", (e) => {
  setLayout(e.target.value);
  runParse(document.getElementById("input").value);
});

try {
  const value = localStorage.getItem("input");
  document.getElementById("input").value = value ?? examples["2"];
} catch (error) {}

try {
  const value = localStorage.getItem("compactor");
  if (value) {
    document.getElementById("compactor").value = value;
    compactor(value);
  }
} catch (error) {}

try {
  const value = localStorage.getItem("layouter");
  if (value) {
    document.getElementById("layouter").value = value;
  }
  setLayout(value ?? "dagreH");
} catch (error) {}

function setLayout(newValue) {
  localStorage.setItem("layouter", newValue);
  opts.layout = {
    ...layouts[newValue],
    name: layouts[newValue].name ?? newValue,
  };
}

function compactor() {
  const value = document.getElementById("compactor").value;
  switch (value) {
    case "compact-all":
      opts = {
        ...optionsDefault,
        layout: opts.layout,
        removeIntermediateNodes: true,
        removeDeletableNodes: true,
        morphemes: false,
      };
      break;
    case "up-to-lexemes":
      opts = {
        ...optionsDefault,
        layout: opts.layout,
        morphemes: false,
      };
      break;
    case "up-to-morphemes":
      opts = {
        ...optionsDefault,
        layout: opts.layout,
        morphemes: true,
      };
      break;
    default:
      opts = {
        ...optionsDefault,
        layout: opts.layout,
        removeIntermediateNodes: true,
        morphemes: false,
      };
      break;
  }
  localStorage.setItem("compactor", value);
  runParse(document.getElementById("input").value);
}

function parseUrlParamsToJSON(url) {
  try {
    const urlParams = new URLSearchParams(url.split("#")[1]);
    let params = Object.fromEntries(urlParams);
    if (Object.keys(params).length === 1) {
      const val = Object.keys(params)[0];
      if (params[val] === "") params = { q: val };
    }
    return { q: "", ...params };
  } catch (error) {
    return { q: "" };
  }
}

function jsonToQueryString(json) {
  try {
    return Object.keys(json)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`
      )
      .join("&");
  } catch (error) {
    return "";
  }
}

window.loaded = false;
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loader").remove();
  document.getElementById("cy").classList.remove("d-none");
  const queryParams = parseUrlParamsToJSON(
    window.location.hash.replace(/_/g, " ")
  );
  if (queryParams.q !== "")
    document.getElementById("input").value = queryParams.q;
  if (queryParams.c) document.getElementById("compactor").value = queryParams.c;
  if (queryParams.l) document.getElementById("layouter").value = queryParams.l;
  window.loaded = true;
  runParse(document.getElementById("input").value);
});

window.addEventListener(
  "resize",
  function () {
    runParse(document.getElementById("input").value);
  },
  true
);

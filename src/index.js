import { parse } from "./parse";
import { renderGraph } from "./cy";
import { optionsDefault, optionsStress, layouts, examples } from "./options";
let opts = { ...optionsDefault };

/*
  on input change

*/
function runParse(text) {
  renderGraph({ options: opts, data: parse(text, opts) });
}

document.getElementById("input").addEventListener("keyup", (e) => {
  runParse(e.target.value);
  localStorage.setItem("input", e.target.value);
});

document.getElementById("example1").addEventListener("click", (e) => {
  document.getElementById("input").value = examples["1"];
  runParse(examples["1"]);
});
document.getElementById("example2").addEventListener("click", (e) => {
  document.getElementById("input").value = examples["2"];
  runParse(examples["2"]);
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
    case "stress":
      opts = { layout: opts.layout, ...optionsStress, morphemes: true };
      break;
    case "compact-all":
      opts = { layout: opts.layout, ...optionsDefault };
      opts.importantNodes = [];
      break;
    case "up-to-lexemes":
      opts = { layout: opts.layout, startRule: "utterance" };
      break;
    case "up-to-morphemes":
      opts = { layout: opts.layout, startRule: "utterance", morphemes: true };
      break;
    default:
      opts = { layout: opts.layout, ...optionsDefault };
      break;
  }
  localStorage.setItem("compactor", value);
  runParse(document.getElementById("input").value);
}

document.addEventListener("DOMContentLoaded", () =>
  runParse(document.getElementById("input").value)
);

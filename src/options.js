import pics from "../assets/parsed-xraste.json";

export const regexpCompressPointyRules = RegExp(/^([a-z])$/);

export const optionsDefault = {
  pics,
  removeIntermediateNodes: false,
  startRule: "text",
  importantNodes: [
    "text",
    "paragraphs",
    "paragraph",
    "statement",
    "statement",
    "fragment",
    "prenex",
    "sentence",
    "bridi_tail",
    "tail_terms",
    "terms",
    "term",
    "sumti",
    "relative_clauses",
    "relative_clause",
    "selbri",
    "tanru_unit",
    "quantifier",
    "mex",
    "operator",
    "operand",
    "tag",
    "vocative",
    "indicators",
    "indicator",
    "BRIVLA",
  ],
  pictureRules: ["BRIVLA_pre"],
  hyperedgeRules: ["spaces","gismu","fuhivla","CMEVLA","brivla"],
};

export const optionsStress = {
  removeIntermediateNodes: true,
  startRule: "text",
  importantNodes: ["DefaultStressedSyllable", "VowelFinal"],
  lowNodes: ["DefaultStressedSyllable", "VowelFinal", "Syllable"],
};

export const layouts = {
  dagreH: {
    label: "Dagre Horizontal",
    name: "dagre",
    rankDir: "LR",
    selected: true,
  },
  dagreV: {
    label: "Dagre Vertical",
    name: "dagre",
  },
  NLPTree: {
    label: "Linguistic tree",
    renderer: "NLPTree",
    name: "NLPTree",
    config: {
      alignBottom: false,
    },
  },
  NLPTreeB: {
    label: "Linguistic tree (bottom-aligned)",
    renderer: "NLPTree",
    name: "NLPTree",
    config: {
      alignBottom: true,
    },
  },
  three: {
    label: "3D Normal",
    renderer: "three.js",
    config: {
      dagMode: undefined,
      dagLevelDistance: 60,
    },
  },
  threeLR: {
    label: "3D Horizontal",
    renderer: "three.js",
    config: {
      dagMode: "lr",
      dagLevelDistance: 60,
    },
  },
  threeTD: {
    label: "3D Vertical",
    renderer: "three.js",
    config: {
      dagMode: "td",
      dagLevelDistance: 60,
      _3D: true,
    },
  },
  klayH: {
    name: "klay",
    label: "Klay Horizontal",
    padding: 4,
    nodeDimensionsIncludeLabels: true,
    klay: {
      direction: "RIGHT",
      spacing: 40,
      mergeEdges: false,
      nodeLayering: "NETWORK_SIMPLEX",
    },
  },
  klayV: {
    name: "klay",
    label: "Klay Vertical",
    padding: 4,
    nodeDimensionsIncludeLabels: true,
    klay: {
      direction: "DOWN",
      spacing: 40,
      mergeEdges: false,
      nodeLayering: "NETWORK_SIMPLEX",
      nodePlacement: "LINEAR_SEGMENTS",
    },
  },
  grid: {
    label: "Grid",
  },
  concentric: {
    label: "Concentric",
  },
  breadthfirst: {
    label: "Breadth-first",
    circle: false,
  },
  // cola: {
  //   label: "Cola",
  //   maxSimulationTime: 40000,
  // },
  cise: {
    label: "Cise",
  },
  cose: {
    label: "Cose",
  },
};
["box", "force", "layered", "mrtree", "stress"].forEach((elkAlgo) => {
  layouts[`elk_${elkAlgo}`] = {
    label: `ELK ${elkAlgo.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}`,
    name: "elk",
    padding: 20,
    spacingFactor: 1.1,
    elk: {
      algorithm: elkAlgo,
      // 'elk.direction': 'RIGHT',
    },
  };
});

export const examples = {
  1: "ko pinxe fi ti sei mi xalbo .i ti botpi",
  2: "mi tavla do",
};

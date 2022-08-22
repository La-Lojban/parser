export const optionsDefault = {
  removeIntermediateNodes: true,
  startRule: "utterance",
  importantNodes: [
    "juelink",
    "jelink",
    "links",
    "predunit",
    "descpred",
    "sentpred",
    "modifier",
    "label",
    "voc",
    "argmod",
    "argument",
    "argumentA",
    "argumentB",
    "argumentC",
    "argumentD",
    "argumentE",
    "barepred",
    "predicate",
    "statement",
    "sentence",
    "freemod",
    "uttC",
    "uttF",
  ],
};

export const optionsStress = {
  removeIntermediateNodes: true,
  startRule: "utterance",
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
  grid: {
    label: "Grid",
  },
  circle: {
    label: "Circle",
  },
  breadthfirst: {
    label: "Breadth-first",
  },
  klay: {
    label: "Klay",
    padding: 4,
    nodeDimensionsIncludeLabels: true,
    klay: {
      spacing: 40,
      mergeEdges: false,
    },
  },
  fcose: {
    label: "FCose",
  },
  cose: {
    label: "Cose",
  },

  cola: {
    label: "Cola",
    maxSimulationTime: 40000,
  },
  random: {
    label: "Random",
  },
};
["box", "disco", "force", "layered", "mrtree", "random", "stress"].forEach(
  (elkAlgo) => {
    layouts[`elk_${elkAlgo}`] = {
      label: `ELK ${elkAlgo.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}`,
      name: "elk",
      elk: {
        algorithm: elkAlgo,
      },
    };
  }
);

export const examples = {
  1: "kamla mi soi crano, i ti limhone",
  2: "mi cluva tu",
};

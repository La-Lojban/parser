// import * as THREE from "three";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer";
import ForceGraph3D from "3d-force-graph";
import "d3-octree";
import "d3-force-3d";
import * as d3 from "d3";

import { getState, setState } from "./common";
export const generate = {
  node: (node) => {
    return {
      group: "nodes",
      id: node.id,
      rule: node.rule,
      text: node.text,
    };
  },
  hyperedge: () => {
    return null;
  },
  edge: (edge) => {
    return {
      source: edge.source,
      target: edge.target,
    };
  },
};

export function render3DGraph({ data, options }) {
  const { config } = options.layout;
  const cy = document.getElementById("cy");

  const graphObj = getState("three");
  if (graphObj) {
    graphObj.delete(graphObj.graph);
  }

  // graph config
  const NODE_REL_SIZE = 10;
  const graph = ForceGraph3D({
    extraRenderers: [new CSS2DRenderer(), new CSS3DRenderer()],
  })
    .height(window.innerHeight - cy.offsetTop)
    .dagMode(config.dagMode)
    .dagLevelDistance(config.dagLevelDistance)
    // .backgroundColor("#101020")
    .linkColor(() => "rgba(255,255,255,1)")
    .linkWidth(1)
    .nodeRelSize(NODE_REL_SIZE)
    // .nodeId("id")
    // .nodeVal("rule")
    // .nodeLabel("text")
    .nodeAutoColorBy("rule")
    // .nodeOpacity(0.9)
    .linkDirectionalParticles(2)
    .linkDirectionalParticleWidth(1)
    .linkDirectionalParticleSpeed(0.006)
    .d3Force(
      "collision",
      d3.forceCollide((node) => Math.cbrt(node.size) * NODE_REL_SIZE)
    )
    .d3VelocityDecay(0.3);
  // Decrease repel intensity
  graph.d3Force("charge").strength(-25);

  const gData = {
    nodes: data.filter((_) => typeof _.id !== "undefined"),
    links: data.filter((_) => typeof _.source !== "undefined"),
  };
  graph(cy)
    .graphData(gData)
    .nodeThreeObject((node) => {
      const nodeEl = document.createElement("div");
      nodeEl.innerHTML = `
      <div class="center">
      <div class="rule">${node.rule}</div>
      <div style="color:${node.color};" class="italic">${node.text}</div>
      </div>
      `;
      nodeEl.className = "node-label";
      return config._3D ? new CSS3DObject(nodeEl) : new CSS2DObject(nodeEl);
    })
    .nodeThreeObjectExtend(true);
  setState("three", {
    graph,
    delete: () => null,
  });
}

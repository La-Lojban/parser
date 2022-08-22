import "./styles.css";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import klay from "cytoscape-klay";
import fcose from "cytoscape-fcose";
import cola from "cytoscape-cola";
import elk from "cytoscape-elk";

// import "cytoscape-context-menus/cytoscape-context-menus.css";
// import "cytoscape-navigator/cytoscape.js-navigator.css";

const nodeHtmlLabel = require("cytoscape-node-html-label");
// var expandCollapse = require("cytoscape-expand-collapse");
// var contextMenus = require("cytoscape-context-menus");
// var navigator = require("cytoscape-navigator");

function getWidth(node) {
  /**
  Calculate the width of a node given its text label `node.data('lbl')`
  */

  // Create element with attributes needed to calculate text size
  const ctx = document.createElement('canvas').getContext("2d");
  const fStyle = node.pstyle('font-style').strValue;
  const size = node.pstyle('font-size').pfValue + 'px';
  const family = node.pstyle('font-family').strValue;
  const weight = node.pstyle('font-weight').strValue;
  ctx.font = fStyle + ' ' + weight + ' ' + size + ' ' + family;

  // For multiple lines, evaluate the width of the largest line
  const lines = [node.data('rule'), node.data('text')];
  const lengths = lines.map(a => a.length);
  const max_line = lengths.indexOf(Math.max(...lengths));

  // User-defined padding
  const padding = 0

  return ctx.measureText(lines[max_line]).width + padding;
}

export function renderGraph({ data, options }) {
  if (!options.layout) return;
  const $vm = {
    collapseArrs: {},
  };

  cytoscape.use(dagre);
  cytoscape.use(klay);
  cytoscape.use(fcose);
  cytoscape.use(cola);
  cytoscape.use(elk);

  // if (typeof cytoscape("core", "expandCollapse") === "undefined") {
  //   expandCollapse(cytoscape);
  // }

  if (typeof cytoscape("core", "nodeHtmlLabel") !== "function") {
    nodeHtmlLabel(cytoscape);
  }
  // if (typeof cytoscape("core", "contextMenus") === "undefined") {
  //   contextMenus(cytoscape);
  // }
  // if (typeof cytoscape("core", "navigator") === "undefined") {
  //   navigator(cytoscape);
  // }

  /*
  on input change

*/

  const cy = cytoscape({
    container: document.getElementById("cy"),

    boxSelectionEnabled: false,
    autounselectify: true,
    wheelSensitivity: 0.2,

    // ready: function () {
    //   // var instance = this.contextMenus(options);

    //   // var api = this.expandCollapse({
    //   //   layoutBy: {
    //   //     name: layout,
    //   //     animate: "end",
    //   //     randomize: false,
    //   //     fit: false,
    //   //   },
    //   //   fisheye: false,
    //   //   animate: true,
    //   //   undoable: false,
    //   //   cueEnabled: true,
    //   //   expandCollapseCuePosition: "top-left",
    //   //   expandCollapseCueSize: 16,
    //   //   expandCollapseCueLineSize: 24,
    //   //   expandCueImage: "./imgs/ic_expand_more.svg",
    //   //   collapseCueImage: "./imgs/ic_expand_less.svg",
    //   //   expandCollapseCueSensitivity: 1,
    //   //   edgeTypeInfo: "edgeType",
    //   //   groupEdgesOfSameTypeOnCollapse: false,
    //   //   allowNestedEdgeCollapse: true,
    //   //   zIndex: 999,
    //   // });
    // },

    style: [
      {
        selector: "node",
        style: {
          // content: "data(id)",
          // "text-opacity": 0.5,
          // "text-valign": "center",
          // "text-halign": "right",
          "background-color": "white",
          // color: "white",
          // "font-size": 12,
          // "font-weight": 700,
          // "font-family": "FontAwesome, Noto Sans TC, Montserrat, sans-serif",
          // "border-width": 2,
          // "border-color": "#505050",
          // "text-wrap": "wrap",
          height: 82,
          width: getWidth,
          // width: "displayName",
          shape: "roundrectangle",
          // padding: "50%",
          // "padding-relative-to": "width",
          // ghost: "yes",
          // "ghost-offset-x": 1,
          // "ghost-offset-y": 1,
          // "ghost-opacity": 0.4,
        },
      },

      {
        selector: "edge",
        style: {
          "curve-style": "bezier",
          width: 4,
          // "target-arrow-shape": "triangle",
          "line-color": "#CECECE",
          "target-arrow-color": "#CECECE",
        },
      },
    ],
    layout: {...options.layout, animate: true},

    elements: data,

    // zoomingEnabled: true,
    // userZoomingEnabled: true,
    // autoungrabify: false,
  });

  // cy.fit();
  //NODE EVENTS
  // cy.on("mouseover", "node", function (e) {
  //   e.target.addClass("hover");
  // });
  // cy.on("mouseout", "node", function (e) {
  //   e.target.removeClass("hover");
  // });

  // cy.on("mousedown", "node", function (e) {
  //   e.target.addClass("hover");
  // });
  // cy.on("click", "node", function (e) {
  //   console.log("clicked:" + this.id());
  // });

  // //EDGES EVENTS
  // cy.on("mouseover", "edge", function (e) {
  //   e.target.addClass("hover");
  // });
  // cy.on("mouseout", "edge", function (e) {
  //   e.target.removeClass("hover");
  // });

  cy.on("tap", "node", function () {
    let connectedEdges = this.connectedEdges().targets();
    let successors = this.successors().targets();
    let collapseCnt = 0;
    let childList = [];

    if (this.data().collapse) {
      //delete child from collapseArrs
      delete $vm.collapseArrs[this.data().id];

      successors.forEach((el, idx) => {
        let isExist = false;
        for (let parentID in $vm.collapseArrs) {
          if ($vm.collapseArrs[parentID].includes(successors[idx].data().id)) {
            isExist = true;
            break;
          }
        }

        if (!isExist) {
          //show the nodes and edges
          successors[idx].data().display = 1;
          successors[idx].style("display", "element");
        }

        if (!$vm.collapseArrs[successors[idx].data().id]) {
          successors[idx].data().collapse = 0;
        }

        collapseCnt += 1;
      });
    } else {
      //hide the children nodes and edges recursively
      successors.style("display", "none");
      successors.forEach((el, idx) => {
        successors[idx].data().display = 0;
        collapseCnt += 1;
        childList.push(successors[idx].data().id);
      });
    }

    if (collapseCnt > 0) {
      this.data().collapse = this.data().collapse ? 0 : 1;
    }

    if (childList.length > 0) {
      $vm.collapseArrs[this.data().id] = childList;
    }
  });

  cy.nodeHtmlLabel([
    {
      query: "node[display=1]",
      // cssClass: "cyNode",
      valign: "center",
      // halign: "left",
      valignBox: "center",
      // halignBox: "left",
      tpl: (data) => {
        return `<div class="cyNode" style="background-color: ${data.color}">
        <div class="nodeTitle trim">${data.rule}</div>
        <span class="${data.text ? "nodeValue trim" : ''}" value="${data.text}">
          ${data.text ?? ""}
        </span>
        <div class="goggleBtn" collapse="${data.collapse}">+</div>
      </div>
      `;
      },
    },
    // {
    //   query: ".groupIcon",
    //   halign: "center",
    //   valign: "center",
    //   halignBox: "center",
    //   valignBox: "center",
    //   tpl: function (data) {
    //     return `<div class="group ${data.collapsedChildren ? "show" : "hide"}">
    //             <span class="group-graphic alarmSeverity-${data.alarmSeverity}">
    //               <i class="icon icon-group"></i>
    //               <span class="overlay"></span>
    //             </span>
    //             <span class="group-label">${data.displayName}</span>
    //           </div>`;
    //   },
    // },
    // {
    //   query: ".groupIcon.hover",
    //   halign: "center",
    //   valign: "center",
    //   halignBox: "center",
    //   valignBox: "center",
    //   tpl: function (data) {
    //     return `<div class="group ${data.collapsedChildren ? "show" : "hide"}">
    //             <span class="group-graphic hover alarmSeverity-${
    //               data.alarmSeverity
    //             }">
    //               <i class="icon icon-group"></i>
    //               <span class="overlay"></span>
    //             </span>
    //             <span class="group-label">${data.displayName}</span>
    //           </div>`;
    //   },
    // },
    // {
    //   query: ".groupIcon:selected",
    //   halign: "center",
    //   valign: "center",
    //   halignBox: "center",
    //   valignBox: "center",
    //   tpl: function (data) {
    //     return `<div class="group ${data.collapsedChildren ? "show" : "hide"}">
    //             <span class="group-graphic selected alarmSeverity-${
    //               data.alarmSeverity
    //             }">
    //               <i class="icon icon-group"></i>
    //               <span class="overlay"></span>
    //             </span>
    //             <span class="group-label">${data.displayName}</span>
    //           </div>`;
    //   },
    // },
    // {
    //   query: ".groupIcon.hover:selected",
    //   halign: "center",
    //   valign: "center",
    //   halignBox: "center",
    //   valignBox: "center",
    //   tpl: function (data) {
    //     return `<div class="group ${data.collapsedChildren ? "show" : "hide"}">
    //             <span class="group-graphic hover selected alarmSeverity-${
    //               data.alarmSeverity
    //             }">
    //               <i class="icon icon-group"></i>
    //               <span class="overlay"></span>
    //             </span>
    //             <span class="group-label">${data.displayName}</span>
    //           </div>`;
    //   },
    // },
    // {
    //   query: ".nodeIcon",
    //   halign: "center",
    //   valign: "top",
    //   halignBox: "center",
    //   valignBox: "top",
    //   tpl: function (data) {
    //     return `<div class="element ${data._hidden}">
    //             <div class="element-graphic operationalState-${data.operationalState}">
    //             <span class="element-pm_badge">
    //               <i class="icon icon-pm" /></i>
    //               <span>${data.rule}</span>
    //             </span>
    //             <span class="element-pm_badge2">
    //               <i class="icon icon-pm" /></i>
    //               <span>${data.text}</span>
    //             </span>
    //             </div>
    //           </div>`;
    //   },
    // },
    // {
    //   query: ".nodeIcon.hover",
    //   halign: "center",
    //   valign: "center",
    //   halignBox: "center",
    //   valignBox: "center",
    //   tpl: function (data) {
    //     return `<div class="element ${data._hidden}">
    //             <span class="element-severity_badge">
    //               <i class="icon icon-${data.alarmSeverity}" /></i>
    //             </span>
    //             <span class="element-pm_badge">
    //               <i class="icon icon-pm" /></i>
    //               <span>PM</span>
    //             </span>
    //             <span class="element-graphic hover operationalState-${data.operationalState}">
    //               <i class="icon icon-${data.kind} icon-hover" /></i>
    //               <span class="overlay"></span>
    //             </span>
    //             <span title="${data.displayName}" class="element-label">${data.displayName}</span>
    //           </div>`;
    //   },
    // },
    // {
    //   query: ".nodeIcon:selected",
    //   halign: "center",
    //   valign: "center",
    //   halignBox: "center",
    //   valignBox: "center",
    //   tpl: function (data) {
    //     return `<div class="element ${data._hidden}">
    //             <span class="element-severity_badge">
    //               <i class="icon icon-${data.alarmSeverity}" /></i>
    //             </span>
    //             <span class="element-pm_badge">
    //               <i class="icon icon-pm" /></i>
    //               <span>PM</span>
    //             </span>
    //             <span class="element-graphic selected operationalState-${data.operationalState}">
    //               <i class="icon icon-${data.kind}" /></i>
    //               <span class="overlay"></span>
    //             </span>
    //             <span title="${data.displayName}" class="element-label">${data.displayName}</span>
    //           </div>`;
    //   },
    // },
    // {
    //   query: ".nodeIcon.hover:selected",
    //   halign: "center",
    //   valign: "center",
    //   halignBox: "center",
    //   valignBox: "center",
    //   tpl: function (data) {
    //     return `<div class="element ${data._hidden}">
    //             <span class="element-severity_badge">
    //               <i class="icon icon-${data.alarmSeverity}" /></i>
    //             </span>
    //             <span class="element-pm_badge">
    //               <i class="icon icon-pm" /></i>
    //               <span>PM</span>
    //             </span>
    //             <span class="element-graphic hover selected operationalState-${data.operationalState}">
    //               <i class="icon icon-${data.kind}" /></i>
    //               <span class="overlay"></span>
    //             </span>
    //             <span title="${data.displayName}" class="element-label">${data.displayName}</span>
    //           </div>`;
    //   },
    // },
  ]);

  // cy.nodes().on("expandcollapse.beforecollapse", function (e) {
  //   console.log("Triggered before a node is collapsed");
  // });

  // cy.nodes().on("expandcollapse.aftercollapse", function (e) {
  //   console.log("Triggered after a node is collapsed");
  // });

  // cy.nodes().on("expandcollapse.beforeexpand", function (e) {
  //   console.log("Triggered before a node is expanded");
  // });

  // cy.nodes().on("expandcollapse.afterexpand", function (e) {
  //   console.log("Triggered after a node is expanded");
  // });

  // cy.edges().on("expandcollapse.beforecollapseedge", function (e) {
  //   console.log("Triggered before an edge is collapsed");
  // });

  // cy.edges().on("expandcollapse.aftercollapseedge", function (e) {
  //   console.log("Triggered after an edge is collapsed");
  // });

  // cy.edges().on("expandcollapse.beforeexpandedge", function (e) {
  //   console.log("Triggered before an edge is expanded");
  // });

  // cy.edges().on("expandcollapse.afterexpandedge", function (e) {
  //   console.log("Triggered after an edge is expanded");
  // });

  // cy.nodes().on("expandcollapse.beforecollapse", function (event) {
  //   var node = this;
  //   event.cy
  //     .nodes()
  //     .filter((entry) => entry.data().parent === node.id())
  //     .map((entry) => entry.data("_hidden", "node-hidden"));
  //   node.data("_hidden", "");
  // });

  // cy.nodes().on("expandcollapse.afterexpand", function (event) {
  //   var node = this;
  //   event.cy
  //     .nodes()
  //     .filter((entry) => entry.data().parent === node.id())
  //     .map((entry) => entry.data("_hidden", ""));
  //   node.data("_hidden", "node-hidden");
  // });

  const defaults = {
    container: false, // html dom element
    viewLiveFramerate: 0, // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
    thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
    thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
    dblClickDelay: 200, // milliseconds
    removeCustomContainer: false, // destroy the container specified by user on plugin destroy
    rerenderDelay: 100, // ms to throttle rerender updates to the panzoom for performance
  };

  // const nav = cy.navigator(defaults);
}

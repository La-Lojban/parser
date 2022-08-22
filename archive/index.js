import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import "cytoscape-context-menus/cytoscape-context-menus.css";
import "cytoscape-navigator/cytoscape.js-navigator.css";
import data from "./data2";

var nodeHtmlLabel = require("cytoscape-node-html-label");
var expandCollapse = require("cytoscape-expand-collapse");
var contextMenus = require("cytoscape-context-menus");
var navigator = require("cytoscape-navigator");

cytoscape.use(dagre);
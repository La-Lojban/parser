import * as Comlink from 'comlink';
import { parse as pegParse } from "./camxes";
Comlink.expose(pegParse);

/* /js/boot/init.js */

import { CoreEngine } from "/js/core/CoreEngine.js";
import { HGEngine } from "/js/historygo/HGEngine.js";

export function initAppEngines() {
  CoreEngine.init();
  HGEngine.init();
}

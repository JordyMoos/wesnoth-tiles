// Worker. Meant to be run on another thread.

module WesnothTiles.Worker {
  'use strict';

  var hexMap: HexMap;

  export class Worker {
    constructor() {
      onmessage = (oEvent: MessageEvent) => {
          var order: Internal.IWorkerOrder = oEvent.data;

          var func = this[order.func];          
          var result = func(order.data); 
          var response: Internal.IWorkerResponse = {
            id: order.id,
            data: result,           
          }

          postMessage(response);
      }
    }

    testCall = (jeb: number) => {
      jeb += 25;
      return jeb;
    }

    setTiles = (tileChanges: Internal.ITileChange[]) => {
      tileChanges.forEach(change => {
          hexMap.setTerrain(change.q, change.r, change.terrain, change.overlay, change.fog);
      });

    }

    init = (definitions: string[]) => {
      definitions.forEach(spriteName => spriteNames.add(spriteName));
      hexMap = new HexMap();
    }

    rebuild = () => {
      console.log("Rebuilding in worker");
      hexMap.unsetLoadingMode();
      var drawables = rebuild(hexMap);
      drawables.sort(sortFunc);
      console.log("Rebuild done!", drawables);
    }

  }

  var sortFunc = (a: Drawable, b: Drawable) => {
      if (a.layer === b.layer) {
        if (a.base !== undefined && b.base !== undefined) {
          return a.base.y - b.base.y;
        }
        if (b.base !== undefined) {
          return a.layer < 0 ? -1 : 1;
        } else if (a.base !== undefined) {
          return b.layer < 0 ? 1 : -1;
        }
        return 0;
      }
      return a.layer - b.layer;
    };

}

var worker = new WesnothTiles.Worker.Worker();


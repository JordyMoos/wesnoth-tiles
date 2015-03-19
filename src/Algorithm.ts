// Drawing algoritm. Pretty complicated, although much simplified compared to Wesnoth (which is much more powerful).

module WesnothTiles {
  'use strict';

  interface Flags extends Map<string,  Map<string, boolean>> {};

  // export interface IDrawable {
  //   q: number;
  //   r: number;

  //   // sprites: ISprite[];
  //   // flags: Map<string, boolean>;
  //   name: string;
  // };


  // export interface ISprite {
  //   animation: Resources.IAnimationDef;
  //   frame: number;
  //   layer: number;
  // }

  // export interface Macro {
  //   execute: (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number) => void;
  // }

  // var TerrainMacro = () => {

  // }


  interface WMLImage {
    name: string;
    layer: number;
  }

  interface WMLTile {
    set_flag: string[];
    has_flag: string[];
    no_flag: string[];
    set_no_flag: string[];

    q: number;
    r: number;
    type: Map<ETerrain, boolean>;

    image?: WMLImage;

    anchor?: number;
  }

  interface WMLTerrainGraphics {
    tiles: WMLTile[];
    set_flag: string[];
    has_flag: string[];
    no_flag: string[];
    set_no_flag: string[];

    probability?: number;

    rotations?: string[];
  }

  interface IDrawParams {
    hex: Hex;
    hexMap: HexMap;
    flags: Flags;
    drawables: IDrawable[];
  }

  interface PLFB {
    prob?: number;
    layer?: number;
    flag?: string;
    builder?: string;
  }

  interface LFB {
    layer?: number;
    flag?: string;
    builder?: string;
  }

  var GENERIC_SINGLE_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: any, imageStem: string, plfb: PLFB) => {
    var img: WMLImage = {
      name: imageStem,
      layer: plfb.layer,      
    }

    var tile: WMLTile = {
      q: 0,
      r: 0,
      type: terrainList,
      image: img,
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: []
    }
    if (plfb.flag !== undefined)
      tile.set_no_flag.push(plfb.flag);

    var terrainGraphic: WMLTerrainGraphics = {
      tiles: [
        tile
      ],
      set_flag: [],
      has_flag: [],
      no_flag: [],
      set_no_flag: [],
      probability: plfb.prob
    }
    terrainGraphics.push(terrainGraphic);
  }

  var TERRAIN_BASE_PLFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: any, imageStem: string, plfb: PLFB) => {
    if (plfb.prob === undefined)
      plfb.prob = 100;
    if (plfb.layer === undefined)
      plfb.layer = -1000;
    if (plfb.flag === undefined)
      plfb.flag = "base";
    console.log(Resources.definitions.has(imageStem));
    GENERIC_SINGLE_PLFB(terrainGraphics, terrainList, imageStem, plfb);
  }

  var GENERIC_SINGLE_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: any, imageStem: string, lfb: LFB) => {    
    GENERIC_SINGLE_PLFB(terrainGraphics, terrainList, imageStem + "@V", {
      prob: 100,
      layer: lfb.layer,
      flag: lfb.flag,
      builder: lfb.builder
    });
  }

  var TERRAIN_BASE_RANDOM_LFB = (terrainGraphics: WMLTerrainGraphics[], terrainList: any, imageStem: string, lfb: LFB) => {
    if (lfb.layer === undefined)
      lfb.layer = -1000;
    if (lfb.flag === undefined)
      lfb.flag = "base";
    GENERIC_SINGLE_RANDOM_LFB(terrainGraphics, terrainList, imageStem, lfb);
  }

  var getTerrainMap = (terrains: ETerrain[]) => {
    var terrainList = new Map<ETerrain, boolean>();
    terrains.forEach(terrain => {
      terrainList.set(terrain, true);
    });
    return terrainList;
  }

  // export class TerrainMacro implements Macro {
  //   constructor(private terrain: ETerrain, private base: string) {

  //   }
  //   execute (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number): void {
  //     if (this.terrain !== hexMap.getHexP(q, r).terrain)
  //       return;
  //     var htd = ensureGet(imagesMap, q, r);
  //     var hr = Resources.hexResources.get(this.base);

  //     var animation = hr.variations[Math.abs((q + r) * (q)) % hr.variations.length];
  //     // console.log("Drawing", Math.abs((q + r) * (q)) % hr.bases.length);
  //     htd.sprites.push({
  //       animation: animation,
  //       layer: -1000,
  //       frame: 0
  //     });
  //   }
  // }

  // export class TransitionMacro implements Macro {
  //   private toMap: Map<string, boolean> = new Map<string, boolean>();
  //   constructor(private terrain: ETerrain, 
  //     private base: string, 
  //     private layer: number, 
  //     private double: boolean, 
  //     to: ETerrain[], 
  //     private reverse: boolean) {

  //     to.forEach((t: ETerrain) => {
  //       this.toMap.set(t.toString(), true);
  //     })
  //   }
  //   execute (hexMap: HexMap, imagesMap: Map<string, HexToDraw>, q: number, r: number): void {
  //     var h = hexMap.getHexP(q, r);
  //     if ((this.toMap.has(h.terrain.toString()) && this.reverse)
  //       || (!this.toMap.has(h.terrain.toString()) && !this.reverse))
  //       return;

  //     var hexFrom = ensureGet(imagesMap, q, r);
  //     iterateTransitions((rotations: Rotation[], app: string) => {
  //       var hr = Resources.hexResources.get(this.base + "-" + app);
  //       if (hr.variations.length === 0)
  //         return;
  //       for (var i = 0; i < rotations.length; i++) {
  //         var rot = rotations[i];
  //         var hex = hexMap.getHexP(q + rot.q, r + rot.r);
  //         if (!hex 
  //           || hex.terrain !== this.terrain
  //           || hexFrom.flags.has(rot.app))
  //           return;
  //         var htd = ensureGet(imagesMap, q + rot.q, r + rot.r);
  //         if (htd.flags.has(rot.opp) && !this.double) 
  //           return;          
  //       }

  //       for (var i = 0; i < rotations.length; i++) {
  //         hexFrom.flags.set(rot.app, true);
  //         var rot = rotations[i];
  //         if (!this.double) {
  //           var htd = ensureGet(imagesMap, q + rot.q, r + rot.r);
  //           htd.flags.set(rot.opp, true);
  //         }

  //       }


  //       var animation = hr.variations[Math.abs((q + r) * (q)) % hr.variations.length];
  //     // console.log("Drawing", Math.abs((q + r) * (q)) % hr.bases.length);
  //       hexFrom.sprites.push({
  //         animation: animation,
  //         layer: this.layer,
  //         frame: 0
  //       });
  //     });
  //   }
  // }

  // var macros: Macro[] = [];
  // macros.push(new TerrainMacro(ETerrain.HILLS_SNOW, "hills/snow"));
  // macros.push(new TerrainMacro(ETerrain.HILLS_REGULAR, "hills/regular"));
  // macros.push(new TerrainMacro(ETerrain.HILLS_DRY, "hills/dry"));
  // macros.push(new TerrainMacro(ETerrain.HILLS_DESERT, "hills/desert"));

  // macros.push(new TerrainMacro(ETerrain.GRASS_GREEN, "grass/green"));
  // macros.push(new TerrainMacro(ETerrain.GRASS_DRY, "grass/dry"));
  // macros.push(new TerrainMacro(ETerrain.GRASS_LEAF_LITTER, "grass/leaf-litter"));
  // macros.push(new TerrainMacro(ETerrain.GRASS_SEMI_DRY, "grass/semi-dry"));

  // macros.push(new TerrainMacro(ETerrain.SWAMP_MUD, "swamp/mud"));
  // macros.push(new TerrainMacro(ETerrain.SWAMP_WATER, "swamp/water"));

  // macros.push(new TerrainMacro(ETerrain.WATER_COAST_TROPICAL, "water/coast-tropical"));
  // macros.push(new TerrainMacro(ETerrain.WATER_OCEAN, "water/ocean"));

  // macros.push(new TransitionMacro(ETerrain.HILLS_SNOW, "hills/snow-to-hills", -170, false, [ETerrain.HILLS_DESERT, ETerrain.HILLS_DRY, ETerrain.HILLS_REGULAR], false));
  // macros.push(new TransitionMacro(ETerrain.HILLS_SNOW, "hills/snow-to-water", -171, false, [ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL], false));

  // macros.push(new TransitionMacro(ETerrain.HILLS_SNOW, "hills/snow", -172, false, [ETerrain.HILLS_SNOW], true));
  // macros.push(new TransitionMacro(ETerrain.HILLS_REGULAR, "hills/regular", -180, false, [ETerrain.HILLS_REGULAR, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL], true));
  // macros.push(new TransitionMacro(ETerrain.HILLS_DRY, "hills/dry", -183, false, [ETerrain.HILLS_DRY, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL], true));
  // macros.push(new TransitionMacro(ETerrain.HILLS_DESERT, "hills/desert", -184, false, [ETerrain.HILLS_DESERT, ETerrain.WATER_OCEAN, ETerrain.WATER_COAST_TROPICAL], true));

  // macros.push(new TransitionMacro(ETerrain.SWAMP_WATER, "swamp/water", -230, false, [ETerrain.SWAMP_WATER], true));

  // macros.push(new TransitionMacro(ETerrain.GRASS_DRY, "grass/dry-long", -250, true, [ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_LEAF_LITTER], false));
  // macros.push(new TransitionMacro(ETerrain.GRASS_GREEN, "grass/green-long", -251, true, [ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER], false));
  // macros.push(new TransitionMacro(ETerrain.GRASS_SEMI_DRY, "grass/semi-dry-long", -252, true, [ETerrain.GRASS_GREEN, ETerrain.GRASS_DRY, ETerrain.GRASS_LEAF_LITTER], false));
  // macros.push(new TransitionMacro(ETerrain.GRASS_LEAF_LITTER, "grass/leaf-litter-long", -253, true, [ETerrain.GRASS_GREEN, ETerrain.GRASS_SEMI_DRY, ETerrain.GRASS_DRY], false));

  // macros.push(new TransitionMacro(ETerrain.GRASS_DRY, "grass/dry-abrupt", -273, false, [ETerrain.GRASS_DRY], true));
  // macros.push(new TransitionMacro(ETerrain.GRASS_GREEN, "grass/green-abrupt", -271, false, [ETerrain.GRASS_GREEN], true));
  // macros.push(new TransitionMacro(ETerrain.GRASS_SEMI_DRY, "grass/semi-dry-abrupt", -272, false, [ETerrain.GRASS_SEMI_DRY], true));
  // macros.push(new TransitionMacro(ETerrain.GRASS_LEAF_LITTER, "grass/leaf-litter", -270, false, [ETerrain.GRASS_LEAF_LITTER], true));

  // macros.push(new TransitionMacro(ETerrain.WATER_OCEAN, "flat/bank", -300, false, [ETerrain.GRASS_LEAF_LITTER], false));
  // macros.push(new TransitionMacro(ETerrain.WATER_COAST_TROPICAL, "flat/bank", -300, false, [ETerrain.GRASS_LEAF_LITTER], false));

  // macros.push(new TransitionMacro(ETerrain.SWAMP_MUD, "swamp/mud-to-land", -310, false, [ETerrain.SWAMP_MUD], true));

  // macros.push(new TransitionMacro(ETerrain.HILLS_REGULAR, "hills/regular-to-water", -482, false, [ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN], false));
  // macros.push(new TransitionMacro(ETerrain.HILLS_DRY, "hills/dry-to-water", -482, false, [ETerrain.WATER_COAST_TROPICAL, ETerrain.WATER_OCEAN], false));

  // macros.push(new TransitionMacro(ETerrain.WATER_OCEAN, "water/ocean-blend", -550, true, [ETerrain.WATER_COAST_TROPICAL], false));
  // macros.push(new TransitionMacro(ETerrain.WATER_COAST_TROPICAL, "water/coast-tropical-long", -553, true, [ETerrain.WATER_OCEAN], false));

  var setFlags = (hexPos: HexPos,
    set_flags: string[], set_flags_tg: string[],
    set_no_flags: string[], set_no_flags_tg: string[], flags: Flags) => {

    var hexFlags = flags.get(hexPos.toString());
    // If we do not have any flags here, we need to create them.
    if (hexFlags === undefined) {
      hexFlags = new Map<string, boolean>();
      flags.set(hexPos.toString(), hexFlags);
    }

    set_no_flags.forEach(flag => {
      hexFlags.set(flag, true);
    });
    set_no_flags_tg.forEach(flag => {
      hexFlags.set(flag, true);
    });

    set_flags.forEach(flag => {
      hexFlags.set(flag, true);
    });
    set_flags_tg.forEach(flag => {
      hexFlags.set(flag, true);
    });
  }

  var checkFlags = (hexPos: HexPos, 
    has_flags: string[], has_flags_tg: string[],
    no_flags: string[], no_flags_tg: string[],
    set_no_flags: string[], set_no_flags_tg: string[],
    flags: Flags) => {

    var hexFlags = flags.get(hexPos.toString());
    // If we do not have any flags here, quit.
    if (hexFlags === undefined) {
      if (has_flags.length > 0 || has_flags_tg.length > 0)
        return false;
      return true;
    }
    // 1st. Check if all needed has_flags are in place
    var ok = true;
    has_flags.forEach(flag => {
      if (!hexFlags.has(flag)) ok = false;
    });
    has_flags_tg.forEach(flag => {
      if (!hexFlags.has(flag)) ok = false;
    });
    if (!ok)
      return false;

    // 3rd. Check if all needed no_flags are in place
    no_flags.forEach(flag => {
      if (hexFlags.has(flag)) ok = false;
    });
    no_flags_tg.forEach(flag => {
      if (hexFlags.has(flag)) ok = false;
    });
    if (!ok)
      return false;

    // 4rd. Check if all needed set_no_flags are in place      
    set_no_flags.forEach(flag => {
      if (hexFlags.has(flag)) ok = false;
    });
    set_no_flags_tg.forEach(flag => {
      if (hexFlags.has(flag)) ok = false;
    });
    return ok;    
  }

  var performTerrainGraphics = (tg: WMLTerrainGraphics, dp: IDrawParams) => {
    var chance = Math.floor(Math.random()*101);
    if (chance > tg.probability)
      return;
    if (tg.tiles !== undefined) {
      for (var i = tg.tiles.length - 1; i >= 0; i--) {
        var tile = tg.tiles[i];
        var hexPos = new HexPos(dp.hex.q + tile.q, dp.hex.r + tile.r)
        var hex = dp.hexMap.getHex(hexPos);
        var flags = (dp.flags.get(hexPos.toString()));
        if (flags !== null)
        if (!tile.type.get(dp.hex.terrain)) {
          return;
        }
        if (!checkFlags(hexPos, tile.has_flag, tg.has_flag, 
          tile.no_flag, tg.no_flag, 
          tile.set_no_flag, tg.set_no_flag, dp.flags))
          return;
      }
      for (var i = tg.tiles.length - 1; i >= 0; i--) {
        var tile = tg.tiles[i];
        setFlags(hexPos, tile.set_flag, tg.set_flag, 
          tile.set_no_flag, tg.set_no_flag, dp.flags);
        if (tile.image !== undefined) {
          var imgName;
          var matched = tile.image.name.split('@');
          if (matched.length == 2) {
            imgName = matched[0] + 3;
          }
          else 
            imgName = matched[0];

          dp.drawables.push(new StaticImage(
              (36 * 1.5) * dp.hex.q - 36, 
              36 * (2 * dp.hex.r + dp.hex.q) - 36, 
              imgName, 100
            )
          ); 
         
        }
        
      }
    }   
    
  }
  

  var terrainGraphics: WMLTerrainGraphics[] = [];
  
  export var rebuild = (hexMap: HexMap) => {
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_GREEN]), "grass/green", { prob: 20 });
    TERRAIN_BASE_RANDOM_LFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_GREEN]), "grass/green", {});
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_DRY]), "grass/dry", { prob: 20 });
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_SEMI_DRY]), "grass/semi-dry", { prob: 20 });
    TERRAIN_BASE_PLFB(terrainGraphics, getTerrainMap([ETerrain.GRASS_LEAF_LITTER]), "grass/leaf-litter", { prob: 20 });


    var flags = new Map<string,  Map<string, boolean>>();


    var drawables: IDrawable[] = [];

    var dp: IDrawParams = {
      hex: null,
      hexMap: hexMap,
      flags: flags,
      drawables: drawables
    }


    terrainGraphics.forEach(tg => {
      hexMap.iterate(hex => {
        dp.hex = hex;
        performTerrainGraphics(tg, dp);
      });
    });


    return drawables;

    // var drawMap = new Map<string,  HexToDraw>();

    // macros.forEach(macro => {
    //   hexMap.iterate(hex => {
    //     macro.execute(hexMap, drawMap, hex.q, hex.r);
    //   });
    // });

    // return drawMap;
  }

  // export var ensureGet = (drawMap: Map<string, HexToDraw>, q: number, r: number) => {
  //   var key = HexPos.toString(q, r)
  //   if (!drawMap.has(key))
  //     drawMap.set(key, {
  //       q: q,
  //       r: r,
  //       flags: new Map<string, boolean>(),
  //       sprites: [],
  //     });
  //   return drawMap.get(key);          
  // }

  // export interface Rotation {
  //   q: number;
  //   r: number;
  //   app: string; // app
  //   opp: string; // Opposite to the app.
  // }

  // var tv: Rotation[] = [
  //   {q: 0, r: 1, app: "s", opp: "n"}, 
  //   {q: -1, r: 1, app: "sw", opp: "ne"},
  //   {q: -1, r: 0, app: "nw", opp: "se"},
  //   {q: 0, r: -1, app: "n", opp: "s"},
  //   {q: 1, r: -1, app: "ne", opp: "sw"},
  //   {q: 1, r: 0, app: "se", opp: "nw"},
  // ]

  // export var iterateTransitions = (callback: (rotations: Rotation[], app: string) => void) => {
  //   callback(tv, "s-sw-nw-n-ne-se");

  //   callback([tv[0], tv[1], tv[2], tv[3], tv[4]], "s-sw-nw-n-ne");
  //   callback([tv[1], tv[2], tv[3], tv[4], tv[5]], "sw-nw-n-ne-se");
  //   callback([tv[2], tv[3], tv[4], tv[5], tv[0]], "nw-n-ne-se-s");
  //   callback([tv[3], tv[4], tv[5], tv[0], tv[1]], "n-ne-se-s-sw");
  //   callback([tv[4], tv[5], tv[0], tv[1], tv[2]], "ne-se-s-sw-nw");
  //   callback([tv[5], tv[0], tv[1], tv[2], tv[3]], "se-s-sw-nw-n");

  //   callback([tv[0], tv[1], tv[2], tv[3]], "s-sw-nw-n");
  //   callback([tv[1], tv[2], tv[3], tv[4]], "sw-nw-n-ne");
  //   callback([tv[2], tv[3], tv[4], tv[5]], "nw-n-ne-se");
  //   callback([tv[3], tv[4], tv[5], tv[0]], "n-ne-se-s");
  //   callback([tv[4], tv[5], tv[0], tv[1]], "ne-se-s-sw");
  //   callback([tv[5], tv[0], tv[1], tv[2]], "se-s-sw-nw");

  //   callback([tv[0], tv[1], tv[2]], "s-sw-nw");
  //   callback([tv[1], tv[2], tv[3]], "sw-nw-n");
  //   callback([tv[2], tv[3], tv[4]], "nw-n-ne");
  //   callback([tv[3], tv[4], tv[5]], "n-ne-se");
  //   callback([tv[4], tv[5], tv[0]], "ne-se-s");
  //   callback([tv[5], tv[0], tv[1]], "se-s-sw");    

  //   callback([tv[0], tv[1]], "s-sw");
  //   callback([tv[1], tv[2]], "sw-nw");
  //   callback([tv[2], tv[3]], "nw-n");
  //   callback([tv[3], tv[4]], "n-ne");
  //   callback([tv[4], tv[5]], "ne-se");
  //   callback([tv[5], tv[0]], "se-s");

  //   callback([tv[0]], "s");
  //   callback([tv[1]], "sw");
  //   callback([tv[2]], "nw");
  //   callback([tv[3]], "n");
  //   callback([tv[4]], "ne");
  //   callback([tv[5]], "se");
  // }

} 

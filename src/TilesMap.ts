module WesnothTiles {
  'use strict';

  export enum ETerrain {
    GRASS_GREEN, // Gg 0
    GRASS_SEMI_DRY, // Ggd 1
    GRASS_DRY, // Gd 2     
    GRASS_LEAF_LITTER, // Gll 3

    HILLS_REGULAR, // Hh 4
    HILLS_DRY, // Hhd 5
    HILLS_DESERT, // Hd 6      
    HILLS_SNOW, // Ha 7    

    MOUNTAIN_BASIC, // Mm 8
    MOUNTAIN_DRY, // Md 9
    MOUNTAIN_SNOW, // Ms 10 
    MOUNTAIN_VOLCANO, // Mv 11

    FROZEN_SNOW, // Aa 12
    FROZEN_ICE, // Ai 13

    SAND_BEACH, // Ds 14
    SAND_DESERT, // Dd 15
      
    SWAMP_MUD, // Sm 16
    SWAMP_WATER, // Ss 17
      
    WATER_OCEAN, // Wo 18
    WATER_COAST_TROPICAL, // Ww 19
      
    ABYSS, // Qxua 20
    VOID // Xv 21
  }
  export enum EOverlay {
    WOODS_PINE = 22,
    SNOW_FOREST,
    JUNGLE,
    PALM_DESERT,
    RAINFOREST,
    SAVANNA,
    DECIDUOUS_SUMMER,
    DECIDUOUS_FALL,
    DECIDUOUS_WINTER,
    DECIDUOUS_WINTER_SNOW,
    MIXED_SUMMER,
    MIXED_FALL,
    MIXED_WINTER,
    MIXED_WINTER_SNOW,
    MUSHROOMS,
    FARM_VEGS,
    FLOWERS_MIXED,
    RUBBLE,
    STONES_SMALL,
    OASIS,
    DETRITUS,
    LITER,
    TRASH,
    VILLAGE_HUMAN,
    VILLAGE_HUMAN_RUIN,
    VILLAGE_HUMAN_CITY,
    VILLAGE_HUMAN_CITY_RUIN,
    VILLAGE_TROPICAL,
    VILLAGE_HUT,
    VILLAGE_LOG_CABIN,
    VILLAGE_CAMP,
    VILLAGE_IGLOO,
    VILLAGE_ORC,
    VILLAGE_ELVEN,
    VILLAGE_DESERT,
    VILLAGE_DESERT_CAMP,
    VILLAGE_DWARVEN,
    VILLAGE_SWAMP,
    VILLAGE_COAST,
    DESERT_PLANTS,
    NONE
  }


  export interface IVector {
    x: number;
    y: number;
  }

  export interface IDrawable {
    draw(pos: IVector, ctx: CanvasRenderingContext2D, timePassed: number);
    layer?: number;
    base?: IVector;
    toString(): string;
  }

  export class StaticImage implements IDrawable {
    constructor(private x: number, private y: number, private name: string, public layer: number, public base: IVector) {
      if (name.match("fog")) {
        console.log("fog found! ", name);
      }
    }

    draw(pos: IVector, ctx: CanvasRenderingContext2D, timePassed: number) {
      var sprite = Internal.definitions.get(this.name);
      if (sprite === undefined) {
        console.error("Undefined sprite", this.name)
      }
      var pos: IVector = {
        x: this.x + pos.x,
        y: this.y + pos.y
      }
      sprite.draw(pos, ctx);
    }

    toString(): string {
      return this.name + this.layer + ',' + this.x + ',' + this.y;
    }
  }

  export class AnimatedImage implements IDrawable {
    private animTime = Date.now();
    constructor(private x: number,
      private y: number,
      private name: string,
      public layer: number,
      public base: IVector,
      private frames: number,
      private duration: number) {
    }

    draw(pos: IVector, ctx: CanvasRenderingContext2D, timePassed: number) {
      this.animTime = (this.animTime + timePassed) % (this.frames * this.duration);
      var frame = 1 + Math.floor(this.animTime / this.duration);
      // console.log("frame",frame);
      var frameString = "A" + (frame >= 10 ? frame.toString() : ("0" + frame.toString()));
      var sprite = Internal.definitions.get(this.name.replace("@A", frameString));
      if (sprite === undefined) {
        console.error("Undefined sprite", this.name.replace("@A", frameString))
      }
      var pos: IVector = {
        x: this.x + pos.x,
        y: this.y + pos.y
      }

      sprite.draw(pos, ctx);
    }

    toString(): string {
      return this.name + this.duration + this.layer + ',' + this.x + ',' + this.y;
    }
  }

  export class TilesMap {
    private ctx: CanvasRenderingContext2D;
    // private drawMap = new Map<string,  HexToDraw>();
    private drawables: IDrawable[];
    private lastDraw: number = Date.now();
    private hexMap = new Internal.HexMap();


    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = this.canvas.getContext('2d');
    }

    // Sets given hex to specified terrain. If not specified, overlay does not change.
    // A 'rebuild' call is needed to actually display the change.
    setTerrain(q: number, r: number, terrain: ETerrain, overlay?: EOverlay) {
      this.hexMap.addHex(new Internal.Hex(q, r, terrain, overlay))
    }

    // Unsets given hex. Overlay is cleared too.
    // It is not an equivalent of setting terrain to Void.
    // A 'rebuild' call is needed to actually display the change.
    unsetTerrain(q: number, r: number) {
      this.hexMap.removeHex(q, r);
    }

    // Sets given hex to specified overlay. If hex does not exist,
    // an error is thrown. To clear the overlay, one needs to set it to None.
    // A 'rebuild' call is needed to actually display the change.
    setOverlay(q: number, r: number, overlay: EOverlay) {
      var hex = this.hexMap.getHexP(q, r);
      if (hex === undefined)
        throw new Error("Cannot set overlay for hex (" + q + "," + r + "). No hex present.");
      hex.overlay = overlay;
    }

    // Sets the fog of war - usually meant to display hex which was once seen,
    // but is no longer in the line of sight. If no hex is present, thows an error.
    // A 'rebuild' call is needed to actually display the change.    
    setFog(q: number, r: number) {
      var hex = this.hexMap.getHexP(q, r);
      if (hex === undefined)
        throw new Error("Cannot set fog for hex (" + q + "," + r + "). No hex present.");
      hex.fog = true;
    }

    // Removes the fog of war - usually meant to display hex which was once seen,
    // but is no longer in the line of sight. If no hex is present, thows an error.
    // A 'rebuild' call is needed to actually display the change.
    unsetFog(q: number, r: number) {
      var hex = this.hexMap.getHexP(q, r);
      if (hex === undefined)
        throw new Error("Cannot unset fog for hex (" + q + "," + r + "). No hex present.");
      hex.fog = false;
    }

    // Clears the map.
    clear() {
      this.hexMap.clear();
    }

    rebuild() {
      this.drawables = Internal.rebuild(this.hexMap);
      this.drawables.sort((a: IDrawable, b: IDrawable) => {
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
      });
    }

    getCheckSum(): string {
      var checksum = 0;
      this.drawables.forEach(drawable => {
        checksum = Internal.murmurhash3(drawable.toString(), checksum);
      });

      return checksum.toString();
    }

    redraw(): void {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      var now = Date.now();
      var diff = now - this.lastDraw;
      this.lastDraw = now;
      this.drawables.forEach(drawable => {
        drawable.draw({
          x: Math.floor((this.canvas.width) / 2),
          y: Math.floor((this.canvas.height) / 2),
        }, this.ctx, diff);
      });

      // this.ctx.beginPath();
      // this.ctx.lineWidth = 4;
      // this.ctx.strokeStyle = "green";
      // this.ctx.rect(this.canvas.width / 2 - 4, this.canvas.height / 2 - 4,8,8);
      // this.ctx.stroke();
      
      // console.log(this.canvas.width, this.canvas.height);
      // for (var q = -20; q < 20; q++) { // very temporary...
      //   for (var r = -20; r < 20; r++) {
      //     var hex = this.drawMap.get(HexPos.toString(q, r));
      //       for (var i = 0; i < hex.sprites.length; i++) {
      //         var sprite = hex.sprites[i];
      //         if (sprite.animation === null || sprite.animation === undefined) {
      //           console.error("Invalid sprite!", sprite);
      //           return;
      //         }
      //         sprite.animation.frames[sprite.frame].draw(, this.ctx);
      //         sprite.frame = (sprite.frame + 1) % sprite.animation.frames.length;
      //         // sprite.frame = Math.min(sprite.animation.frames.length - 1, 3);
      //       }          
      //   }
      // }
    }

    Resize(width: number, height: number): void {
      this.canvas.width = width;
      this.canvas.height = height;
    }


    load(): Promise<void> {
      return Internal.loadResources();
    }

  }
} 

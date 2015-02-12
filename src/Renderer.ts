module WesnothTiles {
  'use strict';



  export class Renderer<HexType extends Hex> {
    private ctx: CanvasRenderingContext2D;
    private drawMap = new Map<string,  HexToDraw>();


    constructor(private canvas: HTMLCanvasElement) {
      this.ctx = this.canvas.getContext('2d');
    }

    rebuild(hexMap: HexMap) {
      this.drawMap = rebuild(hexMap);
      this.drawMap.forEach(hex => {
        hex.sprites.sort((a: ISprite, b: ISprite) => {
          return a.layer - b.layer;
        });
      });
    }

    redraw(hexMap: HexMap): void {
// console.log(this.canvas.width, this.canvas.height);
      this.drawMap.forEach(hex => {
        for (var i = 0; i < hex.sprites.length; i++) {
          var sprite = hex.sprites[i]
          if (sprite.animation === null || sprite.animation === undefined) {
            console.error("Invalid sprite!", name);
            return;
          }
          sprite.animation.frames[sprite.frame].draw({                        
            x: Math.floor((this.canvas.width) / 2) + (36 * 1.5) * hex.q - 36,
            y: Math.floor((this.canvas.height) / 2) + 36 * (2 * hex.r + hex.q) - 36
          }, this.ctx);
        }
      });
    }

    Resize(width: number, height: number): void {    
      this.canvas.width = width;
      this.canvas.height = height;
    }


    load(): Promise {
      return Resources.loadResources();
    }

  }
} 

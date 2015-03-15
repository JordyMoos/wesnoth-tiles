module WesnothTiles.Resources {
  'use strict';



  export interface IFrame {
    point: IVector;
    size: IVector;
  }


  // export interface IAnimationDef {
  //   frames: SpriteDefinition[];
  // }

  export class SpriteDefinition {

    constructor(private frame: IFrame, private spriteSource: IFrame, private sourceSize: IVector, private atlas: HTMLElement) {      
    }

    draw(pos: IVector, ctx: CanvasRenderingContext2D) {
      ctx.drawImage(this.atlas, this.frame.point.x , this.frame.point.y,
        this.frame.size.x, this.frame.size.y,
        pos.x + this.spriteSource.point.x, pos.y + this.spriteSource.point.y,
        this.frame.size.x, this.frame.size.y
      );
    }
  }
} 

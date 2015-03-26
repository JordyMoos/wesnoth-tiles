function start() {
  var canvas = document.getElementById("map-canvas");
  var renderer = new WesnothTiles.Renderer(canvas);

  renderer.load().then(function() {

    var map = new WesnothTiles.HexMap();


    var min = 0;
    var max = 0;
    for (var i = -20; i < 20; i++)
      for (var j = -20; j < 20; j++) {
        var x = i;
        var y = j;

        var code = Math.sin(-1 + (Math.sqrt(Math.abs(x + y)) + Math.sqrt(Math.abs(y * x))) / 1.2);
        if (code > max) max = code;
        if (code < min) min = code;
      }
    var spread = max - min;
    for (var i = -20; i < 20; i++)
      for (var j = -20; j < 20; j++) {
        var x = i;
        var y = j;

        var code = Math.sin(-1 + (Math.sqrt(Math.abs(x + y)) + Math.sqrt(Math.abs(y * x))) / 1.2);
        code = (code - min) * 3 / spread;

        // map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.max(0, Math.min(code, 12)))));
        // map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.sqrt(Math.abs(j * j * i * i * i / 5 + i / 5 + i * 2 * j + j))) % 10));
        // map.addHex(new WesnothTiles.Hex(i, j, 0 + Math.floor(Math.random() * 3)));
        // map.addHex(new WesnothTiles.Hex(i, j, 4));
        // map.addHex(new WesnothTiles.Hex(i, j, Math.round(Math.sqrt(Math.abs(i * i/2 + i * 2 * j * j + j))) % 4 + 4));        
      }

    map.addHex(new WesnothTiles.Hex(0, 0, 2));
    map.addHex(new WesnothTiles.Hex(1, 0, 1));
    map.addHex(new WesnothTiles.Hex(-1, 0, 1));
    map.addHex(new WesnothTiles.Hex(0, 1, 1));
    map.addHex(new WesnothTiles.Hex(0, -1, 1));
    map.addHex(new WesnothTiles.Hex(1, -1, 1));
    map.addHex(new WesnothTiles.Hex(-1, 1, 1));
    renderer.rebuild(map);
    renderer.Resize(window.innerWidth, window.innerHeight);
    var anim = function() {
      window.requestAnimationFrame(function() {
        renderer.redraw(map);
        anim();
      });
    };
    anim();
  });

}
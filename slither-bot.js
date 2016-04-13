// ==UserScript==
// @name         SLITio bot
// @namespace    slitio
// @version      0.0.1
// @description  slither.io bot
// @author       pinky
// @match        http://slither.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// show original debug window
var debugMode = false;
// show map
var viewMap = false;
// map itself
var map = null;

// dummy bot controller
// m - map, every object have 'type' attribute with letter:
//   food is '*', preys are '$'
//   self snake - 'O', enemy - 's'
// other properties of map elements you can explore yourself
// your head is in center of 50x50 map
//
// here s the sample snake controller
// looking for food nearby, enemies ignored
//
// controls are simple:
//   xm - x movement relative coord
//   ym - y movement relative coord
//   setAcceleration(1 or 0) - set acceleration to 1 or to 0
var choosed = 0;

function __updatePlayer()
{
    if( !choosed)
    {
        // looking for food nearby
        for( var y = 40; y > 20; --y)
            for( var x = 20; x < 40; ++x)
                if( map[y][x] && (map[y][x].type == '*' || map[y][x].type == '$'))
                {
                    // got it
                    setAcceleration(1);
                    choosed = map[y][x].id;

                    break;
                }
    }
    else
    {
        for( var y = 35; y > 15; --y)
            for( var x = 15; x < 35; ++x)
                if( map[y][x] && (map[y][x].id == choosed))
                {
                    // set destination
                    // 25 - is center of map[50x50]
                    // 5 is simply multiplier, less - faster rotation
                    xm = (x - 25)*5;
                    ym = (y - 25)*5;

                    break;
                }

    }

    setTimeout(__updatePlayer, 50);
}

// TODO: now it calls if anybody eats something
function __onEat()
{
    setAcceleration(0);
    //console.log("onEat");

    choosed = 0;
    xm = ym = 0;
}

/// game controller
var mpd;

(function(w)
{
    var mapSize = 50;
    var viewsEnabled = false;

    function init()
    {
        if( !viewsEnabled)
        {
            testing = debugMode;

            // original console
            testing && (pfd = document.createElement("div"),
                        pfd.style.position = "fixed",
                        pfd.style.left = "4px",
                        pfd.style.bottom = "30px",
                        pfd.style.width = "170px",
                        pfd.style.height = "364px",
                        pfd.style.background = "rgba(0, 0, 0, .8)",
                        pfd.style.color = "#80FF80",
                        pfd.style.fontFamily = "Verdana",
                        pfd.style.zIndex = 999999,
                        pfd.style.fontSize = "11px",
                        pfd.style.padding = "10px",
                        pfd.style.borderRadius = "30px",
                        pfd.textContent = "ayy lmao",
                        document.body.appendChild(pfd));

            // map viewer
            viewMap && (mpd = document.createElement("div"),
                        mpd.style.position = "fixed",
                        mpd.style.right = "10px",
                        mpd.style.bottom = "30px",
                        mpd.style.width = "690px",
                        mpd.style.height = "690x",
                        mpd.style.background = "rgba(0, 0, 0, .8)",
                        mpd.style.color = "#80FF80",
                        mpd.style.fontFamily = "Courier",
                        mpd.style.zIndex = 999999,
                        mpd.style.fontSize = "11px",
                        mpd.style.padding = "10px",
                        mpd.style.borderRadius = "30px",
                        mpd.textContent = "ayy lmao",
                        document.body.appendChild(mpd));

            viewsEnabled = true;
        }

        map = new Array( mapSize);
        for( var i = 0; i < mapSize; ++i)
            map[i] = new Array( mapSize);

        showMap();

        // store controls
        w.omm = w.onmousemove;
        w.ocm = w.oncontextmenu;
        w.otm = w.ontouchmove;
        w.ots = w.ontouchstart;
        w.omd = w.onmousedown;
        w.ote = w.ontouchend;
        document.okd = document.onkeydown;
        document.oku = document.onkeyup;

        // disable controls
        w.onmousemove =
            w.oncontextmenu =
            w.ontouchmove =
            w.ontouchstart =
            w.ontouchend =
            w.onmousedown =
            document.onkeydown =
            document.onkeyup =
            function (b){};

        // start update loop
        __updatePlayer();
    }

    function showMap()
    {
        if (!viewMap)
            return;

        var h = [];
        for( var i = -1; i <= mapSize; ++i)
        {
            var str = "| ";
            for( var j = 0; j < mapSize; ++j)
                if (i < 0 || i == mapSize)
                    str += "==";
                else
                    str += (!map[i][j] ? '.' : map[i][j].type.toString()) + " ";
            str += " |";
            h.push(str);
        }
        mpd.innerHTML = h.join('<br>');

        setTimeout(showMap, 50);
    }

    function setPoint(ox, oy, x, y, wat)
    {
        var c = mapSize / 2;

        var px = (x - ox)/40 + c,
            py = (y - oy)/40 + c;

        if( px < 0 || px > mapSize || py < 0 || py > mapSize)
            return;

        map[py | 0][px | 0] = wat;
    }

    // some changes to original script
    w.addEventListener('load', function() {

        w.connect_old = w.connect;
        w.connect = function()
        {
            init();
            connect_old();

            w.ws.onMessageOld = w.ws.onmessage;
            w.ws.onmessage = function(b)
            {
                this.onMessageOld(b);
                var arr = new Uint8Array(b.data),
                    f = String.fromCharCode(arr[2]);

                if(playing && (f == "g" || f == "n" || f == "G" || f == "N"))
                {
                    map = new Array( mapSize);
                    for( var i = 0; i < mapSize; ++i)
                        map[i] = new Array( mapSize);

                    // console.log(snakes);
                    snakes.forEach(function(snk, j, _a) {
                        snk.type = (snk === snake ? 'O' : 's');
                        snk.pts.forEach(function(item, i, arr) {
                            if( item.da < 0.05)
                                setPoint( snake.xx, snake.yy, item.xx, item.yy, snk);
                        });
                    });
                    // console.log(foods);
                    foods.forEach(function(fds, j, _a) {
                        if( fds)
                        {
                            fds.type = '*';
                            setPoint( snake.xx, snake.yy, fds.xx, fds.yy, fds);
                        }
                    });
                    // console.log(preys);
                    preys.forEach(function(fds, j, _a) {
                        if( fds)
                        {
                            fds.type = '$';
                            setPoint( snake.xx, snake.yy, fds.xx, fds.yy, fds);
                        }
                    });
                }
                else if(playing && (f == "c" || f == "y"))
                {
                    __onEat();
                }
            };
        };
    }, false);
})(window);


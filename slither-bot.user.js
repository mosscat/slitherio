// ==UserScript==
// @name         SLITio bot
// @namespace    slitio
// @version      0.0.1
// @description  slither.io bot
// @author       pinky
// @match        http://slither.io/*
// @run-at       document-idle
// @require      http://code.jquery.com/jquery-latest.js
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
var curSize = 0;
var prey = 0;

var running = 0;

function setChoosed(x, y)
{
    if( !playing)
        return false;

    var _y = 25 - y;
    var _x = 25 + x;
    if( !x || !y || !map[_y][_x])
        return false;

    if( running && (map[_y][_x].type != 's' || x < -7 || x > 7 || y < -7 || y > 7))
        return false;

    if(map[_y][_x].type == 's' && (x > -7 && x < 7 && y > -7 && y < 7))
    {
        running = 13;

        // xm = (map[_y][_x].xx - snake.xx)*40;
        // ym = (map[_y][_x].yy - snake.yy)*40;
        xm = -x*150;
        ym = y*150;

        setAcceleration(0);

        return true;
    }

    if(map[ _y][ _x].type == '$' && ((x > -5 && x < 5 && y > -5 && y < 5) || prey))
    {
        prey = 1;

        xm = x * 40;
        ym = -y * 40;

        setAcceleration(1);

        return true;
    }

    if(!prey && map[ _y][ _x].type == '*' && (map[ _y][ _x].size > curSize || map[ _y][_x].id == choosed) )
    {
        choosed = map[_y][_x].id;
        curSize = map[_y][_x].size;

        var obj = map[_y][_x].array[0];
        if( obj)
        {
            xm = x * 40;
            ym = -y * 40;
            //xm = obj.xx - snake.xx;
            //ym = obj.yy - snake.yy;

            setAcceleration(curSize > 100);

            return true;
        }
    }

    return false;
}

function __updatePlayer()
{
    var found = false;

    for( var i = 0; i < 23; ++i)
        for( var z = 0; z < i+1; ++z)
            if( setChoosed( z, i) || setChoosed( z, -i) || setChoosed( -z, i) || setChoosed( -z, -i)
               || setChoosed( i, z) || setChoosed( i, -z) || setChoosed( -i, z) || setChoosed( -i, -z))
            {
                found = true;

                if( running)
                    break;
            }

    if( !found)
        __onEat();

    if( running)
        running = running - 1;

    setTimeout(__updatePlayer, 50);
}

function __onEat()
{
    if( !running)
        setAcceleration(0);
    prey = choosed = curSize = 0;
}

/// controller
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
                        mpd.style.width = "750px",
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
                {
                    var item = (!map[i][j] ? '.' : map[i][j].type.toString());
                    switch( item)
                    {
                        case '*': item = '<font color="#0000FF">' + item + '</font>';
                            break;
                        case '$': item = '<font color="#FFFFFF">' + item + '</font>';
                            break;
                        case 'O': item = '<font color="#00DD00">' + item + '</font>';
                            break;
                        case 's': item = '<font color="#FF0000">' + item + '</font>';
                            break;
                    }
                    str += item + " ";
                }
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

        if( px < 0 || px > mapSize || py < 0 || py > mapSize || (map[py | 0][px | 0] && map[py | 0][px | 0].type == 's'))
            return;

        if( wat.type == '*') // food
        {
            var tmp = map[py | 0][px | 0];
            if( tmp && tmp.type != '*')
                return;

            if( !tmp)
            {
                tmp = map[py | 0][px | 0] = {};
                tmp.id = 0;
                tmp.type = '*';
                tmp.size = 0;
                tmp.array = [];
            }

            tmp.id = tmp.id ^ wat.id;
            tmp.size += wat.sz;
            tmp.array.push(wat);

            return;
        }

        map[py | 0][px | 0] = wat;
    }

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

                    //console.log(snakes);
                    snakes.forEach(function(snk, j, _a) {
                        snk.type = (snk === snake ? 'O' : 's');
                        snk.pts.forEach(function(item, i, arr) {
                            if( item.da < 0.15 && snk !== snake)
                                setPoint( snake.xx, snake.yy, item.xx, item.yy, snk);
                        });
                    });
                    //console.log(foods);
                    foods.forEach(function(fds, j, _a) {
                        if( fds && !fds.eaten)
                        {
                            fds.type = '*';
                            setPoint( snake.xx, snake.yy, fds.xx, fds.yy, fds);
                        }
                    });
                    //console.log(preys);
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
                    var id = arr[3] << 16 | arr[4] << 8 | arr[5];
                    foods.forEach(function(fds, j, _a) {
                        if( fds && fds.eaten_by === snake){
                            // console.log(fds.gr + ", " + fds.sz);
                            __onEat();}
                    });
                }
            };
        };
    }, false);
})(window);


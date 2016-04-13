var mpd;

(function(w)
{
    const mapSize = 50;
    var map = null,
        viewsEnabled = false;

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

        showMap();
    }

    function showMap()
    {
        if (!viewMap || !map)
            return;

        let h = [];
        for( var i = -1; i <= mapSize; ++i)
        {
            var str = "| ";
            for( var j = 0; j < mapSize; ++j)
                if (i < 0 || i == mapSize)
                    str += "==";
                else
                    str += (!map[i][j] ? '.' : map[i][j].toString()) + " ";
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

                    snakes.forEach(function(snk, j, _a) {
                        var wat = snk.nk.charAt(0);
                        if( !wat)
                            wat = 'S';
                        if( snk === snake)
                            wat = '0';

                        snk.pts.forEach(function(item, i, arr) {
                            if( item.da < 0.05)
                                setPoint( snake.xx, snake.yy, item.xx, item.yy, wat);
                        });
                    });
                    foods.forEach(function(fds, j, _a) {
                        setPoint( snake.xx, snake.yy, fds.xx, fds.yy, '*');
                    });
                }
            };
        };
    }, false);
})(window);

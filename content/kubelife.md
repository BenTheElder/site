---
markup: md
type: misc
title: KubeLife
---
<canvas id="kubelife-canvas" height="1632" width="1632" class="full-bleed" style="width: 100%; margin-top: .5em">
<div class="centered-text title" style="background-color: black; color: white; padding: 1em">This automaton requires that you <a href="http://www.enable-javascript.com/">enable JavaScript</a>.</div>
</canvas>

<div class="centered-text"><button id="kubelife-pause"><i class="material-icons">pause</i></button><button tabindex="0" onclick="doReset(event, this, initGOL)"><i class="material-icons">replay</i></button></div>
<div class="centered-text">Inspired by the Kubernetes <a href="https://github.com/kubernetes/sig-release/blob/master/releases/release-1.12/README.md">1.12 Release</a></div>

<!-- script for demos -->
<script>
/* generic snippet to prevent button focus on click*/
function buttonMouseDown(e) {
    e.preventDefault();
}
function setupButtons() {
    var buttons = document.getElementsByClassName("button");
    for (i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("mousedown", buttonMouseDown);
    }
    var buttons = document.getElementsByTagName('button');
    for (i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("mousedown", buttonMouseDown);
    }
}
window.addEventListener('onload', function() {
    setupButtons();
}());
/* end snippet*/

var framesPerSecond = 3;
function startRender(renderFunc, updateFunc) {
    var then = new Date().getTime();
    var interval = 1000 / framesPerSecond;

    function render() {
        requestAnimationFrame(render);
        var now = new Date().getTime();
        var delta = now - then;
        if (delta > interval) {
            then = now - (delta % interval);
            renderFunc();
            updateFunc();
        }
    }
    render();
}

var init = function() {
    // setup game of life
    var gol = new automata.GameOfLife(68, 68);
    gol.deadColor = "white";
    gol.liveColor = "#1c6bee";
    gol.lineColor = "black";
    gol.lineThickness = 2;
    gol.halfLineThickness = 1;
    var initGOL = function() {
        gol.init();
        // set up starting pattern
        // row: [cols]
        var liveCells = {
            1: [24],
            2: [23, 25],
            3: [23, 25],
            4: [24],
            6: [19, 29],
            7: [5, 7, 18, 20, 23, 24, 25, 28, 30, 41, 43],
            8: [6, 7, 15, 19, 29, 33, 41, 42],
            9: [6, 14, 16, 16, 32, 34, 42],
            10: [11, 15, 24, 33, 37],
            11: [9, 11, 23, 25, 37, 39],
            12: [10, 11, 23, 25, 37, 38],
            13: [14, 24, 34],
            14: [15, 16, 32, 33],
            15: [10, 14, 15, 33, 34, 38],
            16: [9, 11, 19, 23, 24, 25, 29, 37, 39],
            17: [10, 20, 28, 38],
            18: [18, 19, 20, 28, 29, 30],
            19: [24],
            20: [9, 23, 24, 25, 39],
            21: [8, 10, 17, 18, 19, 28, 29, 30, 38, 40],
            22: [10, 13, 14, 19, 29, 34, 35, 38],
            23: [14, 15, 18, 22, 23, 25, 26, 29, 33, 34],
            24: [9, 10, 13, 21, 23, 25, 27, 35, 38, 39],
            25: [8, 10, 23, 25, 38, 40],
            26: [4, 10, 38, 44],
            27: [4, 5, 14, 20, 28, 34, 43, 44],
            28: [3, 5, 13, 15, 20, 21, 27, 28, 33, 35, 43, 45],
            32: [16, 17, 18, 21, 27, 30, 31, 32],
            33: [18, 20, 22, 24, 26, 28, 30],
            34: [17, 21, 24, 27, 31],
            35: [24],
            37: [14, 15, 33, 34],
            38: [15, 16, 32, 33],
            39: [14, 34],
        };
        Object.keys(liveCells).forEach(function(key,index) {
            for (var i = 0; i < liveCells[key].length; i++) {
                var r = parseInt(key, 10)+16;
                var c = liveCells[key][i] + 10;
                gol.cells[r][c] = true;
            }
        });
    };
    initGOL();
    window.initGOL = initGOL;

    // setup rendering
    var golCanvas = document.getElementById("kubelife-canvas");

    function makePauseFunction(pauseElem) {
        var pause = '<i class="material-icons">pause</i>';
        var play = '<i class="material-icons">play_arrow</i>';
        var isPausedVal = false;
        return {
            pauseToggle: function(event) {
                if (pauseElem.innerHTML.includes("pause")) {
                    pauseElem.innerHTML = play;
                    isPausedVal = true;
                } else {
                    pauseElem.innerHTML = pause;
                    isPausedVal = false;
                }
            },
            isPaused: function() {
                return isPausedVal;
            },
        };
    };

    var golPauseElem = document.getElementById("kubelife-pause");
    golPause = makePauseFunction(golPauseElem);
    golPauseElem.onclick = golPause.pauseToggle;
    startRender(function() {
        gol.render(golCanvas);
    },
    function() {
        if (!golPause.isPaused()) {
             gol.update();
        }
    });
}
function doReset(event, div, resetFunc) {
    resetFunc();
}
// FROM: https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
};
loadScript("/scripts/automata.js", init);
</script>

<!--icon font for pause / play buttons-->
<link href="https://fonts.googleapis.com/css?family=Material+Icons" rel="stylesheet" property="stylesheet" />

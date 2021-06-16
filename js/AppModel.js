;
'use strict';

var AppModel = function() {
    this.m; 
    this.n; 
    this.size = 15; 
    this.who; 
    this.matrix; 
    this.freeCells; 
    this.hashStep; 
    this.playing; 
    this.winLine; 
    this.prePattern = [
        {w: 1000, p: ['xxxxx']},
        {w: 160, p: ['0xxxx0']}, 
        {w: 80, p: ['0xxxx']}, 
        {w: 40, p: ['x0xxx', 'xx0xx']}, 
        {w: 20, p: ['0xxx0']}, 
        {w: 10, p: ['0xxx']}, 
        {w: 5, p: ['0xx0']} 
    ];
    this.pattern = [[], [], []]; 
    this.patternWin = [0, /(1){5}/, /(2){5}/, /[01]*7[01]*/, /[02]*7[02]*/]; 
    this.steps;

    this.init = function() {
        var s, a, l;
        for (var i in this.prePattern)
            for (var j in this.prePattern[i].p)
            {
                s = this.prePattern[i].p[j];
                a = replace7x(s);
                if ((s2 = reverseString(s)) !== s)
                    a = a.concat(replace7x(s2));
                s = '(' + a.join('|') + ')';
                l = this.pattern[0].length;
                this.pattern[0][l] = this.prePattern[i].w; 
                this.pattern[1][l] = new RegExp(s.replace(/x/g, '1')); 
                this.pattern[2][l] = new RegExp(s.replace(/x/g, '2')); 
            }
    };

    this.startGame = function(a) { 
        this.who = true;
        this.matrix = [];
        this.winLine = [];
        this.hashStep = {};
        this.freeCells = this.size * this.size;
        for (var n = 0; n < this.size; n++) {
            this.matrix[n] = [];
            for (var m = 0; m < this.size; m++)
                this.matrix[n][m] = 0;
        }
        this.steps = [];
        this.playing = true;
        if (a !== 1)
        {
            this.hashStep = {7: {7: {sum: 0, attack: 1, defence: 0}}}; 
            this.moveAI();
        }
    };

    this.setNM = function(a) { 
        this.n = a.n;
        this.m = a.m;
    };

    this.emptyCell = function(a, b) { 
        var n = a || this.n;
        var m = b || this.m;
        return this.matrix[n][m] === 0;
    };

    this.moveUser = function() { 
        this.playing = false; 
        return this.move(this.n, this.m, false);
    };

    this.moveAI = function() { 
        this.playing = false;
        this.hashStep = this.calculateHashMovePattern(this.hashStep); 
        var goodMoves = this.bestMoves(this.hashStep);
        var movenow = goodMoves[getRandomInt(0, goodMoves.length - 1)]; 
        this.n = movenow.n;
        this.m = movenow.m;
        return this.move(this.n, this.m, true);
    };

    this.bestMoves = function(hs) {
        var max = 0;
        var n, m;
        var goodMoves = [];
        for (n in hs)         
            for (m in hs[n])
                if (hs[n][m].sum > max)
                    max = hs[n][m].sum;
        max = 0.9 * max;
        for (n in hs)        
            for (m in hs[n])
                if (hs[n][m].sum >= max)
                    goodMoves[goodMoves.length] = {n: parseInt(n), m: parseInt(m)};
        return goodMoves;
    };

    this.moveDemo = function(a) {
        if (!this.isDemoMode)
            return false;
        var n = this.n;
        var m = this.m;
        var newMoveDemo = (this.demoStep[0][0] !== n || this.demoStep[0][1] !== m);
        var need = a || newMoveDemo;
        if (!need)
            return false;
        this.demoStep[1] = this.demoStep[0].slice();
        this.demoStep[0] = [n, m];
        this.demoStep[3] = cloneObject(this.demoStep[2]);
        this.matrixDemo = cloneObject(this.matrix);
        if (this.matrixDemo[n][m] === 0)
            this.matrixDemo[n][m] = 2 - this.who;

        this.demoStep[2] = cloneObject(this.hashStep);
        this.demoStep[2] = this.updateHashSteps(this.demoStep[2], n, m, true);
        this.demoStep[2] = this.calculateHashMovePattern(this.demoStep[2], true);
        this.demoStep[4] = this.bestMoves(this.demoStep[2]);

        for (n in this.demoStep[3])
            for (m in this.demoStep[3][n])
                if (this.demoStep[2][n] && this.demoStep[2][n][m])
                    delete this.demoStep[3][n][m];
        return newMoveDemo;
    };

    this.move = function() {
        var n = this.n, m = this.m;
        this.matrix[n][m] = 2 - this.who; 
        this.steps[this.steps.length] = [n, m];
        this.who = !this.who; 
        this.freeCells--;
        var t = this.matrix[this.n][this.m]; 
        var s = ['', '', '', ''];
        var nT = Math.min(this.n, 4);
        var nR = Math.min(this.size - this.m - 1, 4);
        var nB = Math.min(this.size - this.n - 1, 4);
        var nL = Math.min(this.m, 4);
        for (var j = this.n - nT; j <= this.n + nB; j++)
            s[0] += this.matrix[j][this.m];
        for (var i = this.m - nL; i <= this.m + nR; i++)
            s[1] += this.matrix[this.n][i];
        for (var i = -Math.min(nT, nL); i <= Math.min(nR, nB); i++)
            s[2] += this.matrix[this.n + i][this.m + i];
        for (var i = -Math.min(nB, nL); i <= Math.min(nR, nT); i++)
            s[3] += this.matrix[this.n - i][this.m + i];
        var k;
        if ((k = s[0].search(this.patternWin[t])) >= 0)
            this.winLine = [this.m, this.n - nT + k, this.m, this.n - nT + k + 4];
        else if ((k = s[1].search(this.patternWin[t])) >= 0)
            this.winLine = [this.m - nL + k, this.n, this.m - nL + k + 4, this.n];
        else if ((k = s[2].search(this.patternWin[t])) >= 0)
            this.winLine = [this.m - Math.min(nT, nL) + k, this.n - Math.min(nT, nL) + k, this.m - Math.min(nT, nL) + k + 4, this.n - Math.min(nT, nL) + k + 4];
        else if ((k = s[3].search(this.patternWin[t])) >= 0)
            this.winLine = [this.m - Math.min(nB, nL) + k, this.n + Math.min(nB, nL) - k, this.m - Math.min(nB, nL) + k + 4, this.n + Math.min(nB, nL) - k - 4, -1];
        this.playing = (this.freeCells !== 0 && this.winLine.length === 0); 
        if (this.playing)
            this.hashStep = this.updateHashSteps(this.hashStep, this.n, this.m, false);
      
        return {n: this.n, m: this.m};
    };

    this.updateHashSteps = function(hs, n, m, isDemo) {
        if (hs[n] && hs[n][m])
            delete hs[n][m]; 
        var nd, md;
        for (var i = -2; i <= 2; i++)
            for (var j = -2; j <= 2; j++) {
                nd = i + n;
                md = j + m;
                if (nd < 0 || md < 0 || nd >= this.size || md >= this.size)
                    continue;
                if (isDemo) {
                    if (this.matrixDemo[nd][md] !== 0)
                        continue;
                } else {
                    if (this.matrix[nd][md] !== 0)
                        continue;
                }
                if (!(nd in hs))
                    hs[nd] = {};
                if (!(md in hs[nd]))
                    hs[nd][md] = {sum: 0, attack: 0, defence: 0};
            }
        return hs;
    };

    this.calculateStingLine = function(i, n, m, isDemo) {
        if (n >= 0 && m >= 0 && n < this.size && m < this.size)
            return (i === 0) ? '7' : (isDemo) ? this.matrixDemo[n][m] : this.matrix[n][m];
    };

    this.calculateHashMovePattern = function(hs, a) { 
        var isDemo = a || false;
        var s;
        var k = 0;
        var attack;
        var defence;
        if (!isDemo) {
            attack = 2 - this.who;
            defence = 2 - !this.who;
        } else {
            attack = 2 - !this.who;
            defence = 2 - this.who;
        }
        var res;
        for (n in hs)
            for (m in hs[n]) 
            {
                hs[n][m].attack = 0;
                hs[n][m].defence = 0;
                n = parseInt(n);
                m = parseInt(m);
                for (var q = 1; q <= 2; q++) 
                    for (var j = 1; j <= 4; j++) { 
                        s = '';
                        for (var i = -4; i <= 4; i++) 
                            if (j === 1)
                                s += this.calculateStingLine(i, n + i, m, isDemo);
                            else if (j === 2)
                                s += this.calculateStingLine(i, n, m + i, isDemo);
                            else if (j === 3)
                                s += this.calculateStingLine(i, n + i, m + i, isDemo);
                            else
                                s += this.calculateStingLine(i, n - i, m + i, isDemo);
                        res = (q === 1) ? this.patternWin[2 + attack].exec(s) : this.patternWin[2 + defence].exec(s);
                        if (res === null)
                            continue;
                        if (res[0].length < 5) 
                            continue; 
                        if (q === 1) 
                            for (var i in this.pattern[attack]) { 
                                {
                                   
                                    if (this.pattern[attack][i].test(s)) { 
                                        hs[n][m].attack += this.pattern[0][i];
                                        break;
                                    }
                                }
                            }
                        else 
                            for (var i in this.pattern[defence])
                                if (this.pattern[defence][i].test(s))
                                {
                                    hs[n][m].defence += this.pattern[0][i];
                                    break;
                                }
                    }
                if (hs[n][m].defence < 20) 
                hs[n][m].defence = 0;
                hs[n][m].sum = 2*hs[n][m].attack + hs[n][m].defence; 
                k++;
            }
        return hs;
    };
    this.init();
};
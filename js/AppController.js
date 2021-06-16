'use strict';

var AppController = function(model, view) {
    var AppController = this;
    this.model = model;
    this.view = view;
    this.x = 0;
    this.y = 0;

    this.init = function() {
        this.view.canvas.addEventListener('click', function(e) {
            AppController.mouseClick(e);
        });
        this.view.newGameBtnBlack.onclick = function() {
            AppController.newGame(1);
        };
       
        this.newGame(2);
    };

    this.newGame = function(a) {
        this.model.startGame(a);
        this.view.renderBoard();
        this.view.renderAllMoves();
    };

    this.moveAI = function() {
        var nm = model.moveAI();
        this.view.renderMove(nm);
        if (!this.model.playing)
            this.view.renderWinLine();
        else if (this.model.isDemoMode)
            this.moveDemo(true);
    };

    this.moveUser = function() {
        if (!this.model.emptyCell())
            return;
        var nm = this.model.moveUser();
        this.view.renderMove(nm);
        this.view.setStyleCursorDefault();
        if (!this.model.playing)
            this.view.renderWinLine();
        else
            this.moveAI();
    };

    this.moveDemo = function(a) {
        if (this.model.moveDemo(a))
            this.view.renderDemo();
    };

    this.mouseClick = function() {
        if (!this.model.playing)
            return;
        this.moveUser();
    };

    this.init();
};
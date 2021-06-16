;
'use strict';
var AppView = function(model) {
    var AppView = this;
	var winner; //победитель
    this.model = model;
    this.canvas;//канвас
    this.context;//контекст
    this.newGameBtnBlack;//Кнопка начала новой игры за черных
    this.gameBoard;//Игровое поле
    this.canvasWidth = 601;//Ширина канваса
    this.cellSize = 40;//Размер одной клетки
    this.halfCellSize = 20;
    this.radius = 12;
    this.cross = 10;
    this.crosswin = 15;
    this.color = {canvas: '#DEB887', border: 'Black', winline: '#6A5D4D', x: '#C1876B', y: '#BEBD7F'};//Набор цветов
    this.init = function() {//Инициализация
        this.newGameBtnBlack = createElement('input', {type: 'button', value: 'Start Game BLACK'});//Создаем кнопку начала новой игры
        this.canvas = createElement('canvas');//Создаем канвас	
        this.gameBoard = createElement('div', {class: 'gameBoard'}, this.canvas);//Создаем игровое поле
        var body = document.getElementsByTagName('body')[0];//Получаем доступ к элементу body
        body.appendChild(createElement('div', {class: 'scoreBoard'}, this.newGameBtnBlack));
        body.appendChild(this.gameBoard);//Добавляем элементы кнопки, игрового поля
        this.context = AppView.canvas.getContext('2d');//Устанавливаем тип контекста
        window.addEventListener('resize', function() {//Добавляем обработчик события изменения размера экрана
            AppView.resizeWindow();
        }, false);
        window.addEventListener('orientationchange', function() {//Добавляем обработчик изменения ориентации экрана
            AppView.resizeWindow();
        }, false);
        this.resizeWindow();
    };
    this.resizeWindow = function() {//Изменение размеров экрана
        var widthToHeight = 1 / 1;//Устанавливаем изначальное соотношение ширины к высоте
        var newWidth = window.innerWidth;//Получаем новую ширину экрана 
        var newHeight = window.innerHeight - 70;//Получаем новую высоту экрана
        var newWidthToHeight = newWidth / newHeight;//Устанавливаем новое значение соотношения ширины к высоте
        if (newWidthToHeight > widthToHeight) {//Устанавливаем размеры экрана, если новая ширина экрана больше старой
            newWidth = newHeight * widthToHeight;
            this.gameBoard.style.height = newHeight + 'px';
            this.gameBoard.style.width = newWidth + 'px';
        } else {
            newHeight = newWidth / widthToHeight;
            this.gameBoard.style.width = newWidth + 'px';
            this.gameBoard.style.height = newHeight + 'px';
        }

        this.gameBoard.style.marginTop = 15 + (-newHeight / 2) + 'px';//Устанавливаем отступ сверху от игрового поля 
        this.gameBoard.style.marginLeft = (-newWidth / 2) + 'px';//Устанавливаем отступ слева от игрового поля
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.cellSize = Math.floor(this.canvas.width / this.model.size);//Устанавливаем размер одной клетки
        this.canvasWidth = this.model.size * this.cellSize + 1;
        this.halfCellSize = Math.floor(this.cellSize / 2);
        this.radius = Math.floor(this.cellSize / 3.3);
        this.cross = Math.floor(this.cellSize / 4);
        this.crosswin = Math.floor(this.cellSize / 2.7);
        this.renderBoard();
        this.renderAllMoves();
    };
    this.renderBoard = function() {//Прорисовка поля
        this.context.fillStyle = this.color.canvas;//Устанавливаем цвет поля
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasWidth);
        this.context.beginPath();
        this.context.strokeStyle = this.color.border;//Устанавливаем цвет сетки
        this.context.lineWidth = 1;//Устанавливаем толщину линий сетки
        for (var x = 0.5; x <= this.canvasWidth; x += this.cellSize) {//Рисуем линии сетки по горизонтали
            this.context.moveTo(x, 0);
            this.context.lineTo(x, this.canvasWidth);
        }
        for (var y = 0.5; y <= this.canvasWidth; y += this.cellSize) {//Рисуем линии сетки по вертикали
            this.context.moveTo(0, y);
            this.context.lineTo(this.canvasWidth, y);
        }
        this.context.stroke();
    };
    this.renderMove = function(nm) {//Прорисовка нового хода
        var n = nm.n || this.model.n;
        var m = nm.m || this.model.m;
        this.renderEmptyCell(n, m);
        if (this.model.matrix[n][m] === 1)
            this.renderBlack(n, m);
        else
            this.renderWhite(n, m);
    };
    this.renderAllMoves = function() {//Прорисовка всех ходов
        var steps = this.model.steps;
        for (var i in steps) {
            this.renderEmptyCell(steps[i][0], steps[i][1]);
            if (!(i % 2))
                this.renderBlack(steps[i][0], steps[i][1], i);
            else
                this.renderWhite(steps[i][0], steps[i][1], i);
        }
    };

    this.renderWinLine = function()//Прорисовка линии победы
    {
        var context = this.context;
        var cellSize = this.cellSize;
        var halfCellSize = this.halfCellSize;
        var crosswin = this.crosswin;
        var m1 = this.model.winLine[0];
        var n1 = this.model.winLine[1];
        var m2 = this.model.winLine[2];
        var n2 = this.model.winLine[3];
        var r = this.model.winLine[4] || 1;
        context.beginPath();
        context.strokeStyle = this.color.winline;//Устанавливаем цвет линии
        context.lineWidth = 3;//Устанавливаем толщину линии
        context.lineCap = 'round';//Устанавливаем округлые концы линии
        context.moveTo(m1 * cellSize + halfCellSize - crosswin * (m1 !== m2), n1 * cellSize + halfCellSize - crosswin * (n1 !== n2) * r);
        context.lineTo(m2 * cellSize + halfCellSize + crosswin * (m1 !== m2), n2 * cellSize + halfCellSize + crosswin * (n1 !== n2) * r);//Рисуем линию победы
        context.stroke();
		//Проверка и вывод победителя
		if(winner % 2 == 0){//Четное число
			alert('The white is winner!');
		}
		else {
			alert('The black is winner!');
		}
    };
	
	    this.renderStep = function(x, y, i)//Определение номера шага
    {
        var text = parseInt(i) + 1 || this.model.steps.length;//Определяем ход
		winner = text;//Сохраняем ход в шлобальную переменную 
	};
	
    this.renderBlack = function(n, m, i, p)//Прорисовка черных фишек
    {
        var context = this.context;
        var x = m * this.cellSize + this.halfCellSize;
        var y = n * this.cellSize + this.halfCellSize;
		var img = new Image();
		img.src = 'Go_b.png';
		img.onload = function(){
			context.drawImage(img, x-12, y-12, 25, 25);			
		};
        this.renderStep(x, y, i);
    };
	
    this.renderWhite = function(n, m, i, p)//Прорисовка белых фишек
    {
        var context = this.context;
        var x = m * this.cellSize + this.halfCellSize;
        var y = n * this.cellSize + this.halfCellSize;
		var img2 = new Image();
		img2.src = 'Go_w2.png';
		img2.onload = function(){
			context.drawImage(img2, x-12, y-12, 25, 25);
		};
       this.renderStep(x, y, i);
    };

    this.renderEmptyCell = function(n, m, color) {//Прорисовка пустой клетки
        var context = this.context;
        context.beginPath();
        var x = m * this.cellSize + this.halfCellSize;
        var y = n * this.cellSize + this.halfCellSize;
        context.fillStyle = color || this.color.canvas;
        context.fillRect(x - this.halfCellSize + 1, y - this.halfCellSize + 1, this.cellSize - 2, this.cellSize - 2);
        context.stroke();
        return [x, y];
    };
	
    this.setStyleCursor = function(x, y) {//Установка курсора
        var n = Math.min(Math.floor(y / this.cellSize), this.model.size - 1);
        var m = Math.min(Math.floor(x / this.cellSize), this.model.size - 1);
        this.canvas.style.cursor = (this.model.matrix[n][m] === 0) ? 'pointer' : 'default';
        return {n: n, m: m};
    };
    this.setStyleCursorDefault = function() {//Установка изначального курсора
        this.canvas.style.cursor = 'default';
    };
    this.init();
};
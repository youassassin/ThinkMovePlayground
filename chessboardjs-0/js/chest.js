var Chest = function(fen) {

    var board = [];
    var lastBoard = [];
    var history = [];
    var winCondition = '';
    var alpha = 'abcdefgh';
    var black = 'pkqnbr';
    var white = black.toUpperCase();
    var promotion = { flag: false, index: -1 , update: false };
    var isEnPassant = { flag: false, direction: 0};
    var turn = 0;
    var gameOver = false;

    fen = fen === 'start' ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR': fen;
    //this initializes the board array
    var initBoard = function (fen) {
        turn = 0;
        gameOver = false;
        board = [];
        history = [];
        var tokens = fen.split('/');
        for (var i = 0; i < tokens.length; i++) {
            for (var j = 0; j < tokens[i].length; j++) {
                var ch = tokens[i].charAt(j);
                if (!isNaN(ch)) {
                    while (ch != 0) { //dynamic language magic
                        board.push('');
                        ch--;
                    }
                } else {
                    board.push(ch);
                }
            }
        }
    };

    initBoard(fen);

    this.get = function() {
        console.log(board);
        console.log(arrayToFen(board));
        console.log(arrayToPgn(history));
    };
    this.printBoard = function (input) {
        var str = '';
        for(var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++)
                str += (input[(x*8)+y] === '' ? ' ' : input[(x*8)+y]) + ', ';
            str += '\n'
        }
        console.log(str);
    };

////////////////////////////////////////////////////////////////////////////////////////
////    Private
////////////////////////////////////////////////////////////////////////////////////////
    /*
    This converts an array of 64 strings to a fen String
     */
    var arrayToFen = function (input) {
        var result = '';
        for(var i = 0; i < 8; i++) {
            var count = 0;
            for(var j = 0; j < 8; j++){
                if(input[(i*8)+j] === '') {
                    count++;
                }
                else {
                    if (count > 0)
                        result += count;
                    count = 0;
                    result += input[(i * 8) + j];
                }
            }
            if(count > 0)
                result += count;
            if(i !== 7)
                result += '/';
        }
        return result;
    };

    /*
    This converts an array of algebraic moves to a pgn string
     */
    var arrayToPgn = function (input) {
        var result = '';
        for(var i = 0; i < input.length; i++) {
            if(i % 2 === 0)
                result += ((i / 2) + 1) + '. ';
            result += input[i] + ' ';
        }
        return result;
    };

    //converts alegbraic notation to index for board
    var algebraicToIndex = function (input) {
        if(alpha.indexOf(input.charAt(0)) === -1)
            return -1;
        else if(isNaN(input.charAt(1)) || input.charAt(1) === '9' || input.charAt(1) === '0')
            return -1;
        else
            return alpha.indexOf(input.charAt(0)) + ((8 - input.charAt(1)) * 8);
    };

    //finds the piece at a specific x and y coordinate based off of algebraic notation
    var getPiece = function (square) {
        if(algebraicToIndex(square) === -1)
            return '';
        return board[algebraicToIndex(square)];
    };

    var isBlack = function (square) {
        return black.indexOf(getPiece(square)) > -1 && getPiece(square) !== '';
    };
    var isWhite = function (square) {
        return white.indexOf(getPiece(square)) > -1 && getPiece(square) !== '';
    };

    //checks if a piece can move based on algebraic notation
    var canMove = function (source, target) {
        var result = false;
        var math = algebraicToIndex(source) - algebraicToIndex(target);
        var hasMoved = true;
        var isBlocked = true;
        if(algebraicToIndex(source) === -1 || algebraicToIndex(target) === -1)
            return false;
        if(isBlack(source))
            if(isBlack(target))
                return false;
        if(isWhite(source))
            if(isWhite(target))
                return false;
        switch(getPiece(source)) {
            case 'p':
                if(algebraicToIndex(source) > 7 && algebraicToIndex(source) < 16) {
                    hasMoved = false;
                    if (getPiece(source.charAt(0) + (parseInt(source.charAt(1)) - 1)) === '')
                        isBlocked = false;
                }
                math *= -1;
            case 'P':
                if(algebraicToIndex(source) > 47 && algebraicToIndex(source) < 56) {
                    hasMoved = false;
                    if (getPiece(source.charAt(0) + (parseInt(source.charAt(1)) + 1)) === '')
                        isBlocked = false;
                }
                if(math === 8 && getPiece(target) === '') {
                    result = true;
                    if((algebraicToIndex(target) > -1 && algebraicToIndex(target) < 8) ||
                        (algebraicToIndex(target) > 55 && algebraicToIndex(target) < 64) )
                    { promotion.flag = true; promotion.index = algebraicToIndex(target); }
                    break;
                }
                else if(math === 16 && !hasMoved && getPiece(target) === '' && !isBlocked)
                    { result = true; break; }
                else if(math === 7 || math === 9){
                    if(enPassant(source, target)) { isEnPassant.flag = true; result = true; break; }
                    if (getPiece(target) !== '') { result = true; break; }
                }
                break;
        }
        return result;
    };

    //checks if a valid en passant move
    var enPassant = function (source, target) {
        var result = false;
        var ati = algebraicToIndex(source);
        var math = isEnPassant.direction = ati - algebraicToIndex(target);
        switch(math)
        {
            case -9:
                if(lastBoard[ati + 17] === 'P' && board[ati + 1] === 'P')
                    result = true;
                break;
            case -7:
                if(lastBoard[ati + 15] === 'P' && board[ati - 1] === 'P')
                    result = true;
                break;
            case 7:
                if(lastBoard[ati - 15] === 'p' && board[ati + 1] === 'p')
                    result = true;
                break;
            case 9:
                if(lastBoard[ati - 17] === 'p' && board[ati - 1] === 'p')
                    result = true;
                break;
        }
        return result;
    };
    //removes en passant piece
    var enPassantMove = function (source) {
        isEnPassant.flag = false;
        switch(isEnPassant.direction){
            case -9: case 7:
                board[algebraicToIndex(source) + 1] = ''; break;
            case -7: case 9:
                board[algebraicToIndex(source) - 1] = ''; break;
        }
    };

    //promotes the pawn at promotion.index
    var promote = function () {
        promotion.flag = false;
        // while(choice === '') {
        //     choice = prompt('Promote your pawn! Please type in what you want',
        //         'Queen, kNight, Rook, Bishop');
        //     choice = choice === null ? 'q' : choice.charAt(0).toLowerCase();
        //     switch (choice) {
        //         case 'q': case 'n': case 'r': case 'b': break;
        //         case 'k': choice = 'n'; break;
        //         default: alert('You have not typed in a valid choice.'); choice = '';
        //     }
        // }
        createPromotionBox();

    };

    var createPromotionBox = function () {
        var choice = '';
        var b = document.getElementById('button-container');
        var box = document.createElement('div');
        box.setAttribute('id', 'promotion-box');
        box.setAttribute('class','promotion');
        b.appendChild(box);
        var text = document.createElement('div');
        text.setAttribute('class','promotion-content');
        text.setAttribute('id', 'promotion-text');
        text.innerHTML = 'Promote your pawn!';
        box.appendChild(text);
        var min = document.createElement('div');
        min.setAttribute('id','promotion-min');
        min.setAttribute('class','promotion-min');
        min.innerHTML = '&minus;';
        var s = true;
        min.onclick = function() {
            //TODO add minimize function
            if(s)
                b.style.display = 'none';
            else
                b.style.display = 'block';
        };
        text.appendChild(min);
        text.innerHTML += '<br>';
        var images = ['Q', 'N', 'R', 'B'];
        for(var i in images) (function(i){
            var btn = document.createElement('button');
            btn.setAttribute('class','promotion-button');
            btn.setAttribute('id',images[i]+'btn');
            btn.onclick = function () {
                choice = images[i];
                if(promotion.index < 16)
                    choice = choice.toUpperCase();
                else
                    choice = choice.toLowerCase();
                history[history.length-1] += choice.toUpperCase();
                board[promotion.index] = choice;
                if(winCondition === 'promotion')
                    gameOver = true;
                deletePromotionBox();
            };
            text.appendChild(btn);
            var img = document.createElement('img');
            img.setAttribute('id',images[i]+'img');
            img.setAttribute('src','./img/chesspieces/wikipedia/' + getColor() + images[i] + '.png');
            img.setAttribute('class','promotion-image');
            btn.appendChild(img);
        })(i);
    };

    var deletePromotionBox = function () {
        var images = ['Q', 'N', 'R', 'B'];
        for(var i in images) {
            removeElement(images[i]+'img');
            removeElement(images[i]+'btn');
        }
        removeElement('promotion-min');
        removeElement('promotion-text');
        removeElement('promotion-box');
        onSnapEnd();
    };

    var removeElement = function (elementId) {
        var e = document.getElementById(elementId);
        e.parentNode.removeChild(e);
    };

    var pgnMove = function (source, target) {
        var result = '';
        if(getPiece(source).toLowerCase() !== 'p')
            result += getPiece(source).toUpperCase();
        if(getPiece(target) !== '' || isEnPassant.flag) {
            if (getPiece(source).toLowerCase() === 'p')
                result += source.charAt(0);
            result += 'x' + target;
            if (isEnPassant.flag)
                result += 'e.p.'
        } else
            result += target;
        if(promotion.flag)
            result += '=';
        history.push(result);
    };

    //converts input move to board move
    var moveBoard = function (source, target) {
        pgnMove(source, target);
        if(isEnPassant.flag)
            enPassantMove(source);
        if(promotion.flag)
            promote();
        lastBoard = board.slice(0);
        board[algebraicToIndex(target)] = board[algebraicToIndex(source)];
        board[algebraicToIndex(source)] = '';
    };

    var getColor = function() {
        return turn % 2 === 0 ? 'w' : 'b';
    };

////////////////////////////////////////////////////////////////////////////////////////
////    Public
////////////////////////////////////////////////////////////////////////////////////////

    this.fen = function() {
        return arrayToFen(board);
    };
    this.pgn = function() {
        return arrayToPgn(history);
    };
    this.setWinCondition = function(condition) {
        if(condition === 'promotion') {
            winCondition = condition;
        }
    };
    this.isGameOver = function() {
        return gameOver;
    }
    this.setPosition = function(fen) {
        initBoard(fen);
    };
    this.getWhosTurn = function() {
        return getColor();
    };
    this.getTurn = function() {
        var d = this.getWhosTurn() === 'b' ? .5 : 0;
        return (turn / 2) + 1 + d;
    };

    this.move = function(from, to) {
        var piece = getPiece(from);
        if(!canMove(from, to))
            return null;
        moveBoard(from, to);
        turn++;
        return arrayToFen(board);
    };

    this.undo = function() {

    }





};
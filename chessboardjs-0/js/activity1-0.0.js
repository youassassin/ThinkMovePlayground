var activity1StartingPos = '8/pppppppp/8/8/8/8/PPPPPPPP/8';
var game = new Chest(activity1StartingPos);
game.setWinCondition('promotion');
var reset = function() {
    board.position(activity1StartingPos, true);
    game.setPosition(activity1StartingPos);
    updateStatus();
};
var undo = function() {
    game.undo();
    onSnapEnd();
};
var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
//    $('#fen').html(ChessBoard.objToFen(newPos));
    var move = game.move(source, target);

    // illegal move
    if (move === null) return 'snapback';

};
var onSnapEnd = function() {
    game.get();
    board.position(game.fen());
    updateStatus();
};
var onDragStart = function(source, piece, position, orientation) {
    // if (game.isGameOver() ||
    //     (game.getWhosTurn() === 'w' && piece.search(/^b/) !== -1) ||
    //     (game.getWhosTurn() === 'b' && piece.search(/^w/) !== -1)) {
    //    return false;
    // }
};
var cfg = {
    draggable: true,
    position: activity1StartingPos,
    onDrop: onDrop,
//    onDragMove: onDragMove,
    onDragStart: onDragStart,
    onSnapEnd: onSnapEnd
};
var updateStatus = function (value) {
    var color = game.getWhosTurn() === 'w' ? 'White' : 'Black';
    var status = ' to move';
    if(game.isGameOver()) {
        status = ' wins!';
        color = color === 'White' ? 'Black' : 'White';
    }
    board.resize();
    $('#status').html(color + status);
    $('#pgn').html('Portable Game Notation (PGN):<br>' + game.pgn());
    $('#fen').html('Forsyth-Edwards Notation (FEN):<br>' + game.fen());
};

var resize = function () {
    var size = ['300px', '450px', '600px', '800px'];
    var currentSize = size.indexOf(document.getElementById('board').style.maxWidth);
    var i = currentSize === size.length - 1 ? 0 : currentSize + 1;
    document.getElementById('board').style.maxWidth = size[i];
    document.getElementById('button-container').style.maxWidth = size[i];
    document.getElementById('notation').style.maxWidth = size[i];
    onSnapEnd();
};

var board = ChessBoard('board', cfg);
$('#orientationBtn').on('click', board.flip);
$('#resetBtn').on('click', reset);
$('#sizeBtn').on('click', resize);
$('#undoBtn').on('click', undo);

window.onresize = function() {
    document.getElementById('board').style.maxWidth = $(window).resize(window.width);
    document.getElementById('button-container').style.maxWidth = $(window).resize(window.width);
    document.getElementById('notation').style.maxWidth = $(window).resize(window.width);
    board.resize();
    updateStatus();
};
updateStatus();
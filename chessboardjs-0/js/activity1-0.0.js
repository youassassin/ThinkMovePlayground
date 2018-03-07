var activity1StartingPos = '8/pppppppp/8/8/8/8/PPPPPPPP/8';
var game = new Chest(activity1StartingPos);
game.setWinCondition('promotion');
var reset = function() {
    board.position(activity1StartingPos, true);
    game.setPosition(activity1StartingPos);
    updateStatus();
}
var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
//    $('#fen').html(ChessBoard.objToFen(newPos));
    var move = game.move(source, target);

    // illegal move
    if (move === null) return 'snapback';

    updateStatus(move);
};
var onSnapEnd = function() {
    game.get();
    board.position(game.fen());
}
var onDragStart = function(source, piece, position, orientation) {
    if (game.isGameOver() === true ||
        (game.getWhosTurn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.getWhosTurn() === 'b' && piece.search(/^w/) !== -1)) {
       return false;
    }
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
    $('#status').html((game.getWhosTurn() === 'w' ? 'White' : 'Black') + ' to move');
    $('#fen').html('Forsyth-Edwards Notation:<br>' + game.fen());
    $('#pgn').html('Portable Game Notation (PGN):<br>' + game.pgn());
};

var board = ChessBoard('board', cfg);
$('#orientationBtn').on('click', board.flip);
$('#resetBtn').on('click', reset);

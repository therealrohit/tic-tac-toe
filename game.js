(function (root) {
  'use strict';
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function result(board) {
    for (const line of lines) {
      if (board[line[0]] && line.every(i => board[i] === board[line[0]])) return { winner: board[line[0]], line };
    }
    return board.every(Boolean) ? { winner: 'draw', line: [] } : null;
  }
  const available = board => board.flatMap((value, i) => value ? [] : [i]);
  const other = side => side === 'X' ? 'O' : 'X';
  function minimax(board, turn, bot, depth) {
    const outcome = result(board);
    if (outcome) return outcome.winner === 'draw' ? 0 : outcome.winner === bot ? 10 - depth : depth - 10;
    const scores = available(board).map(i => {
      board[i] = turn;
      const score = minimax(board, other(turn), bot, depth + 1);
      board[i] = null;
      return score;
    });
    return turn === bot ? Math.max(...scores) : Math.min(...scores);
  }
  function chooseMove(board, bot, level, random = Math.random) {
    if (result(board)) return null;
    const moves = available(board);
    const randomMove = () => moves[Math.min(moves.length - 1, Math.floor(random() * moves.length))];
    if (level === 'easy' || (level === 'medium' && random() < 0.35)) return randomMove();
    let bestScore = -Infinity;
    let bestMoves = [];
    for (const i of moves) {
      const copy = board.slice();
      copy[i] = bot;
      const score = minimax(copy, other(bot), bot, 0);
      if (score > bestScore) { bestScore = score; bestMoves = [i]; }
      else if (score === bestScore) bestMoves.push(i);
    }
    return bestMoves[Math.min(bestMoves.length - 1, Math.floor(random() * bestMoves.length))];
  }
  const api = { result, chooseMove, other };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TicTacToe = api;
})(typeof window !== 'undefined' ? window : globalThis);

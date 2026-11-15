const { test } = require('node:test');
const assert = require('node:assert/strict');
const { result, chooseMove, other } = require('./game.js');

test('recognizes every winning line, draws, and unfinished boards', () => {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const side of ['X', 'O']) for (const line of lines) {
    const board = Array(9).fill(null); line.forEach(i => board[i] = side);
    assert.deepEqual(result(board), { winner: side, line });
  }
  assert.equal(result(Array(9).fill(null)), null);
  assert.equal(result(['X','O','X','X','O','O','O','X','X']).winner, 'draw');
});
test('bot wins immediately, blocks threats, and leaves input untouched', () => {
  const board = ['O','O',null,'X',null,'X',null,null,null];
  const original = board.slice();
  assert.equal(chooseMove(board, 'O', 'hard'), 2);
  assert.deepEqual(board, original);
  assert.equal(chooseMove(['X','X',null,null,'O',null,null,null,null], 'O', 'hard'), 2);
  assert.equal(chooseMove(['X','X','X',null,'O','O',null,null,null], 'O', 'hard'), null);
});
test('every difficulty returns legal moves', () => {
  const board = ['X',null,'O',null,'X',null,null,'O',null];
  for (const level of ['easy','medium','hard']) for (const value of [0, 0.2, 0.5, 0.99]) {
    const move = chooseMove(board, 'O', level, () => value);
    assert.ok(Number.isInteger(move) && !board[move]);
  }
});
test('hard bot cannot lose against any human move, playing as X or O', () => {
  let endings = 0;
  function explore(board, turn, bot) {
    const outcome = result(board);
    if (outcome) { assert.notEqual(outcome.winner, other(bot)); endings++; return; }
    const moves = turn === bot ? [chooseMove(board, bot, 'hard', () => 0)] : board.flatMap((v,i) => v ? [] : [i]);
    for (const i of moves) { const next = board.slice(); next[i] = turn; explore(next, other(turn), bot); }
  }
  explore(Array(9).fill(null), 'X', 'X');
  explore(Array(9).fill(null), 'X', 'O');
  assert.ok(endings > 100);
});

(() => {
  'use strict';
  const { result, chooseMove, other } = window.TicTacToe;
  const $ = selector => document.querySelector(selector);
  const cells = [...document.querySelectorAll('[data-cell]')];
  let board = Array(9).fill(null), player = 'X', level = 'medium', turn = 'X', round = 1, timer = null, scored = false;
  let sound = false, audioContext;
  let scores = { player: 0, bot: 0, draw: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem('crossplay-scores'));
    if (saved && Object.keys(scores).every(key => Number.isSafeInteger(saved[key]) && saved[key] >= 0)) scores = saved;
  } catch { /* Storage is optional, including when opening a local file. */ }
  function renderScores() {
    for (const key of ['player', 'bot', 'draw']) $(`#${key}-score`).textContent = scores[key];
    try { localStorage.setItem('crossplay-scores', JSON.stringify(scores)); } catch { /* Continue without persistence. */ }
  }
  function playTone(frequency) {
    if (!sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume();
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.06, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + 0.15);
    } catch { /* Sound is an optional enhancement. */ }
  }
  function render() {
    const outcome = result(board), thinking = !outcome && turn !== player;
    cells.forEach((cell, i) => {
      cell.replaceChildren();
      if (board[i]) { const mark = document.createElement('span'); mark.className = `mark mark-${board[i].toLowerCase()}`; cell.append(mark); }
      cell.classList.toggle('winning', !!outcome?.line.includes(i));
      cell.classList.toggle('preview-o', player === 'O');
      cell.disabled = !!board[i] || thinking || !!outcome;
      cell.setAttribute('aria-label', `Row ${Math.floor(i / 3) + 1}, column ${i % 3 + 1}: ${board[i] || 'empty'}`);
    });
    $('#round-label').textContent = `ROUND ${String(round).padStart(2, '0')}`;
    $('#turn-pill').classList.toggle('thinking', thinking);
    const pillText = outcome ? 'ROUND COMPLETE' : thinking ? 'BOT IS THINKING' : 'YOUR TURN';
    $('#turn-pill').replaceChildren(Object.assign(document.createElement('span'), {}), document.createTextNode(pillText));
    if (outcome) {
      const draw = outcome.winner === 'draw', won = outcome.winner === player;
      $('#status').textContent = draw ? 'A well-matched rivalry.' : won ? 'Human instinct wins.' : 'This one goes to the bot.';
      $('#status-detail').textContent = draw ? 'A draw. There’s always the next round.' : won ? 'Nicely played. Ready to do it again?' : 'Every good rivalry deserves a rematch.';
      if (!scored) { scored = true; scores[draw ? 'draw' : won ? 'player' : 'bot']++; renderScores(); playTone(won ? 660 : 330); }
    } else {
      $('#status').textContent = thinking ? 'The gears are turning…' : board.some(Boolean) ? 'Make your next move.' : 'The board is yours.';
      $('#status-detail').textContent = thinking ? 'A little strategy takes a moment.' : board.some(Boolean) ? 'Three in a row. You’ve got this.' : 'Pick a square to get things started.';
    }
  }
  function queueBot() {
    if (turn === player || result(board)) return;
    timer = setTimeout(() => {
      const move = chooseMove(board, other(player), level);
      if (move !== null) board[move] = other(player);
      turn = player; playTone(330); render();
    }, 550);
  }
  function newRound(increment = true) {
    clearTimeout(timer); board = Array(9).fill(null); turn = 'X'; scored = false;
    if (increment) round++;
    render(); queueBot();
  }
  cells.forEach((cell, i) => cell.addEventListener('click', () => {
    if (board[i] || turn !== player || result(board)) return;
    board[i] = player; turn = other(player); playTone(460); render(); queueBot();
  }));
  document.querySelectorAll('[data-side]').forEach(button => button.addEventListener('click', () => {
    if (player === button.dataset.side) return;
    player = button.dataset.side;
    document.querySelectorAll('[data-side]').forEach(option => { const active = option.dataset.side === player; option.classList.toggle('selected', active); option.setAttribute('aria-pressed', active); });
    $('#your-side').textContent = `Playing as ${player}`; $('#bot-side').textContent = `Playing as ${other(player)}`;
    $('.you .score-symbol').textContent = player === 'X' ? '×' : '○'; $('.bot .score-symbol').textContent = player === 'X' ? '○' : '×';
    newRound();
  }));
  const descriptions = { easy: 'Just warming up. Plenty of room to outsmart it.', medium: 'A worthy opponent. With a few blind spots.', hard: 'Perfect play. A draw is a victory in disguise.' };
  document.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => {
    if (level === button.dataset.level) return;
    level = button.dataset.level;
    document.querySelectorAll('[data-level]').forEach(option => { const active = option.dataset.level === level; option.classList.toggle('selected', active); option.setAttribute('aria-pressed', active); });
    $('#difficulty-description').textContent = descriptions[level]; newRound();
  }));
  $('#new-round').addEventListener('click', () => newRound());
  $('#reset-score').addEventListener('click', () => { scores = { player: 0, bot: 0, draw: 0 }; round = 1; renderScores(); newRound(false); });
  $('#sound').addEventListener('click', () => {
    sound = !sound; $('#sound').setAttribute('aria-pressed', sound); $('#sound').setAttribute('aria-label', sound ? 'Turn sound off' : 'Turn sound on');
    $('#sound-waves').setAttribute('d', sound ? 'M15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14' : 'm16 9 5 6m0-6-5 6'); playTone(460);
  });
  const dialog = $('#help-dialog');
  $('#help').addEventListener('click', () => dialog.showModal());
  $('.dialog-close').addEventListener('click', () => dialog.close()); $('#got-it').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  document.addEventListener('keydown', event => { if (event.key.toLowerCase() === 'n' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !dialog.open) { event.preventDefault(); newRound(); } });
  renderScores(); render();
})();

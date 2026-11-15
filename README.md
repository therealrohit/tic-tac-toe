# Crossplay

A small browser tic-tac-toe game. Play against a bot with easy, medium, or unbeatable hard difficulty.

## Play

Open **index.html** in your browser. No build, dependencies, or server required. An internet connection is optional for the Google Fonts; system fonts are used offline.

- Choose X to go first or O to let the bot start.
- Changing your side or difficulty starts a fresh round.
- Press **N** or click **New round** to restart.
- Scores are saved in this browser when local storage is available. **Reset scores** clears the tally and restarts the game.
- Toggle sound with the speaker button. The question mark opens the rules.
- Keyboard: Tab to a square, Enter or Space to play; Escape closes the instructions.

## Check the bot

Run `npm test` (Node.js 18+). The tests cover wins, draws, legal moves, and every human response against hard mode for both sides.

Built with plain HTML, CSS, and JavaScript. All gameplay runs locally.

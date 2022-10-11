// object and methods to initialize and display gameBoard
const game = (() => {
  let gameBoard = ["", "", "", "", "", "", "", "", ""]; // game board array
  let positionResidue = [...Array(9).keys()]; // left-over playable elements
  let gameEnd = false; // toggle for game status (true / false)

  const gameCells = document.querySelectorAll(".grid-item");
  const displayController = (reset = false) => {
    // console.log(`drawing on board with ${gameBoard}`);
    // draws elements from gameBoard onto the view
    gameBoard.map((item, index) => {
      const gameCell = gameCells[index];
      if (gameCell.innerText === "") {
        // prevent duplicate child write
        const insertCell = document.createTextNode(item);
        gameCell.appendChild(insertCell);
      } else if (reset) {
        // if reset is true, make all elements empty
        gameCell.innerText = "";
      }
    });
  };

  const resetGameBoard = function () {
    // resets the game board
    gameBoard = ["", "", "", "", "", "", "", "", ""];
    positionResidue = [...Array(9).keys()];
    this.gameEnd = false;
    displayController(true);
  };

  const getPositionResidue = () => positionResidue;

  const updateGameBoard = (playPosition, tool) => {
    // updates the gameBoard given position and player tool element
    gameBoard[playPosition] = tool;
    positionResidue = positionResidue.filter((cell) => {
      // update game position residue
      return cell !== playPosition;
    });
  };

  const winningCombinations = [
    // winning combinations used to determine winner
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const getWinningCombinations = () => winningCombinations;

  return {
    // export all public functions and variables
    updateGameBoard,
    resetGameBoard,
    getPositionResidue,
    getWinningCombinations,
    displayController,
    gameEnd,
  };
})();

const Player = (tool, name = "player") => {
  let playHistory = []; // player's history
  const getTool = () => tool; // O or X
  const getPlayHistory = () => playHistory;
  const resetPlayHistory = () => (playHistory = []); // replay player's history

  const updateBoard = (playPosition) => {
    // updates player's playHistory given position, calls game function
    playHistory.push(playPosition);
    game.updateGameBoard(playPosition, tool);
    game.displayController(); // displays output
    checkWin(); // checks if anyone is winner every turn
  };

  const checkWin = () => {
    for (combination of game.getWinningCombinations()) {
      // use intersections to see who won
      const intersection = playHistory.filter((element) =>
        combination.includes(element)
      );
      if (intersection.length === 3) {
        // console.log(intersection);
        return win();
      }
    }
    if (game.getPositionResidue().length == 0) {
      // if there are no more ways to play, it is a draw
      return draw();
    }
  };

  const playGame = () => {
    // main function for player or computer to play
    // returns promise for async function's await
    // one player's play will come after another player's
    return new Promise(function play(resolve) {
      if (game.gameEnd) return resolve();
      if (name === "computer") {
        // if player is computer, play random position based on positionResidue
        setTimeout(() => {
          const playPosition =
            game.getPositionResidue()[
              Math.floor(Math.random() * game.getPositionResidue().length)
            ];
          updateBoard(playPosition);
          resolve();
        }, 500);
      } else if (name == "player") {
        // wait for user input!
        const grid = document.getElementById("game-grid");
        grid.addEventListener(
          "click",
          (e) => {
            if (
              e.target.id &&
              game
                .getPositionResidue()
                .includes(+e.target.id.replace(/^\D+/g, ""))
            ) {
              const playPosition = +e.target.id.replace(/^\D+/g, "");
              updateBoard(playPosition);
              resolve();
            } else {
              play(resolve);
            }
          },
          { once: true }
        );
      }
    });
  };

  const win = () => {
    // the player will win!
    game.gameEnd = true;
    document.getElementById(
      "show-result"
    ).innerHTML = `<h1>${name} wins the game!</h1>`;
    // console.log(`${name} wins the game!`);
  };

  const draw = () => {
    // it is a draw
    game.gameEnd = true;
    document.getElementById("show-result").innerHTML = `<h1>It's a draw!</h1>`;
    // console.log(`It's a draw!`);
  };

  return { getTool, getPlayHistory, resetPlayHistory, playGame };
};

const Controller = () => {
  // controller function to overlook game play
  // bottom values are changeable (TODO)
  const player = Player("O", "player");
  const computer = Player("X", "computer");

  const startGame = async () => {
    while (game.getPositionResidue().length > 0 && !game.gameEnd) {
      await player.playGame();
      await computer.playGame();
      console.log(`player history ${player.getPlayHistory()}`);
      console.log(`computer history ${computer.getPlayHistory()}`);
    }
    // console.log("game over!");
  };

  document.getElementById("reset").addEventListener("click", () => {
    console.log("clicked reset!");
    game.resetGameBoard();
    player.resetPlayHistory();
    computer.resetPlayHistory();
    document.getElementById("show-result").innerHTML = "";
    startGame();
  });

  return { startGame };
};

// check to see if the game works
const control = Controller();
control.startGame();

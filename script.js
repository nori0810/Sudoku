// ========================================
// DOM
// ========================================

const boardElement = document.getElementById("board");
const numbersElement = document.getElementById("numbers");
const messageElement = document.getElementById("message");
const timerElement = document.getElementById("timer");
const difficultyElement = document.getElementById("difficulty");


// ========================================
// ゲームデータ
// ========================================

let puzzle = [];
let solution = [];
let board = [];
let fixed = [];

let selectedCell = null;

let seconds = 0;
let timer = null;


// ========================================
// 空の盤面を作る
// ========================================

function createEmptyBoard() {
  return Array.from(
    { length: 9 },
    () => Array(9).fill(0)
  );
}


// ========================================
// 配列をシャッフル
// ========================================

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] =
      [result[j], result[i]];
  }

  return result;
}


// ========================================
// 数字を置けるか確認
// ========================================

function isValid(board, row, col, num) {

  // 横
  for (let c = 0; c < 9; c++) {

    if (board[row][c] === num) {
      return false;
    }
  }


  // 縦
  for (let r = 0; r < 9; r++) {

    if (board[r][col] === num) {
      return false;
    }
  }


  // 3×3
  const startRow =
    Math.floor(row / 3) * 3;

  const startCol =
    Math.floor(col / 3) * 3;


  for (
    let r = startRow;
    r < startRow + 3;
    r++
  ) {

    for (
      let c = startCol;
      c < startCol + 3;
      c++
    ) {

      if (board[r][c] === num) {
        return false;
      }
    }
  }


  return true;
}


// ========================================
// 数独を解く
// ========================================

function solve(board) {

  for (let row = 0; row < 9; row++) {

    for (let col = 0; col < 9; col++) {

      if (board[row][col] !== 0) {
        continue;
      }


      const numbers =
        shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);


      for (const num of numbers) {

        if (isValid(board, row, col, num)) {

          board[row][col] = num;


          if (solve(board)) {
            return true;
          }


          board[row][col] = 0;
        }
      }


      return false;
    }
  }


  return true;
}


// ========================================
// 問題を作成
// ========================================

function generatePuzzle() {

  const solved = createEmptyBoard();

  solve(solved);


  // 正解を保存
  solution =
    solved.map(row => [...row]);


  // 問題をコピー
  puzzle =
    solved.map(row => [...row]);


  // 難易度によって穴を開ける数を変更
  let removeCount;


  switch (difficultyElement.value) {

    case "easy":
      removeCount = 35;
      break;

    case "hard":
      removeCount = 55;
      break;

    default:
      removeCount = 45;
  }


  let removed = 0;


  while (removed < removeCount) {

    const row =
      Math.floor(Math.random() * 9);

    const col =
      Math.floor(Math.random() * 9);


    if (puzzle[row][col] !== 0) {

      puzzle[row][col] = 0;

      removed++;
    }
  }


  // 現在の盤面
  board =
    puzzle.map(row => [...row]);


  // 最初から入っていた数字
  fixed =
    puzzle.map(row =>
      row.map(value => value !== 0)
    );
}


// ========================================
// 盤面を表示
// ========================================

function renderBoard() {

  boardElement.innerHTML = "";


  for (let row = 0; row < 9; row++) {

    for (let col = 0; col < 9; col++) {

      const cell =
        document.createElement("div");


      cell.className = "cell";


      const value =
        board[row][col];


      // 最初から入っていた数字
      if (fixed[row][col]) {

        cell.classList.add("fixed");
      }


      // 選択中
      if (
        selectedCell &&
        selectedCell.row === row &&
        selectedCell.col === col
      ) {

        cell.classList.add("selected");
      }


      // 同じ数字をハイライト
      if (
        selectedCell &&
        value !== 0 &&
        value ===
          board[
            selectedCell.row
          ][
            selectedCell.col
          ]
      ) {

        cell.classList.add("same-number");
      }


      // 数字を表示
      if (value !== 0) {

        cell.textContent = value;
      }


      // クリック
      cell.addEventListener(
        "click",
        () => {

          if (fixed[row][col]) {
            return;
          }


          selectedCell = {
            row,
            col
          };


          renderBoard();
        }
      );


      boardElement.appendChild(cell);
    }
  }
}


// ========================================
// 数字ボタンを作る
// ========================================

function renderNumberButtons() {

  numbersElement.innerHTML = "";


  for (let num = 1; num <= 9; num++) {

    const button =
      document.createElement("button");


    button.className =
      "number-btn";


    button.textContent = num;


    button.addEventListener(
      "click",
      () => {

        inputNumber(num);
      }
    );


    numbersElement.appendChild(button);
  }
}


// ========================================
// 数字入力
// ========================================

function inputNumber(num) {

  if (!selectedCell) {

    showMessage(
      "マスを選択してください",
      "warning"
    );

    return;
  }


  const {
    row,
    col
  } = selectedCell;


  if (fixed[row][col]) {
    return;
  }


  board[row][col] = num;


  // 正解か確認
  if (num !== solution[row][col]) {

    showMessage(
      "その数字は違います",
      "warning"
    );

  } else {

    clearMessage();
  }


  renderBoard();

  checkComplete();
}


// ========================================
// 消す
// ========================================

document
  .getElementById("erase")
  .addEventListener("click", () => {

    if (!selectedCell) {
      return;
    }


    const {
      row,
      col
    } = selectedCell;


    if (fixed[row][col]) {
      return;
    }


    board[row][col] = 0;


    clearMessage();

    renderBoard();
  });


// ========================================
// ヒント
// ========================================

document
  .getElementById("hint")
  .addEventListener("click", () => {

    if (!selectedCell) {

      showMessage(
        "マスを選択してください",
        "warning"
      );

      return;
    }


    const {
      row,
      col
    } = selectedCell;


    if (fixed[row][col]) {
      return;
    }


    board[row][col] =
      solution[row][col];


    renderBoard();

    checkComplete();
  });


// ========================================
// クリア判定
// ========================================

function checkComplete() {

  for (let row = 0; row < 9; row++) {

    for (let col = 0; col < 9; col++) {

      if (
        board[row][col] !==
        solution[row][col]
      ) {

        return;
      }
    }
  }


  stopTimer();


  showMessage(
    `🎉 クリア！ タイム ${formatTime(seconds)}`,
    "success"
  );
}


// ========================================
// メッセージ
// ========================================

function showMessage(text, type) {

  messageElement.textContent = text;

  messageElement.className =
    "message " + type;
}


function clearMessage() {

  messageElement.textContent = "";

  messageElement.className =
    "message";
}


// ========================================
// タイマー
// ========================================

function formatTime(totalSeconds) {

  const minutes =
    Math.floor(totalSeconds / 60);

  const secs =
    totalSeconds % 60;


  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}


function startTimer() {

  stopTimer();


  timer = setInterval(() => {

    seconds++;

    timerElement.textContent =
      formatTime(seconds);

  }, 1000);
}


function stopTimer() {

  if (timer) {

    clearInterval(timer);

    timer = null;
  }
}


// ========================================
// 新しいゲーム
// ========================================

function newGame() {

  stopTimer();


  seconds = 0;

  timerElement.textContent =
    "00:00";


  selectedCell = null;


  clearMessage();


  generatePuzzle();

  renderBoard();

  renderNumberButtons();


  startTimer();
}


// 新しいゲーム
document
  .getElementById("newGame")
  .addEventListener(
    "click",
    newGame
  );


// 難易度変更
difficultyElement
  .addEventListener(
    "change",
    newGame
  );


// ========================================
// キーボード入力
// ========================================

document.addEventListener(
  "keydown",
  (event) => {

    if (!selectedCell) {
      return;
    }


    const key = event.key;


    // 1〜9
    if (/^[1-9]$/.test(key)) {

      inputNumber(
        Number(key)
      );
    }


    // 削除
    if (
      key === "Backspace" ||
      key === "Delete" ||
      key === "0"
    ) {

      const {
        row,
        col
      } = selectedCell;


      if (!fixed[row][col]) {

        board[row][col] = 0;

        renderBoard();
      }
    }
  }
);


// ========================================
// ゲーム開始
// ========================================

newGame();

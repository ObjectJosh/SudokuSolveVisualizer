let sudoku = [
  [3, 8, 5, 0, 0, 0, 0, 0, 0],
  [9, 2, 1, 0, 0, 0, 0, 0, 0],
  [6, 4, 7, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 3, 0, 0, 0],
  [0, 0, 0, 7, 8, 4, 0, 0, 0],
  [0, 0, 0, 6, 9, 5, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 8, 7, 3],
  [0, 0, 0, 0, 0, 0, 9, 6, 2],
  [0, 0, 0, 0, 0, 0, 1, 4, 5],
]
let gridx = 603;
let gridy = 603;
let gap = Math.PI/3;
let change = 0.2;
let turn = false;
let pos = new Proxy({
  pos: 0
}, {
  get(target, prop, receiver) {
    if (prop == 0 || prop === "row" || prop === "r")
      return Math.floor(target.pos / sudoku[0].length);
    if (prop == 1 || prop === "column" || prop === "c")
      return target.pos % sudoku[0].length;
    return Reflect.get(...arguments);
  },
  set(target, prop, value) {
    if (prop == 0 || prop === "row" || prop === "r") {
      target.pos = pos.column + value * sudoku[0].length;
      return true;
    }
    if (prop == 1 || prop === "column" || prop === "c") {
      target.pos = pos.row * sudoku[0].length + value;
      return true;
    }
    return Reflect.set(...arguments);
  }
});
let positions = [];
let valid = sudoku.map(row => row.map(cell => cell > 0));

function setup() {
  createCanvas(gridx, gridy);
  stroke(0);
  frameRate(20);
}

function draw() {
  background(255);
  drawGrid(sudoku);
  showVisuals(sudoku);
  showPac();
  mapNums(sudoku);
  
  if (valid[pos[0]][pos[1]] == false)
    solve(sudoku);
  else
    pos.pos++; // Because I'm just saving it as a single value I can simply increment it.

  if (pos.r >= sudoku.length) // If pos is outside of the board we are done.
    noLoop();
}

function drawGrid(board) {
  let x1 = 0;
  let x2 = gridx
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < (board.length + 1); i++) {
    if (y1 % (gridx / 3) / 3 == 0)
      strokeWeight(3);
    else
      strokeWeight(1);
    line(x1, y1, x2, y2);
    line(y1, x1, y2, x2);
    y1 += gridy / board.length;
    y2 += gridy / board.length;
  }
}

function mapNums(board) {
  let x1 = gridx / 9 - (0.5 * (gridx / 9));
  let y1 = gridy / 9 - (0.5 * (gridy / 9));
  strokeWeight(2);
  textSize(40);
  textAlign(CENTER, CENTER);
  fill(0);
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col] != 0)
        text(board[row][col], x1, y1);
      x1 += gridx / 9;
    }
    y1 += gridy / 9;
    x1 = gridx / 9 - (0.5 * (gridx / 9));
  }
}

function showVisuals(board) {
  let x1 = gridx / 9 - (0.5 * (gridx / 9));
  let y1 = gridy / 9 - (0.5 * (gridy / 9));
  strokeWeight(2);
  textSize(40);
  textAlign(CENTER, CENTER);
  fill(0);
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col] == 0) {
        push();
        strokeWeight(1);
        fill(240, 245, 91);
        ellipse(x1, y1, 10);
        pop();
      }
      x1 += gridx / 9;
    }
    y1 += gridy / 9;
    x1 = gridx / 9 - (0.5 * (gridx / 9));
  }
}

function solve(board) {
  while (true) {
    board[pos.r][pos.c]++; // Increment the number by one.
    board[pos.r][pos.c] %= 10; // Make the number 0 if it is 10.
    if (board[pos.r][pos.c] === 0) {// If it is 0 all numbers have been tried unsuccessfully so a previous number has to change.
      pos.pos = positions.pop(); // Backtrack to the last position.
      gap = 2*Math.PI/3 + change;
      turn = true;
      break;
    } else if (isValid(pos.r, pos.c, board)) {// The number is valid continue to the next one.
      positions.push(pos.pos);
      turn = false;
      gap = Math.PI/3 + change;
      pos.pos++;
      break;
    }
  }
  return false;
}

function isValid(row, col, board) {
  let num = board[row][col];
  for (let c = 0; c < board[0].length; c++) {
    if (board[row][c] == num && c !== col)
      return false;
  }
  for (let r = 0; r < board.length; r++) {
    if (board[r][col] == num && r !== row)
      return false;
  }
  let row_pos = Math.floor(row / 3);
  let col_pos = Math.floor(col / 3);
  let start_row = row_pos * 3;
  let start_col = col_pos * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[(r + start_row)][(c + start_col)] == num && !((r + start_row === row) && (c + start_col === col))) {
        return false;
      }
    }
  }
  return true;
}

function isCompleted(board) {
  for (let r = 0; r < board[0].length; r++) {
    for (let c = 0; c < board.length; c++) {
      if (board[r][c] == 0) {
        return [r, c];
      }
    }
  }
  return [-1, -1];
}

function showPac(){
  let x = (gridx / 9 - (0.5 * (gridx / 9))) + (pos[1] * gridx / 9);
  let y = gridy / 9 - (0.5 * (gridy / 9)) + (pos[0] * gridy / 9);
  fill(248, 255, 21);
  strokeWeight(1);
  if(turn){
    if (gap < 2*PI/3 + 0.2) {
      change = 0.2;
    }else if (gap > PI - 0.2) {
      change = -0.2;
    }
    arc(x, y, 50, 50, -gap, gap, PIE);
  }else{
    if (gap > PI/3 - 0.2) {
      change = -0.2;
    }else if (gap < 0.2) {
      change = 0.2;
    }
    arc(x, y, 50, 50, gap, -gap, PIE); 
  }
  gap += change;
}
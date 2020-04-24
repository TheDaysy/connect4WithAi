let gameBoard = []
let players = []
let currentPlayer
let endGame = false

function setup() {
  canvas = createCanvas(400,400)
  players.push({
    id:0,
    color:'red',
    name:'red',
    playerType:'Human',
    ai:null
  })
  players.push({
    id:1,
    color:'yellow',
    name:'yellow',
    playerType:'Human',
    ai:null
  })
  //create inputs and outputs
  let player0Div = createDiv('Red')
  player0Div.id('player0Div')
  player0Select = createSelect()
  player0Select.parent('player0Div')
  player0Select.class('player0')
  player0Select.option('Human')
  player0Select.option('Random')
  player0Select.changed(newPlayerType)
  let player1Div = createDiv('Yellow')
  player1Div.id('player1Div')
  player1Select = createSelect()
  player1Select.parent('player1Div')
  player1Select.class('player1')
  player1Select.option('Human')
  player1Select.option('Random')
  player1Select.changed(newPlayerType)
  whosTurn = createP('The game is yet to begin')
  startGameButton = createButton('Start new game')
  startGameButton.mousePressed(newGame)
  ellipseMode(CORNER)
}

function newPlayerType() {
  if (this.class() == 'player0') {
    players[0].playerType = this.selected()
    if (this.selected() == 'Human') {
      players[0].ai = null
    } else if (this.selected() == 'Random') {
      players[0].ai = new randomAi(0)
    }
  } else {
    players[1].playerType = this.selected()
    if (this.selected() == 'Human') {
      players[1].ai = null
    } else if (this.selected() == 'Random') {
      players[1].ai = new randomAi(1)
    }
  }
}

function newGame() {
  background('white')
  strokeWeight(3)
  stroke('black')
  //draw cols
  for (let i = 0; i < 8; i++) {
    line((width/7)*i, 0, (width/7)*i, height)
  }
  //draw rows
  for (let i = 0; i < 7; i++) {
    line(0, (height/6)*i, width, (height/6)*i)
  }
  //set up board
  gameBoard = []
  for (let i = 0; i < 7; i++) {
    gameBoard.push([]);
  }
  currentPlayer = floor(random(2)) // random player to play first
  whosTurn.html(`It's ${players[currentPlayer].name}'s turn`)
  startGameButton.hide()
  endGame = false
  if (players[currentPlayer].playerType != 'Human') {//tell ai player to take move if they are first
    setTimeout(function(){players[currentPlayer].ai.turn()},500)
  }
}

function mouseClicked(){
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    for (let i = 0; i < 7; i++) {
      if (mouseX > (width/7)*i && mouseX < (width/7)*(i+1)) {
        makeMove(i,currentPlayer)
      }
    }
  }
}

function makeMove(col,playerId) {
  if (!endGame && gameBoard[col].length < 6) {
    noStroke()
    fill(players[playerId].color);
    let x = (width/7)*col
    let y = height-((height/6)*(gameBoard[col].length + 1))
    ellipse(x, y, min(width/7,height/6))
    gameBoard[col].push(new token(playerId,col,gameBoard[col].length))//push new move
    currentPlayer = (currentPlayer + 1) % 2//passes turn
    whosTurn.html(`It's ${players[currentPlayer].name}'s turn`)
    let winstate = gameOver(gameBoard)
    if (winstate.win == 'win') {
      startGameButton.show()
      whosTurn.html(`the winner is ${players[winstate.id].name}`)
      endGame = true
    }
    if (winstate.win == 'tie') {
      startGameButton.show()
      whosTurn.html(`It's a tie`)
      endGame = true
    }
    if (players[currentPlayer].playerType != 'Human') {//tell ai player to take move if they are next
      setTimeout(function(){players[currentPlayer].ai.turn()},500)
    }
  }
}

function gameOver(board) {
  let isWinner = {id : null,win : ' '}
  let fullcols = 0
  for (let i = 0; i < board.length; i++) {
    if (board[i].length == 6) {
      fullcols += 1
    }
    board[i].forEach(element => {
      if (element.lastMove) {//find last move
        if(element.winCheck(0,board)||element.winCheck(4,board)){//check diagonal topleft btmright
          if (1 + element.winCheck(0,board) + element.winCheck(4,board) > 3) {
            isWinner.id = element.playerId
            isWinner.win = 'win'
          }
        }
        if (element.winCheck(2,board)||element.winCheck(6,board)) {//check diagonal btmleft topright
          if (1 + element.winCheck(2,board) + element.winCheck(6,board) > 3) {
            isWinner.id = element.playerId
            isWinner.win = 'win'
          }
        }
        if(element.winCheck(3,board)||element.winCheck(7,board)){//check horizontal
          if (1 + element.winCheck(3,board) + element.winCheck(7,board) > 3) {
            isWinner.id = element.playerId
            isWinner.win = 'win'
          }
        }
        if(element.winCheck(5,board)){//check vertical
          if (1 + element.winCheck(5,board) > 3) {
            isWinner.id = element.playerId
            isWinner.win = 'win'
          }
        }
        element.lastMove = false
      }
    });
  }
  if (fullcols == 7 && isWinner.win === ' ') {
    isWinner.win = 'tie'
  }
  return isWinner
}

function token(playerId,x,y) {
  this.playerId = playerId
  this.x = x
  this.y = y
  this.lastMove = true
  
  this.winCheck = function (toCheck,board) {
  //check neighbor given in param if same color, counts from top left clockwise starting from 0 - 7
    if (toCheck == 0) {//topleft
      if (this.x-1 >= 0) { 
        if (board[(this.x)-1][(this.y)+1]) {
          if (board[this.x-1][this.y+1].playerId === this.playerId) {
            return 1 + int(board[this.x-1][this.y+1].winCheck(0,board))
          }
        }
      }
    } else if (toCheck == 1) {//topmiddle
      if (board[this.x][this.y+1]) {
        if (board[this.x][this.y+1].playerId === this.playerId) {
          return 1 + int(board[this.x][this.y+1].winCheck(1,board))
        }
      }
    } else if (toCheck == 2) {//topright
      if (this.x+1 <= 6) {  
        if (board[this.x+1][this.y+1]) {
          if (board[this.x+1][this.y+1].playerId === this.playerId) {
            return 1 + int(board[this.x+1][this.y+1].winCheck(2,board))
          }
        }
      }
    } else if (toCheck == 3) {//rightmiddle
      if (this.x+1 <= 6) {   
        if (board[this.x+1][this.y]) {
          if (board[this.x+1][this.y].playerId === this.playerId) {
            return 1 + int(board[this.x+1][this.y].winCheck(3,board))
          }
        }
      }
    } else if (toCheck == 4) {//bottomright
      if (this.x+1 <= 6) {   
        if (board[this.x+1][this.y-1]) {
          if (board[this.x+1][this.y-1].playerId === this.playerId) {
            return 1 + int(board[this.x+1][this.y-1].winCheck(4,board))
          }
        }
      }
    } else if (toCheck == 5) {//bottommiddle
      if (board[this.x][this.y-1]) {
        if (board[this.x][this.y-1].playerId === this.playerId) {
          return 1 + int(board[this.x][this.y-1].winCheck(5,board))
        }
      }
    } else if (toCheck == 6) {//bottomleft
      if (this.x-1 >= 0) { 
        if (board[this.x-1][this.y-1]) {
          if (board[this.x-1][this.y-1].playerId === this.playerId) {
            return 1 + int(board[this.x-1][this.y-1].winCheck(6,board))
          }
        }
      }
    } else if (toCheck == 7) {//leftmiddle
      if (this.x-1 >= 0) {
        if (board[this.x-1][this.y]) {
          if (board[this.x-1][this.y].playerId === this.playerId) {
            return 1 + int(board[this.x-1][this.y].winCheck(7,board))
          }
        }
      }
    } return int(0)//if neighbor dosent match or there is no neighbor return 0
  }
}

function randomAi(id) {
  this.playerId = id
  this.avaliableMoves = []
  this.move = null
  this.turn = function () {
    for (let i = 0; i < 7; i++) {
      if (gameBoard[i].length < 6) {
        this.avaliableMoves.push(i)
      }
    }
    this.move = this.avaliableMoves[int(random(this.avaliableMoves.length))]
    this.avaliableMoves = []
    makeMove(this.move,this.playerId)
    
  }
}
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
  let player0Div = createDiv()
  player0Div.id('player0Div')
  let player1Div = createDiv()
  player1Div.id('player1Div')
  whosTurn = createP('The game is yet to begin')
  startGameButton = createButton('Start new game')
  startGameButton.mousePressed(newGame)
  ellipseMode(CORNER)
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
    fill(players[currentPlayer].color);
    let x = (width/7)*col
    let y = height-((height/6)*(gameBoard[col].length + 1))
    ellipse(x, y, min(width/7,height/6))
    gameBoard[col].push(new token(playerId,col,gameBoard[col].length))//push new move
    currentPlayer = (currentPlayer + 1) % 2//passes turn
    whosTurn.html(`It's ${players[currentPlayer].name}'s turn`)
    let winstate = gameOver()
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
  }
}

function gameOver() {
  let isWinner = {id : null,win : ' '}
  let fullcols = 0
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i].length == 6) {
      fullcols += 1
    }
    gameBoard[i].forEach(element => {
      if (element.lastMove) {//find last move
        if(element.winCheck(0)||element.winCheck(4)){//check diagonal topleft btmright
          if (1 + element.winCheck(0) + element.winCheck(4) > 3) {
            isWinner.id = element.playerId
            isWinner.win = 'win'
          }
        }
        if (element.winCheck(2)||element.winCheck(6)) {//check diagonal btmleft topright
          if (1 + element.winCheck(2) + element.winCheck(6) > 3) {
            isWinner.id = element.playerId
            isWinner.win = 'win'
          }
        }
        if(element.winCheck(3)||element.winCheck(7)){//check horizontal
          if (1 + element.winCheck(3) + element.winCheck(7) > 3) {
            isWinner.id = element.playerId
            isWinner.win = 'win'
          }
        }
        if(element.winCheck(5)){//check vertical
          if (1 + element.winCheck(5) > 3) {
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
  
  this.winCheck = function (toCheck) {
  //check neighbor given in param if same color, counts from top left clockwise starting from 0 - 7
    if (toCheck == 0) {//topleft
      if (this.x-1 >= 0) { 
        if (gameBoard[(this.x)-1][(this.y)+1]) {
          if (gameBoard[this.x-1][this.y+1].playerId === this.playerId) {
            return 1 + int(gameBoard[this.x-1][this.y+1].winCheck(0))
          }
        }
      }
    } else if (toCheck == 1) {//topmiddle
      if (gameBoard[this.x][this.y+1]) {
        if (gameBoard[this.x][this.y+1].playerId === this.playerId) {
          return 1 + int(gameBoard[this.x][this.y+1].winCheck(1))
        }
      }
    } else if (toCheck == 2) {//topright
      if (this.x+1 <= 6) {  
        if (gameBoard[this.x+1][this.y+1]) {
          if (gameBoard[this.x+1][this.y+1].playerId === this.playerId) {
            return 1 + int(gameBoard[this.x+1][this.y+1].winCheck(2))
          }
        }
      }
    } else if (toCheck == 3) {//rightmiddle
      if (this.x+1 <= 6) {   
        if (gameBoard[this.x+1][this.y]) {
          if (gameBoard[this.x+1][this.y].playerId === this.playerId) {
            return 1 + int(gameBoard[this.x+1][this.y].winCheck(3))
          }
        }
      }
    } else if (toCheck == 4) {//bottomright
      if (this.x+1 <= 6) {   
        if (gameBoard[this.x+1][this.y-1]) {
          if (gameBoard[this.x+1][this.y-1].playerId === this.playerId) {
            return 1 + int(gameBoard[this.x+1][this.y-1].winCheck(4))
          }
        }
      }
    } else if (toCheck == 5) {//bottommiddle
      if (gameBoard[this.x][this.y-1]) {
        if (gameBoard[this.x][this.y-1].playerId === this.playerId) {
          return 1 + int(gameBoard[this.x][this.y-1].winCheck(5))
        }
      }
    } else if (toCheck == 6) {//bottomleft
      if (this.x-1 >= 0) { 
        if (gameBoard[this.x-1][this.y-1]) {
          if (gameBoard[this.x-1][this.y-1].playerId === this.playerId) {
            return 1 + int(gameBoard[this.x-1][this.y-1].winCheck(6))
          }
        }
      }
    } else if (toCheck == 7) {//leftmiddle
      if (this.x-1 >= 0) {
        if (gameBoard[this.x-1][this.y]) {
          if (gameBoard[this.x-1][this.y].playerId === this.playerId) {
            return 1 + int(gameBoard[this.x-1][this.y].winCheck(7))
          }
        }
      }
    } return int(0)//if neighbor dosent match or there is no neighbor return 0
  }
}
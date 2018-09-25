const body = document.querySelector('body')
const board = document.querySelector('#board')
const initialPos = JSON.parse(localStorage.getItem('lastposition')) || [
  //whites
  ['wr', 'a1'], ['wn', 'b1'], ['wb', 'c1'], ['wq', 'd1'], ['wk', 'e1'], ['wb', 'f1'], ['wn', 'g1'], ['wr', 'h1'],
  ['wp', 'a2'], ['wp', 'b2'], ['wp', 'c2'], ['wp', 'd2'], ['wp', 'e2'], ['wp', 'f2'], ['wp', 'g2'], ['wp', 'h2'],
  //blacks
  ['br', 'a8'], ['bn', 'b8'], ['bb', 'c8'], ['bq', 'd8'], ['bk', 'e8'], ['bb', 'f8'], ['bn', 'g8'], ['br', 'h8'],
  ['bp', 'a7'], ['bp', 'b7'], ['bp', 'c7'], ['bp', 'd7'], ['bp', 'e7'], ['bp', 'f7'], ['bp', 'g7'], ['bp', 'h7'],
]

const currentPos = []

// const square = (id, color) => {
//   const div = document.createElement('div')
//   div.classList = ['square', color]
//   div.id = id
//   return div
// }
const square = (id, color) => `
<div 
  id="${id}" 
  class="square ${color}" 
  ondragover="dragOver(event)" 
  ondragleave="dragLeaveSquare(event)"
  ondrop="dropPiece(event)" 
></div>`

const createBoard = () => {
  const squares = []
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  for (let i = 0; i < 8; i++) {
    for (let k = 1; k < 9; k++) {
      squares.push(
        square(
          letters[i] + k,
          (k % 2 !== 0 && i % 2 === 0) || (k % 2 === 0 && i % 2 !== 0) ? 'dark' : 'light'
        )
      )
    }
  }
  board.innerHTML = squares.reduce((a, n) => a + n)
  setPosition(initialPos)
  resizeBoard()
  addClicktoSquares()
}

const resizeBoard = () => {
  board.style.width = dimentions().smaller
  board.style.height = dimentions().smaller
  const dimention = dimentions().smaller / 8
  board.style.gridTemplateColumns = `repeat(8, ${dimention}px)`
  Array.from(document.querySelectorAll('.square'))
    .forEach(square => {
      square.style.width = `${dimention}px`
      square.style.height = `${dimention}px`
    })
  Array.from(document.querySelectorAll('.piece'))
    .forEach(piece => {
      piece.style.width = `${dimention}px`
      piece.style.height = `${dimention}px`
    })
}

const addClicktoSquares = () => {
  const allSquares = document.querySelectorAll('.square')
  Array.from(allSquares).forEach(s => {
    s.onclick = () => {
      Array.from(allSquares).forEach(s => s.style.opacity = '1')
      s.style.opacity = '.8'
    }
  })
}

const dimentions = () => {
  const winWidth = window.innerWidth - 77
  const winHeight = window.innerHeight - 77
  return {
    winWidth,
    winHeight,
    smaller: winWidth > winHeight ? winHeight : winWidth
  }
}

const setPosition = positions => {
  positions.forEach(pos => {
    placePiece(pos[0], pos[1])
  })
}

const placePiece = (pieceName, squareId) => {
  const dimention = dimentions().smaller / 8
  const column = squareId[0]
  const imgSource = `/img/pieces/classic/${pieceName}.svg`
  const pieceId = `${pieceName}${column}`
  const pieceImg = `
  <img 
    src="${imgSource}" 
    id="${pieceId}" 
    class="piece"
    data-piecepos="${squareId}"  
    style="width:${dimention}px; height:${dimention}px" 
    ondragover="dragOver(event)" 
    ondragleave="dragLeaveSquare(event)"
    onmousedown="pieceMouseDown(this)"
    onmouseup="pieceMouseUp(this)"
  >`
  document.querySelector(`#${squareId}`).innerHTML = pieceImg

  const pieceEl = document.querySelector(`#${pieceName}${column}`)

  // pieceEl.ondragstart = e => dragStart(e, imgSource, pieceImg, pieceId, squareId)
  pieceEl.ontouchmove = e => touchPiece(e, imgSource, pieceImg, pieceId, squareId)
  // pieceEl.ontouchend = e => alert()

  // el.addEventListener("touchstart", handleStart, false);
  // el.addEventListener("touchend", handleEnd, false);
}

function touchPiece(event, imgSource, pieceImg, pieceId, squareId) {
  var touch = event.targetTouches[0]
  // console.log(touch)
  const pieceCssPos = elementStyle(event.target, 'position')
  if (pieceCssPos !== 'absolute') event.target.style.position = 'absolute'
  console.log(pieceCssPos)
  event.target.style.left = touch.pageX + 'px'
  event.target.style.bottom = touch.pageY + 'px'
  event.preventDefault()
}

function dragStart(e, imgSource, pieceImg, id, squareId) {
  document.querySelector(`#${id}`).style.opacity = 0
  const dimention = dimentions().smaller / 17
  const img = new Image()
  img.src = imgSource
  e.dataTransfer.setDragImage(img, dimention, dimention)
  const piece = [
    pieceImg,
    id,
    imgSource,
    squareId
  ]
  e.dataTransfer.setData("piece", JSON.stringify(piece))
  e.dataTransfer.effectAllowed = "move"
}

let squareOver = ''
function dragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = "move"
  initialSquareBackgroungC = elementStyle(getSquareData(e).squareDest, 'backgroundColor')
  if (!squareOver || squareOver !== getSquareData(e).squareDestId) {
    squareOver = getSquareData(e).squareDestId
    getSquareData(e).squareDest.style.backgroundColor = 'rgb(66, 73, 109)'
  }
}

let initialSquareBackgroungC = ''
function dragLeaveSquare(e) {
  getSquareData(e).squareDest.style.backgroundColor = initialSquareBackgroungC
}

const getSquareData = (e) => {
  const squareDestType = document.querySelector(`#${e.target.id}`).classList.contains('piece') ? 'piece' : 'square'
  const squareDestId = squareDestType === 'square' ? e.target.id : e.target.parentNode.id
  const squareDest = document.querySelector(`#${squareDestId}`)
  return {
    squareDestType,
    squareDestId,
    squareDest
  }
}

function dropPiece(e) {
  e.preventDefault()
  if (squareOver === getSquareData(e).squareDestId) dragLeaveSquare(e)
  squareOver = ''
  const data = e.dataTransfer.getData("piece")
  piece = JSON.parse(data)
  const pieceImg = piece[0]
  const pieceId = piece[1]
  const imgSource = piece[2]
  const initialSquareId = piece[3]
  if (pieceId !== e.target.id) {
    console.log(initialSquareId, getSquareData(e).squareDestId, e.target.id)
    document.querySelector(`#${pieceId}`).remove()
    getSquareData(e).squareDest.style.backgroundColor = initialSquareBackgroungC
    if (getSquareData(e).squareDestType === 'square') {
      e.target.innerHTML = pieceImg
    } else {
      e.target.parentNode.innerHTML = pieceImg
    }
    document.querySelector(`#${pieceId}`).ondragstart = e => dragStart(e, imgSource, pieceImg, pieceId, getSquareData(e).squareDestId)
  } else {
    document.querySelector(`#${pieceId}`).style.opacity = 1
  }
}

// var isMouseDown = false;
// document.onmousedown = function () { isMouseDown = true };
// document.onmouseup = function () { isMouseDown = false };
// document.onmousemove = function () { if (isMouseDown) { body.style.cursor = '-webkit-grabbing' } };

// const pieceMouseDown = el => body.style.cursor = '-webkit-grabbing'
// const pieceMouseUp = el => body.style.cursor = 'default'

const pieceMouseDown = el => el.classList.add('grabbing')
const pieceMouseUp = el => el.classList.remove('grabbing')

const elementStyle = (el, cssProp) => window.getComputedStyle(el).getPropertyValue(cssProp)

createBoard()

window.onresize = resizeBoard

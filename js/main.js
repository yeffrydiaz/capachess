const body = document.querySelector('body')
const board = document.querySelector('#board')
const boardData = {}
const bgColorhighlightSquare = 'rgb(66, 73, 109)'
let initialSquareBackgroungC = ''
let squareOver = ''
let isMouseDown = false
const initialPos = JSON.parse(localStorage.getItem('lastposition')) || [
  //whites
  ['wr', 'a1'], ['wn', 'b1'], ['wb', 'c1'], ['wq', 'd1'], ['wk', 'e1'], ['wb', 'f1'], ['wn', 'g1'], ['wr', 'h1'],
  ['wp', 'a2'], ['wp', 'b2'], ['wp', 'c2'], ['wp', 'd2'], ['wp', 'e2'], ['wp', 'f2'], ['wp', 'g2'], ['wp', 'h2'],
  //blacks
  ['br', 'a8'], ['bn', 'b8'], ['bb', 'c8'], ['bq', 'd8'], ['bk', 'e8'], ['bb', 'f8'], ['bn', 'g8'], ['br', 'h8'],
  ['bp', 'a7'], ['bp', 'b7'], ['bp', 'c7'], ['bp', 'd7'], ['bp', 'e7'], ['bp', 'f7'], ['bp', 'g7'], ['bp', 'h7'],
]

const currentPos = []

// const square = (id, color) => `
// <div 
//   id="${id}" 
//   class="square ${color}" 
//   ondragenter="dragEnter(event)"
//   ondragover="dragOver(event)" 
//   ondragleave="dragLeaveSquare(event)"
//   ondrop="dropPiece(event)" 
// ></div>`
// const square = (id, color) => `
// <div 
//   id="${id}" 
//   class="square ${color}" 
// ></div>`

const square = (id, color) => {
  const newSquare = document.createElement('div')
  newSquare.classList = `square ${color}`
  newSquare.id = id
  // newSquare.ondragover = e => onDragOverSquare(e)
  return newSquare
}

const createBoard = _ => {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  for (let k = 8; k > 0; k--) {
    for (let i = 0; i < 8; i++) {
      board.appendChild(
        square(
          `${letters[i]}${k}`,
          (k % 2 !== 0 && i % 2 === 0) || (k % 2 === 0 && i % 2 !== 0) ? 'dark' : 'light'
        )
      )
    }
  }
  resizeBoard()
  // addClicktoSquares()
}




function resizeBoard() {
  board.style.width = dimentions().smaller
  board.style.height = dimentions().smaller
  boardData.dimentions = dimentions().smaller
  const { squareDimentions } = dimentions()
  board.style.gridTemplateColumns = `repeat(8, ${squareDimentions}px)`
  resizeElements('square', squareDimentions)
  resizeElements('piece', squareDimentions)
}

function resizeElements(element, squareDimentions) {
  Array.from(document.querySelectorAll(`.${element}`))
    .forEach(el => {
      el.style.width = `${squareDimentions}px`
      el.style.height = `${squareDimentions}px`
      if (element === 'piece') {
        const pieceSquareId = el.getAttribute('data-square')
        const square = document.querySelector(`#${pieceSquareId}`)
        const squareCordinatesTop = square.offsetTop
        const squareCordinatesLeft = square.offsetLeft
        el.style.transform = `translate(${squareCordinatesLeft}px ,${squareCordinatesTop}px)`
      }
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
  const smaller = winWidth > winHeight ? winHeight : winWidth
  return {
    winWidth,
    winHeight,
    smaller,
    squareDimentions: smaller / 8
  }
}

const setPosition = positions => {
  positions.forEach(pos => {
    placePiece(pos[0], pos[1])
  })
}

function placePiece(pieceName, squareId) {
  const square = document.querySelector(`#${squareId}`)
  const { squareDimentions } = dimentions()
  const column = squareId[0]
  const imgSource = `/img/pieces/classic/${pieceName}.svg`
  const pieceId = `${pieceName}${column}`

  // const squareCordinates = square.getBoundingClientRect()
  // const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  // const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  // const squareCordinatesTop = squareCordinates.top + scrollTop
  // const squareCordinatesLeft = squareCordinates.left + scrollLeft

  const squareCordinatesTop = square.offsetTop
  const squareCordinatesLeft = square.offsetLeft

  // console.log(squareId, squareCordinatesTop, squareCordinatesLeft)
  const pieceEl = createPiece(pieceId, squareDimentions, imgSource, squareId, squareCordinatesTop, squareCordinatesLeft)
  board.appendChild(pieceEl)

  setPieceHandles(pieceEl, imgSource, pieceId, squareId)
}

const createPiece = (pieceId, dimention, imgSource, squareId, top, left) => {
  const piece = document.createElement('img')
  piece.src = imgSource
  piece.id = pieceId
  piece.className = 'piece'
  piece.setAttribute('data-square', squareId)
  piece.setAttribute('style', `width:${dimention}px; height:${dimention}px; transform: translate(${left}px,${top}px)`)
  return piece
}

function setPieceHandles(pieceEl, imgSource, pieceId, squareId) {
  //drag on mobile
  // pieceEl.ontouchstart = e => touchPieceStart(e, imgSource, pieceImg, pieceId, squareId)
  // pieceEl.ontouchmove = e => movePiece(e, imgSource, pieceImg, pieceId, squareId)
  // pieceEl.ontouchend = e => touchPieceEnd(e, imgSource, pieceImg, pieceId, squareId)
  pieceEl.ontouchstart = e => pieceMouseDown(e, imgSource, pieceId, squareId)
  pieceEl.ontouchmove = e => movePiece(e, imgSource, pieceId, squareId)
  pieceEl.ontouchend = e => pieceMouseUp(e, imgSource, pieceId, squareId)
  //drag on pc
  pieceEl.ondragstart = e => { e.preventDefault(); return false }
  pieceEl.ondrag = e => { e.preventDefault(); return false }
  pieceEl.ondragover = e => { e.preventDefault(); return false }
  pieceEl.ondragend = e => { e.preventDefault(); return false }
  pieceEl.ondragenter = e => { e.preventDefault(); return false }
  pieceEl.ondragleave = e => { e.preventDefault(); return false }

  pieceEl.onmousedown = e => pieceMouseDown(e, imgSource, pieceId, squareId)
  // pieceEl.onmousemove = e => movePiece(e)
  pieceEl.onmouseup = e => pieceMouseUp(e, imgSource, pieceId, squareId)
  // pieceEl.onmouseout = e => pieceMouseUp(e, imgSource, pieceId, squareId)
  // pieceEl.ondragstart = e => dragStart(e, imgSource, pieceImg, pieceId, squareId)
  // pieceEl.ondragover = dragOver
  // pieceEl.ondragleave = dragLeaveSquare
}



function onDragOverSquare(e) {
  console.log(e.target.id)
}

const pieceMouseDown = e => {
  e.preventDefault()
  isMouseDown = true
  const piece = e.target
  const pieceSquareId = piece.getAttribute('data-square')
  highlightSquare(pieceSquareId)
  piece.classList.add('grabbing')
}

const pieceMouseUp = e => {
  e.preventDefault()
  isMouseDown = false
  const piece = e.target
  const pieceSquareId = piece.getAttribute('data-square')
  const pieceSelected = document.querySelector(`.grabbing`)
  unHighlightSquare(pieceSquareId)
  if (pieceSelected) { piece.classList.remove('grabbing') }
}

body.onmousemove = e => movePiece(e)

function movePiece(e) {
  if (isMouseDown) {
    // const touch = e.targetTouches ? e.targetTouches[0] : ''
    const posX = window.event.pageX || e.targetTouches[0].pageX
    const posY = window.event.pageY || e.targetTouches[0].pageY
    const piece = document.querySelector(`.grabbing`)
    const pieceDimentions = piece.offsetWidth
    const boardPos = elementCoordenates(board)
    const moveX = posX - pieceDimentions / 2 - boardPos.left
    const moveY = posY - pieceDimentions / 2 - boardPos.top
    // const moveX = posX <= 0 ? 0 : posX > pieceDimentions ? posX - pieceDimentions : pieceDimentions - posX
    // const moveY = posY <= 0 ? 0 : posY > pieceDimentions ? posY - pieceDimentions : pieceDimentions - posY
    piece.style.transform = `translate(${moveX}px ,${moveY}px)`

  }
}

function highlightSquare(squareId) {
  const square = document.querySelector(`#${squareId}`)
  initialSquareBackgroungC = elementStyle(square, 'backgroundColor')
  square.style.backgroundColor = bgColorhighlightSquare
}

function unHighlightSquare(squareId) {
  const square = document.querySelector(`#${squareId}`)
  square.style.backgroundColor = initialSquareBackgroungC
}

const elementStyle = (el, cssProp) => window.getComputedStyle(el).getPropertyValue(cssProp)
const elementCoordenates = el => {
  const coord = el.getBoundingClientRect()
  return {
    top: coord.top,
    left: coord.left,
    bottom: coord.bottom,
    right: coord.right,
  }
}

createBoard()
setPosition(initialPos)

window.onchange = resizeBoard
window.onresize = resizeBoard

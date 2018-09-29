const body = document.querySelector('body')
const board = document.querySelector('#board')
const boardData = {}
const bgColorhighlightSquare = 'rgba(197, 188, 61, 0.96)'
const allSquares = {}
allSquares.elmntsArr = []
allSquares.pos = []
allSquares.color = []
const mouse = { x: 0, y: 0 }
let squareOver = ''
let isMouseDown = false
let pieceClickedId = false
const currentPos = []
const initialPos = JSON.parse(localStorage.getItem('lastposition')) || [
  //whites
  ['wr', 'a1'], ['wn', 'b1'], ['wb', 'c1'], ['wq', 'd1'], ['wk', 'e1'], ['wb', 'f1'], ['wn', 'g1'], ['wr', 'h1'],
  ['wp', 'a2'], ['wp', 'b2'], ['wp', 'c2'], ['wp', 'd2'], ['wp', 'e2'], ['wp', 'f2'], ['wp', 'g2'], ['wp', 'h2'],
  //blacks
  ['br', 'a8'], ['bn', 'b8'], ['bb', 'c8'], ['bq', 'd8'], ['bk', 'e8'], ['bb', 'f8'], ['bn', 'g8'], ['br', 'h8'],
  ['bp', 'a7'], ['bp', 'b7'], ['bp', 'c7'], ['bp', 'd7'], ['bp', 'e7'], ['bp', 'f7'], ['bp', 'g7'], ['bp', 'h7'],
]

const square = (id, color) => {
  const newSquare = document.createElement('div')
  newSquare.classList = `square ${color}`
  newSquare.id = id
  newSquare.setAttribute('data-piece', null)
  // newSquare.onmousemove = e => { if (mouseOverSquare(e.target.id)) console.log(e.target.id) }
  // newSquare.ondragover = e => onDragOverSquare(e)
  return newSquare
}

function mouseOverSquare(squareId) {
  const square = document.querySelector(`#${squareId}`)
  // const boardPos = elementCoordenates(board)
  const squarePos = elementCoordenates(square)

  mouse.x = event.pageX
  mouse.y = event.pageY

  const top = parseInt(squarePos.top)
  const left = parseInt(squarePos.left)
  const right = parseInt(squarePos.right)
  const bottom = parseInt(squarePos.bottom)

  return (
    top < mouse.y &&
    left < mouse.x &&
    right > mouse.x &&
    bottom > mouse.y
  )
}

const createBoard = _ => {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  for (let k = 8; k > 0; k--) {
    for (let i = 0; i < 8; i++) {
      board.appendChild(
        square(
          `${letters[i]}${k}`,
          (k % 2 !== 0 && i % 2 === 0) || (k % 2 === 0 && i % 2 !== 0) ? 'green' : 'light'
        )
      )
      allSquares.color.push({
        [`${letters[i]}${k}`]: (k % 2 !== 0 && i % 2 === 0) || (k % 2 === 0 && i % 2 !== 0) ? 'dark' : 'light'
      })
    }
  }
  allSquares.elmntsArr = Array.from(document.querySelectorAll(`.square`))
  resizeBoard()
  addClicktoSquares()
}

function resizeBoard() {
  board.style.width = dimentions().smaller
  board.style.height = dimentions().smaller
  boardData.dimentions = dimentions().smaller
  const { squareDimentions } = dimentions()
  board.style.gridTemplateColumns = `repeat(8, ${squareDimentions}px)`
  resizeElements('square', squareDimentions)
  getElementsPos()
  resizeElements('piece', squareDimentions)
  // console.log(allSquares)
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

function getElementsPos() {
  allSquares.elmntsArr
    .forEach(el => {
      if (allSquares.pos.length === 64) { allSquares.pos = [] }
      allSquares.pos.push(
        {
          id: el.id,
          top: elementCoordenates(el).top,
          left: elementCoordenates(el).left,
          right: elementCoordenates(el).right,
          bottom: elementCoordenates(el).bottom,
        }
      )
    })
}

const addClicktoSquares = () => {
  allSquares.elmntsArr
    .forEach(s => {
      s.onclick = () => {
        const squarePosition = allSquares.pos.filter(sq => sq.id === s.id)[0]
        if (pieceClickedId) {
          const pieceSquareId = getElement(pieceClickedId).getAttribute('data-square')
          const squareFrom = document.querySelector(`#${pieceSquareId}`)
          squareFrom.setAttribute('data-piece', null)
          const squareClicked = document.querySelector(`#${s.id}`)
          squareClicked.setAttribute('data-piece', pieceClickedId)
          getElement(pieceClickedId).setAttribute('data-square', s.id)
          getElement(pieceClickedId).style.transform = translatePiece(squarePosition.left, squarePosition.top)
          pieceClickedId = false
        }
      }
    })
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

  const squareCordinatesTop = square.offsetTop
  const squareCordinatesLeft = square.offsetLeft
  const pieceEl = createPiece(pieceId, squareDimentions, imgSource, squareId, squareCordinatesTop, squareCordinatesLeft)
  board.appendChild(pieceEl)

  setPieceHandles(pieceEl, imgSource, pieceId, squareId)
}

const createPiece = (pieceId, dimention, imgSource, squareId, top, left) => {
  const square = document.querySelector(`#${squareId}`)
  square.setAttribute('data-piece', pieceId)
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
  pieceEl.onmouseup = e => pieceMouseUp(e, imgSource, pieceId, squareId)
}

function onDragOverSquare(e) {
  console.log(e.target.id)
}

function pieceMouseDown(e) {
  // e.preventDefault()
  mouse.x = window.event.pageX || e.targetTouches[0].pageX
  mouse.y = window.event.pageY || e.targetTouches[0].pageY
  isMouseDown = true
  const currentPieceClicked = e.target
  const piece = getElement(pieceClickedId || currentPieceClicked.id)
  const pieceSquareId = piece.getAttribute('data-square')
  highlightSquare(pieceSquareId)
  piece.classList.add('grabbing')
  if (pieceClickedId &&
    currentSquareData(pieceSquareId) &&
    currentSquareData(pieceSquareId).id !== pieceSquareId
  ) {
    pieceMouseUp(e)
  } else {
    pieceClickedId = e.target.id
  }
  console.log(isMouseDown)
}

const pieceMouseUp = e => {
  e.preventDefault()
  // console.log(e.targetTouches[0])
  mouse.x = window.event.pageX || e.targetTouches[0].pageX
  mouse.y = window.event.pageY || e.targetTouches[0].pageY
  isMouseDown = false
  // const piece = e.target 
  const pieceSelected = document.querySelector(`.dragging`) || document.querySelector(`#${pieceClickedId}`)
  if (pieceSelected) {
    const pieceSquareId = pieceSelected.getAttribute('data-square')
    const squareFrom = document.querySelector(`#${pieceSquareId}`)
    squareFrom.setAttribute('data-piece', null)

    if (!pieceClickedId) unHighlightSquare(pieceSquareId)
    // const squareFromCord = elementCoordenates(squareFrom)
    // const currentSquareId = currentSquareData() ? currentSquareData(pieceSquareId).id : pieceSquareId
    const currentSquare = document.querySelector(`#${currentSquareData(pieceSquareId).id}`)

    console.log(pieceSquareId, currentSquare.id)
    pieceSelected.setAttribute('data-square', currentSquareData(pieceSquareId).id)
    const isCurrentSquarePieceId = currentSquare.getAttribute('data-piece')
    if (isCurrentSquarePieceId !== `null`) document.querySelector(`#${isCurrentSquarePieceId}`).remove()
    currentSquare.setAttribute('data-piece', pieceSelected.id)

    Array.from(document.querySelectorAll(`.grabbing`)).forEach(pieceGrabbed => pieceGrabbed.classList.remove('grabbing'))
    pieceSelected.classList.remove('dragging')

    if (currentSquareData(pieceSquareId).id !== pieceSquareId) pieceClickedId = false
    pieceSelected.style.transform = translatePiece(currentSquareData(pieceSquareId).left, currentSquareData(pieceSquareId).top)
  }
}

function movePiece(e) {
  if (isMouseDown) {
    // const touch = e.targetTouches ? e.targetTouches[0] : '' 
    mouse.x = window.event.pageX || e.targetTouches[0].pageX
    mouse.y = window.event.pageY || e.targetTouches[0].pageY
    const piece = document.querySelector(`.grabbing`)
    const pieceSquareId = piece.getAttribute('data-square')
    piece.classList.add('dragging')
    // const square = document.querySelector(`#${piece.getAttribute(`data-square`)}`)
    // mouseOverSquare(piece.getAttribute(`data-square`))
    const pieceDimentions = piece.offsetWidth
    const boardPos = elementCoordenates(board)
    const moveX = mouse.x - pieceDimentions / 2 - boardPos.left
    const moveY = mouse.y - pieceDimentions / 2 - boardPos.top
    // const moveX = mouse.x <= 0 ? 0 : mouse.x > pieceDimentions ? mouse.x - pieceDimentions : pieceDimentions - mouse.x
    // const moveY = mouse.y <= 0 ? 0 : mouse.y > pieceDimentions ? mouse.y - pieceDimentions : pieceDimentions - mouse.y
    piece.style.transform = `translate(${moveX}px ,${moveY}px)`

    // const squarePos = elementCoordenates(square)   
    if (currentSquareData(pieceSquareId)) highlightSquare(currentSquareData(pieceSquareId).id)
  }
  //  else {
  //   if (currentSquareData() && !pieceClickedId) unHighlightSquare(currentSquareData().id)
  // }
}

body.onmousemove = e => movePiece(e)

function translatePiece(left, top) {
  const boardPos = elementCoordenates(board)
  return `translate(${left - boardPos.left}px ,${top - boardPos.top}px)`
}

const currentSquareData = pieceSquareId => allSquares.pos.filter(square =>
  square.top < mouse.y &&
  square.left < mouse.x &&
  square.right > mouse.x &&
  square.bottom > mouse.y
)[0]

function highlightSquare(squareId) {
  allSquares.elmntsArr.forEach(square => square.classList.remove('clicked'))
  getElement(squareId).classList.add('clicked')
}

function unHighlightSquare(squareId) {
  getElement(squareId).classList.remove('clicked')
}

const getElement = elId => document.querySelector(`#${elId}`)

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

createBoard()
setPosition(initialPos)

// allSquares.pos.forEach(square => {
//   const squareEl = document.createElement('div')
//   squareEl.style.position = 'absolute'
//   squareEl.style.width = `${dimentions().squareDimentions}px`
//   squareEl.style.height = `${dimentions().squareDimentions}px`
//   squareEl.className = 'darkblue'
//   body.appendChild(squareEl)
//   squareEl.style.transform = `translate(${square.left}px ,${square.top}px)`
// })

window.onchange = resizeBoard
window.onresize = resizeBoard

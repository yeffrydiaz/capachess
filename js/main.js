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
  document.querySelector(`.grabbing`).style.zIndex = 5
  console.log(isMouseDown)
}

const pieceMouseUp = e => {
  e.preventDefault()
  isMouseDown = false
  const piece = e.target
  const pieceSquareId = piece.getAttribute('data-square')
  const pieceSelected = document.querySelector(`.grabbing`)
  unHighlightSquare(pieceSquareId)
  if (pieceSelected) {
    pieceSelected.style.zIndex = 0
    piece.classList.remove('grabbing')
  }
  console.log(isMouseDown)
}

// body.onmousemove = e => {
//   const posX = window.event.pageX || e.targetTouches[0].pageX
//   const posY = window.event.pageY || e.targetTouches[0].pageY
//   console.log(posX, posY)
// }

body.onmousemove = e => { movePiece(e) }

const piecePos = { x: 0, y: 0 }

function movePiece(e) {

  // e.preventDefault()
  if (isMouseDown) {
    // const touch = e.targetTouches ? e.targetTouches[0] : ''
    const posX = window.event.pageX || e.targetTouches[0].pageX
    const posY = window.event.pageY || e.targetTouches[0].pageY
    const piece = document.querySelector(`.grabbing`)
    const pieceDimentions = piece.offsetWidth
    const screenGap = (dimentions().winWidth - dimentions().winHeight)
    const moveX = posX - pieceDimentions + screenGap
    const moveY = posY - pieceDimentions + screenGap
    // const moveX = posX <= 0 ? 0 : posX > pieceDimentions ? posX - pieceDimentions : pieceDimentions - posX
    // const moveY = posY <= 0 ? 0 : posY > pieceDimentions ? posY - pieceDimentions : pieceDimentions - posY
    piece.style.transform = `translate(${moveX}px ,${moveY}px)`

    // if (moveX <= 0) { piece.style.transform = `translate(${0}px ,${moveY}px)` } else
    //   if (moveY <= 0) { piece.style.transform = `translate(${moveX}px ,${0}px)` } else {
    //     piece.style.transform = `translate(${moveX}px ,${moveY}px)`
    //   }

    // if (moveX > 0 &&
    //   moveY > 0
    //   // moveX < boardData.dimentions - pieceDimentions &&
    //   // moveY < boardData.dimentions - pieceDimentions
    // ) {

    //   piece.style.transform = `translate(${moveX}px ,${moveY}px)`
    // }
    console.log(piece.offsetWidth, pieceDimentions)
    console.log(moveX, moveY)
    console.log(posX, posY)
    console.log(screenGap)
    // console.log(isMouseDown, e)
  }
}
// function movePiece(e, imgSource, pieceId, squareId) {
//   e.preventDefault()
//   if (isMouseDown) {
//     console.log(isMouseDown)
//     // const touch = e.targetTouches ? e.targetTouches[0] : ''
//     const moveX = window.event.pageX || e.targetTouches[0].pageX
//     const moveY = window.event.pageY || e.targetTouches[0].pageY
//     const piece = document.querySelector(`#${pieceId}`)
//     const pieceDimentions = piece.clientWidth
//     console.log(piece.offsetWidth, pieceDimentions, moveX, moveY)
//     e.target.style.transform = `translate(${moveX - pieceDimentions}px ,${moveY - pieceDimentions}px)`
//   }
// }

// function getMouse(e) {
//   const beepos = { x: 0, y: 0 }
//   const mouse = { x: 0, y: 0 }

//   mouse.x = e.pageX
//   mouse.y = e.pageY
//   //Checking directional change

//   //1. find distance X , distance Y
//   var distX = mouse.x - beepos.x;
//   var distY = mouse.y - beepos.y;
//   //Easing motion
//   //Progressive reduction of distance 
//   beepos.x += distX / 5;
//   beepos.y += distY / 2;

//   bee.style.left = beepos.x + "px";
//   bee.style.top = beepos.y + "px";

// }

function highlightSquare(squareId) {
  const square = document.querySelector(`#${squareId}`)
  initialSquareBackgroungC = elementStyle(square, 'backgroundColor')
  square.style.backgroundColor = bgColorhighlightSquare
}

function unHighlightSquare(squareId) {
  const square = document.querySelector(`#${squareId}`)
  square.style.backgroundColor = initialSquareBackgroungC
}

// function touchPieceStart(e, imgSource, pieceImg, pieceId, squareId) {
//   var touch = e.targetTouches[0]
//   const piece = document.querySelector(`#${e.target.id}`)
//   console.log('start', e.target.id, piece)
//   piece.classList.add('grabbing')
// }

// function movePiece(event, imgSource, pieceImg, pieceId, squareId) {
//   var touch = event.targetTouches[0]
//   // console.log(touch)
//   const pieceCssPos = elementStyle(event.target, 'position')
//   if (pieceCssPos !== 'absolute') event.target.style.position = 'absolute'
//   console.log(pieceCssPos)
//   event.target.style.transform = `translate(${touch.pageX}px ,${touch.pageY}px) rotate(90deg)`
//   // event.target.style.bottom = touch.pageY + 'px'
//   event.preventDefault()
// }

// function touchPieceEnd(e, imgSource, pieceId, squareId) {
//   var touch = e.targetTouches[0]
//   console.log('end')
//   e.target.classList.remove('grabbing')
// }

// function dragStart(e, imgSource, pieceImg, id, squareId) {
//   document.querySelector(`#${id}`).style.opacity = 0
//   const dimention = dimentions().smaller / 17
//   const img = new Image()
//   img.src = imgSource
//   e.dataTransfer.setDragImage(img, dimention, dimention)
//   const piece = [
//     pieceImg,
//     id,
//     imgSource,
//     squareId
//   ]
//   e.dataTransfer.setData("piece", JSON.stringify(piece))
//   e.dataTransfer.effectAllowed = "move"
// }

// function dragOver(e) {
//   e.preventDefault()
//   e.dataTransfer.dropEffect = "move"
//   if (!squareOver || squareOver !== getSquareData(e).squareDestId) {
//     squareOver = getSquareData(e).squareDestId
//     // highlightSquare(e)
//   }
// }

// function dragEnter(e) {
//   getSquareData(e).squareDest.style.backgroundColor = bgColorhighlightSquare
// }

// function dragLeaveSquare(e) {
//   unHighlightSquare(e)
// }

// function dropPiece(e) {
//   e.preventDefault()
//   if (squareOver === getSquareData(e).squareDestId) dragLeaveSquare(e)
//   squareOver = ''
//   const data = e.dataTransfer.getData("piece")
//   piece = JSON.parse(data)
//   const pieceImg = piece[0]
//   const pieceId = piece[1]
//   const imgSource = piece[2]
//   const initialSquareId = piece[3]
//   if (pieceId !== e.target.id) {
//     // console.log(initialSquareId, getSquareData(e).squareDestId, e.target.id)
//     document.querySelector(`#${pieceId}`).remove()
//     getSquareData(e).squareDest.style.backgroundColor = initialSquareBackgroungC
//     if (getSquareData(e).squareDestType === 'square') {
//       e.target.innerHTML = pieceImg
//     } else {
//       e.target.parentNode.innerHTML = pieceImg
//     }
//     const pieceEl = document.querySelector(`#${pieceId}`)
//     setPieceHandles(pieceEl, imgSource, pieceImg, pieceId, getSquareData(e).squareDestId)
//   } else {
//     document.querySelector(`#${pieceId}`).style.opacity = 1
//   }
// }

// function highlightSquare(e) {
//   initialSquareBackgroungC = elementStyle(getSquareData(e).squareDest, 'backgroundColor')
//   getSquareData(e).squareDest.style.backgroundColor = bgColorhighlightSquare
// }

// function unHighlightSquare(e) {
//   getSquareData(e).squareDest.style.backgroundColor = initialSquareBackgroungC
// }

// const getSquareData = (e) => {
//   if (!document.querySelector(`#${e.target.id}`)) return false
//   const squareDestType = document.querySelector(`#${e.target.id}`).classList.contains('piece') ? 'piece' : 'square'
//   const squareDestId = squareDestType === 'square' ? e.target.id : e.target.parentNode.id
//   const squareDest = document.querySelector(`#${squareDestId}`)
//   return {
//     squareDestType,
//     squareDestId,
//     squareDest
//   }
// }

// var isMouseDown = false;
// document.onmousedown = function () { isMouseDown = true };
// document.onmouseup = function () { isMouseDown = false };
// document.onmousemove = function () { if (isMouseDown) { body.style.cursor = '-webkit-grabbing' } };

// const pieceMouseDown = el => body.style.cursor = '-webkit-grabbing'
// const pieceMouseUp = el => body.style.cursor = 'default'


const elementStyle = (el, cssProp) => window.getComputedStyle(el).getPropertyValue(cssProp)

createBoard()
setPosition(initialPos)

window.onchange = resizeBoard
window.onresize = resizeBoard

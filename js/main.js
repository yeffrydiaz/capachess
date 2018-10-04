window.onload = () => {

  const body = document.querySelector('body')
  const board = document.querySelector('#board')
  const boardData = {}
  const allSquares = {}
  allSquares.elmntsArr = []
  allSquares.pos = []
  allSquares.color = []
  const allPieces = {}
  const boardLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const mouse = { x: 0, y: 0 }
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
    return newSquare
  }

  const createBoard = _ => {
    for (let k = 8; k > 0; k--) {
      for (let i = 0; i < 8; i++) {
        board.appendChild(
          square(
            `${boardLetters[i]}${k}`,
            (k % 2 !== 0 && i % 2 === 0) || (k % 2 === 0 && i % 2 !== 0) ? 'green' : 'light'
          )
        )
        allSquares.color.push({
          [`${boardLetters[i]}${k}`]: (k % 2 !== 0 && i % 2 === 0) || (k % 2 === 0 && i % 2 !== 0) ? 'dark' : 'light'
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
    allPieces[pieceId] = piece
    return piece
  }

  function setPieceHandles(pieceEl, imgSource, pieceId, squareId) {
    //drag on mobile
    pieceEl.ontouchstart = e => pieceMouseDown(e, imgSource, pieceId, squareId)
    pieceEl.ontouchmove = e => dragPiece(e, imgSource, pieceId, squareId)
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

  function pieceMouseDown(e) {
    e.preventDefault()
    cleanSquaresColors()
    mouse.x = window.event.pageX || (e.targetTouches ? e.targetTouches[0].pageX : 0)
    mouse.y = window.event.pageY || (e.targetTouches ? e.targetTouches[0].pageY : 0)
    Array.from(document.querySelectorAll(`.grabbing`)).forEach(pieceGrabbed => pieceGrabbed.classList.remove('grabbing'))
    isMouseDown = true
    const currentPieceClicked = e.target
    const currentPieceClickedSquareId = currentPieceClicked.getAttribute('data-square')
    const piece = getElement(pieceClickedId || currentPieceClicked.id)
    const pieceSquareId = piece.getAttribute('data-square')
    const isLegalMove = pieceClickedId ? legalMoves(pieceClickedId).some(legalSquare => legalSquare.id === currentPieceClickedSquareId) : false
    if (isLegalMove) {
      piece.classList.add('grabbing')
    } else {
      currentPieceClicked.classList.add('grabbing')
    }
    if (pieceClickedId &&
      currentPieceClicked.id !== piece.id &&
      isLegalMove
    ) {
      movePiece(e)
      highlightSquare(pieceSquareId, currentPieceClickedSquareId)
    } else {
      pieceClickedId = e.target.id
      highlightSquare(currentPieceClickedSquareId)
    }
  }

  function pieceMouseUp(e) {
    e.preventDefault()
    isMouseDown = false
    if (document.querySelectorAll(`.dragging`)) movePiece(e)
    Array.from(document.querySelectorAll(`.grabbing`)).forEach(pieceGrabbed => pieceGrabbed.classList.remove('grabbing', 'dragging'))
  }

  function movePiece(e) {
    e.preventDefault()
    const pieceSelected = document.querySelector(`.dragging`) || document.querySelector(`#${pieceClickedId}`)
    const pieceSquareId = pieceSelected ? pieceSelected.getAttribute('data-square') : ''

    if (currentSquareData() && pieceSquareId) {
      const currentSquareId = currentSquareData().id
      const currentSquare = document.querySelector(`#${currentSquareId}`)

      const isLegalMove = legalMoves(pieceSelected.id).some(legalSquare => legalSquare.id === currentSquare.id)

      if (!isLegalMove && currentSquareId !== pieceSquareId) highlightIllegalMoveSquare(currentSquareId)

      if (pieceSelected && isLegalMove) {
        const squareFrom = document.querySelector(`#${pieceSquareId}`)
        squareFrom.setAttribute('data-piece', null)

        console.log(pieceSquareId, currentSquare.id)
        pieceSelected.setAttribute('data-square', currentSquareId)
        const isCurrentSquarePieceId = currentSquare.getAttribute('data-piece')
        if (isCurrentSquarePieceId !== `null`) {
          document.querySelector(`#${isCurrentSquarePieceId}`).remove()
          delete allPieces[isCurrentSquarePieceId]
        }
        currentSquare.setAttribute('data-piece', pieceSelected.id)

        Array.from(document.querySelectorAll(`.grabbing`)).forEach(pieceGrabbed => pieceGrabbed.classList.remove('grabbing'))
        pieceSelected.classList.remove('dragging')

        pieceSelected.style.transform = translatePiece(currentSquareData().left, currentSquareData().top)
        allPieces[pieceSelected.id] = pieceSelected
        pieceClickedId = false
      } else {
        pieceSelected.style.transform = translatePiece(fromSquareData(pieceSquareId).left, fromSquareData(pieceSquareId).top)
      }
    } else if (pieceSelected) {
      pieceSelected.style.transform = translatePiece(fromSquareData(pieceSquareId).left, fromSquareData(pieceSquareId).top)
    }
  }

  function dragPiece(e) {
    if (isMouseDown && document.querySelector(`.grabbing`)) {
      mouse.x = window.event.pageX || (e.targetTouches ? e.targetTouches[0].pageX : 0)
      mouse.y = window.event.pageY || (e.targetTouches ? e.targetTouches[0].pageY : 0)
      const piece = document.querySelector(`.grabbing`)
      const pieceSquareId = piece.getAttribute('data-square')
      piece.classList.add('dragging')
      const pieceDimentions = piece.offsetWidth
      const boardPos = elementCoordenates(board)
      const moveX = mouse.x - pieceDimentions / 2 - boardPos.left
      const moveY = mouse.y - pieceDimentions / 2 - boardPos.top
      piece.style.transform = `translate(${moveX}px ,${moveY}px)`
      if (currentSquareData(pieceSquareId)) highlightSquare(pieceSquareId, currentSquareData(pieceSquareId).id)
    }
  }

  function addClicktoSquares() {
    allSquares.elmntsArr
      .forEach(s => {
        s.onclick = () => {
          const squarePosition = allSquares.pos.filter(sq => sq.id === s.id)[0]
          if (pieceClickedId) {
            const pieceSquareId = getElement(pieceClickedId).getAttribute('data-square')
            const isLegalMove = legalMoves(pieceClickedId).some(legalSquare => legalSquare.id === s.id)
            if (isLegalMove) {
              const squareFrom = document.querySelector(`#${pieceSquareId}`)
              squareFrom.setAttribute('data-piece', null)
              const squareClicked = document.querySelector(`#${s.id}`)
              squareClicked.setAttribute('data-piece', pieceClickedId)
              getElement(pieceClickedId).setAttribute('data-square', s.id)
              getElement(pieceClickedId).style.transform = translatePiece(squarePosition.left, squarePosition.top)
              getElement(pieceClickedId).classList.remove('grabbing', 'dragging')
              highlightSquare(pieceSquareId, squareClicked.id)
              pieceClickedId = false
            } else {
              highlightIllegalMoveSquare(s.id)
            }
          }
        }
      })
  }

  const translatePiece = (left, top) => `translate(${left - elementCoordenates(board).left}px ,${top - elementCoordenates(board).top}px)`

  const currentSquareData = _ => allSquares.pos.filter(square =>
    square.top < mouse.y &&
    square.left < mouse.x &&
    square.right > mouse.x &&
    square.bottom > mouse.y
  )[0]

  const fromSquareData = pieceSquareId => allSquares.pos.filter(square => square.id === pieceSquareId)[0]

  function highlightSquare(squareIdBefore, squareIdAfter) {
    cleanSquaresColors()
    getElement(squareIdBefore).classList.add('clicked')
    if (squareIdAfter) getElement(squareIdAfter).classList.add('landed')
  }

  function highlightIllegalMoveSquare(squareId) {
    getElement(squareId).classList.add('illegalmove')
    setTimeout(() => {
      getElement(squareId).classList.remove('illegalmove')
    }, 500)
    highlightSquare(getElement(pieceClickedId).getAttribute('data-square'))
  }

  function cleanSquaresColors() {
    allSquares.elmntsArr.forEach(square => square.classList.remove('clicked', 'landed'))
  }

  const getElement = elId => document.querySelector(`#${elId}`)

  // const elementStyle = (el, cssProp) => window.getComputedStyle(el).getPropertyValue(cssProp)

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

  function legalMoves(pieceId) {
    const squareId = allPieces[pieceId].getAttribute('data-square')
    const pieceColor = pieceId[0]
    const pieceType = pieceId[1]
    const pieceColLetter = squareId[0]
    const pieceColNumb = boardLetters.indexOf(pieceColLetter) + 1
    const pieceRowNumb = Number(squareId[1])
    const moves = []

    //pawn
    if (pieceType === 'p') {
      const limit = (pieceRowNumb === 2 || pieceRowNumb === 7) ? 2 : 1
      if (pieceColor === 'w') {
        for (let i = pieceRowNumb + 1; i <= pieceRowNumb + limit; i++) {
          const squareUp = allSquares.elmntsArr.filter(square =>
            square.id === pieceColLetter + i &&
            square.getAttribute('data-piece') === 'null'
          )
          if (squareUp.length) moves.push(squareUp[0])
          const squareToEatLeft = allSquares.elmntsArr.filter(square =>
            square.id === boardLetters[pieceColNumb - 2] + (pieceRowNumb + 1) &&
            isPieceDifferentColor(square)
          )
          if (squareToEatLeft.length) moves.push(squareToEatLeft[0])
          const squareToEatRight = allSquares.elmntsArr.filter(square =>
            square.id === boardLetters[pieceColNumb] + (pieceRowNumb + 1) &&
            isPieceDifferentColor(square)
          )
          if (squareToEatRight.length) moves.push(squareToEatRight[0])
          if (!squareUp.length) break;
        }
      }
      if (pieceColor === 'b') {
        for (let i = pieceRowNumb - 1; i >= pieceRowNumb - limit; i--) {
          const squareUp = allSquares.elmntsArr.filter(square =>
            square.id === pieceColLetter + i &&
            square.getAttribute('data-piece') === 'null'
          )
          if (squareUp.length) moves.push(squareUp[0])
          const squareToEatLeft = allSquares.elmntsArr.filter(square =>
            square.id === boardLetters[pieceColNumb - 2] + (pieceRowNumb - 1) &&
            isPieceDifferentColor(square)
          )
          if (squareToEatLeft.length) moves.push(squareToEatLeft[0])
          const squareToEatRight = allSquares.elmntsArr.filter(square =>
            square.id === boardLetters[pieceColNumb] + (pieceRowNumb - 1) &&
            isPieceDifferentColor(square)
          )
          if (squareToEatRight.length) moves.push(squareToEatRight[0])
          if (!squareUp.length) break;
        }
      }
    }

    //rock queen king
    if (pieceType === 'r' || pieceType === 'q' || pieceType === 'k') {
      const limitUp = pieceType === 'k' ? pieceRowNumb + 1 : 8
      const limitDown = pieceType === 'k' ? pieceRowNumb - 2 : 0
      const limitRight = pieceType === 'k' ? pieceColNumb : 8
      const limitLeft = pieceType === 'k' ? pieceColNumb - 2 : 0
      // up
      for (let i = pieceRowNumb + 1; i <= limitUp; i++) {
        const squareUp = allSquares.elmntsArr.filter(square =>
          square.id === pieceColLetter + i &&
          isSquareNullOrPieceDifferentColor(square)
        )
        if (squareUp.length) {
          moves.push(squareUp[0])
          if (isPieceDifferentColor(squareUp[0])) break
        } else {
          break
        }
      }
      // down
      for (let i = pieceRowNumb - 1; i > limitDown; i--) {
        const squareDown = allSquares.elmntsArr.filter(square =>
          square.id === pieceColLetter + i &&
          isSquareNullOrPieceDifferentColor(square)
        )
        if (squareDown.length) {
          moves.push(squareDown[0])
          if (isPieceDifferentColor(squareDown[0])) break
        } else {
          break
        }
      }
      //right
      for (let i = pieceColNumb; i <= limitRight; i++) {
        const squareRight = allSquares.elmntsArr.filter(square =>
          square.id === boardLetters[i] + pieceRowNumb &&
          isSquareNullOrPieceDifferentColor(square)
        )
        if (squareRight.length) {
          moves.push(squareRight[0])
          if (isPieceDifferentColor(squareRight[0])) break
        } else {
          break
        }
      }
      //left
      for (let i = pieceColNumb - 1; i > limitLeft; i--) {
        const squareLeft = allSquares.elmntsArr.filter(square =>
          square.id === boardLetters[i - 1] + pieceRowNumb &&
          isSquareNullOrPieceDifferentColor(square)
        )
        if (squareLeft.length) {
          moves.push(squareLeft[0])
          if (isPieceDifferentColor(squareLeft[0])) break
        } else {
          break
        }
      }
    }

    //bishop queen king
    if (pieceType === 'b' || pieceType === 'q' || pieceType === 'k') {
      const limit = pieceType === 'k' ? 1 : 8
      // up left
      for (let i = 1; i <= limit; i++) {
        const squareUpLeft = allSquares.elmntsArr.filter(square =>
          square.id === boardLetters[pieceColNumb - 1 - i] + (pieceRowNumb + i) &&
          isSquareNullOrPieceDifferentColor(square)
        )
        if (squareUpLeft.length) {
          moves.push(squareUpLeft[0])
          if (isPieceDifferentColor(squareUpLeft[0])) break
        } else { break }
      }
      //up right
      for (let i = 1; i <= limit; i++) {
        const squareUpRight = allSquares.elmntsArr.filter(square =>
          square.id === boardLetters[pieceColNumb - 1 + i] + (pieceRowNumb + i) &&
          isSquareNullOrPieceDifferentColor(square)
        )
        if (squareUpRight.length) {
          moves.push(squareUpRight[0])
          if (isPieceDifferentColor(squareUpRight[0])) break
        } else { break }
      }
      // down left
      for (let i = 1; i <= limit; i++) {
        const squareDownLeft = allSquares.elmntsArr.filter(square =>
          square.id === boardLetters[pieceColNumb - 1 - i] + (pieceRowNumb - i) &&
          isSquareNullOrPieceDifferentColor(square)
        )
        if (squareDownLeft.length) {
          moves.push(squareDownLeft[0])
          if (isPieceDifferentColor(squareDownLeft[0])) break
        } else { break }
      }
      // down right
      for (let i = 1; i <= limit; i++) {
        const squareDownRight = allSquares.elmntsArr.filter(square =>
          square.id === boardLetters[pieceColNumb - 1 + i] + (pieceRowNumb - i) &&
          isSquareNullOrPieceDifferentColor(square)
        )
        if (squareDownRight.length) {
          moves.push(squareDownRight[0])
          if (isPieceDifferentColor(squareDownRight[0])) break
        } else { break }
      }
    }

    //knight
    if (pieceType === 'n') {
      const jumps = [
        boardLetters[pieceColNumb - 2] + (pieceRowNumb + 2),//squareUpLeft
        boardLetters[pieceColNumb] + (pieceRowNumb + 2),//squareUpRight
        boardLetters[pieceColNumb] + (pieceRowNumb - 2),//squareDownRight
        boardLetters[pieceColNumb - 2] + (pieceRowNumb - 2),//squareDownLeft
        boardLetters[pieceColNumb + 1] + (pieceRowNumb + 1),//upRight
        boardLetters[pieceColNumb + 1] + (pieceRowNumb - 1),//downRight
        boardLetters[pieceColNumb - 3] + (pieceRowNumb + 1),//upLeft
        boardLetters[pieceColNumb - 3] + (pieceRowNumb - 1),//downLeft
      ]
      jumps.forEach(jump => {
        const square = allSquares.elmntsArr.filter(square =>
          square.id === jump && isSquareNullOrPieceDifferentColor(square)
        )
        if (square.length) moves.push(square[0])
      })
    }

    function isSquareNullOrPieceDifferentColor(square) {
      return square.getAttribute('data-piece') === 'null' ||
        square.getAttribute('data-piece')[0] !== pieceColor
    }
    function isPieceDifferentColor(square) {
      return square.getAttribute('data-piece') !== 'null' &&
        square.getAttribute('data-piece')[0] !== pieceColor
    }
    return moves
  }

  createBoard()
  setPosition(initialPos)
  body.onmousemove = e => dragPiece(e)

  window.onchange = resizeBoard
  window.onresize = resizeBoard
}
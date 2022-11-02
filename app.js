const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;  /* Capital case 'cause it doesn't change. it's a constant */

let wordle
let isLoading = true

async function getWordle() {
  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  // add ?random=1 to change the word to a random word
  // add ?puzzle=<number> to add a specific word
  const resObj = await res.json();
  wordle = resObj.word.toUpperCase();
  isLoading = false
  setLoading(false)
}

getWordle()

const keys = [
  'Q',
  'W',
  'E',
  'R',
  'T',
  'Z',
  'U',
  'I',
  'O',
  'P',
  'A',
  'S',
  'D',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'ENTER',
  'Y',
  'X',
  'C',
  'V',
  'B',
  'N',
  '⌫'
]

const guessRows = [
  ['','','','',''],
  ['','','','',''],
  ['','','','',''],
  ['','','','',''],
  ['','','','',''],
  ['','','','','']
]

let currentRow = 0
let currentTile = 0
let isGameOver = false

guessRows.forEach((guessRow, guessRowIndex) => {
  const rowElement =document.createElement('div')
  rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)
  guessRow.forEach((guess, guessIndex) => {
    const tileElement = document.createElement('div')
    tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
    tileElement.classList.add('tile')
    rowElement.append(tileElement)
  })
  tileDisplay.append(rowElement)
})

keys.forEach(key => {
  const buttonElement = document.createElement('button')
  buttonElement.textContent = key
  buttonElement.setAttribute('id', key)
  buttonElement.addEventListener('click', () => handleClick(key))
  keyboard.append(buttonElement)
})

const handleClick = (letter) => {
  if (!isGameOver){
    if (letter === '⌫') {
      deleteLetter()
      return
    }
    if (letter === 'ENTER') {
      checkRow()
      return
    }
    addLetter(letter)
  }
}

document.addEventListener('keydown', (event) => {
  if (isGameOver|| isLoading) {
    // do nothing;
    return;
  }

  const letter = event.key.toUpperCase();

  if (letter === 'BACKSPACE') {
    deleteLetter()
    return
  }
  if (letter === 'ENTER') {
    checkRow()
    return
  } else if (isLetter(letter)) {
    addLetter(letter)
  } else {
    // do nothing
  }
})

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

const addLetter = (letter) => {
  if (currentTile < 5 && currentRow < 6) {
    const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
    tile.textContent = letter
    guessRows[currentRow][currentTile] = letter
    tile.setAttribute('data', letter )
    currentTile++
  }
}

const deleteLetter = () => {
  if (currentTile > 0) {
    currentTile--
    const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
    tile.textContent = ''
    guessRows[currentRow][currentTile] = ''
    tile.setAttribute('data', '' )
  }
}

async function checkRow() {
  const guess = guessRows[currentRow].join('')
  if (currentTile > 4) {
    isLoading = true
    setLoading(true)
      await fetch('https://words.dev-apis.com/validate-word', {
        method: "POST",
        body: JSON.stringify({
          "word": guess
        })
      })
      .then(response => response.json())
      .then(data => {
        if(data.validWord === false) {
          markInvalidWord();
          showMessage('This word is not in the list.')
          return
        } else {
          flipTile()
          if (wordle === guess) {
            // win
            // win
            document.querySelectorAll('.brand').forEach(letter => {
              letter.classList.add("winner")})
            showMessage('Magnificent!')
            isGameOver = true
            return
          } else {
            if(currentRow >= 5) {
              isGameOver = true
              showMessage('Game Over')
              return
            }
            if (currentRow < 5) {
              currentRow++
              currentTile = 0
            }
          }
        } 
      })
      .catch(err => console.log(err))
    }
    isLoading = false
    setLoading(false)
  }

const showMessage = (message) => {
  const messageElement = document.createElement('p')
  messageElement.textContent = message
  messageDisplay.append(messageElement)
  setTimeout(() => messageDisplay.removeChild(messageElement), 2000)
}

const addColorToKey = (keyLetter, color) => {
  const key = document.getElementById(keyLetter)
  key.classList.add(color)
}
const flipTile = () => {
  const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
  let checkWordle = wordle
  const guess = []

  rowTiles.forEach(tile => {
    guess.push({letter : tile.getAttribute('data'), color: 'incorrect' })
  })

  guess.forEach((guess, index) => {
    if (guess.letter === wordle[index]) {
      guess.color = 'correct'
      checkWordle = checkWordle.replace(guess.letter, '')
    }
  })

  guess.forEach(guess => {
    if (checkWordle.includes(guess.letter)) {
      guess.color = 'partial'
      checkWordle = checkWordle.replace(guess.letter, '')
    } 
  })

  rowTiles.forEach((tile , index) => {
    setTimeout(() => {
      tile.classList.add('flip')
      tile.classList.add(guess[index].color)
      addColorToKey(guess[index].letter, guess[index].color)
    }, 450 + (index * 300));
  })
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle('hidden', !isLoading);
}


function markInvalidWord () {
  data = document.querySelectorAll('[data]')
  data.forEach(letter => {
    letter.classList.remove("invalid");
    setTimeout(function () {
      letter.classList.add("invalid");
     }, 10)
    }
  )
};

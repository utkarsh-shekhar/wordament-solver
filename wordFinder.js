'use strict'
const readline = require('readline');
const fs = require('fs');
const jimp = require('jimp');

const Trie = require('./Trie.js');
const Image = require('./image.js');
const screenshot = require('./screenshot.js');
const mouse = require('./mouse.js');

let trie = new Trie()
let usedWords = new Trie()

let grid = []
let letters = null
let possibleWordData = []
let wordcount = 0
const listOfDirections = ['NORTH','SOUTH','EAST','WEST','NORTHEAST','NORTHWEST','SOUTHEAST','SOUTHWEST']
const directionEnum = {
  NORTH: [0, -1],
  SOUTH: [0, 1],
  EAST: [1, 0],
  WEST: [-1, 0],
  NORTHEAST: [1, -1],
  NORTHWEST: [-1, -1],
  SOUTHEAST: [1, 1],
  SOUTHWEST: [-1, 1]
}

const positionsUsed = []

function init(data) {
  return new Promise((resolve, reject) => {
    // grid = [
    //   ['er', 'a', 'b', 'f'],
    //   ['e', 's', 'o', 'k'],
    //   ['o', 'r', 's', 'e'],
    //   ['b', 'a', 'r', 't']
    // ]
    grid = data
    let faultyIndex = -1, temp = []
    for(let i = 0; i < grid.length; i++) {
      if(grid[i].length > 4) {
        faultyIndex = i
        break
      }
    }

    new Promise((res, rej) => {
      if(faultyIndex > -1) {
        console.log("faulty");
        let x = faultyIndex * 4
        Image.recognize('images/' + (x + 0) + '.png')
          .then((result) => {
            temp.push(result)
            return Image.recognize('images/' + (x + 1) + '.png')
          })
          .then((result) => {
            temp.push(result)
            return Image.recognize('images/' + (x + 2) + '.png')
          })
          .then((result) => {
            temp.push(result)
            return Image.recognize('images/' + (x + 3) + '.png')
          })
          .then((result) => {
            temp.push(result)

            grid[faultyIndex] = temp;
            console.log(grid);
            res('success')
          })
      } else {
        res('success')
      }
    })
    .then(() => {
      let reader = readline.createInterface( {
        input: fs.createReadStream('wordlist.txt')
      })

      reader.on('line', (line) => trie.add(line))
      reader.on('close', () => {
        console.log('read files')
        resolve(trie)
      })
    })
  })
}

function makeWords(wordData, index = 0) {
  if (index === wordData.length) {
    return
  }
  console.log(wordData[index].word);

  setTimeout(() => {
    mark(wordData[index].positions)
    makeWords(wordData, index + 1)
  }, 250)

}

function mark(list) {
  let cords = []
  for(let i = 0; i < list.length; i++) {
    let fullIndex = list[i][1] * 4 + list[i][0]

    cords.push([letters[fullIndex].center.x, letters[fullIndex].center.y])
  }
  mouse(cords)
}

function convertFormat(object) {
  return new Promise((resolve, reject) => {
    let text = ''
    for(let i = 0; i < object.text.length; i++) {
      if(object.text[i] === ' ' || (object.text[i] === '\n' && text[text.length - 1] === '\n'))
        continue
      if(object.text[i] === '|') {
        text += 'i'
        continue
      }
      text += object.text[i]
    }
    letters = object.letterRegions
    let rows = text.split('\n')
    let cols = rows.map(row => row.split(''))
    console.log(cols);
    resolve(cols)
  })
}

function isValid(x, y) {
  if(grid.length === 0  ||
    x >= grid[0].length || x < 0 ||
    y >= grid.length || y < 0)
      return false

  return true
}

function isUsed(x, y) {
  for(let i = 0; i < positionsUsed.length; i++) {
    if(positionsUsed[i][0] === x && positionsUsed[i][1] === y)
      return true
  }
  return false
}

function freePosition(x, y) {
  let index = -1
  for(let i = 0; i < positionsUsed.length; i++) {
    if(positionsUsed[i][0] === x && positionsUsed[i][1] === y) {
      index = i
      break
    }
  }

  if(index > -1) positionsUsed.splice(index, 1)
}

function findWords(x, y, prevWord = '') {
  // if(possibleWordData.length === 160) return false

  if(!isValid(x, y) || isUsed(x, y))
    return false

  positionsUsed.push([x, y])
  let newWord = prevWord + grid[y][x]
  let searchResult = trie.search(newWord)
  if(searchResult.status && !usedWords.search(newWord).status) {
    wordcount += 1
    usedWords.add(newWord)
    possibleWordData.push({word: newWord, positions: positionsUsed.slice()})
  }

  if(grid[y][x].indexOf('-') > -1 || !searchResult.hasWordChain) {
    freePosition(x, y)
    return false
  }

  listOfDirections.forEach((direction) => {
    findWords(x + directionEnum[direction][0], y + directionEnum[direction][1], newWord)
  })

  freePosition(x, y)
}

function solve() {
  console.log(grid);
  return new Promise((resolve, reject) => {
    usedWords = new Trie();
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        findWords(i, j)
      }
    }
    console.log('found words: ', wordcount);
    resolve(possibleWordData)
  })
}

screenshot('images/screenshot.png', 2500)
  .then((path) => jimp.read(path))
  // jimp.read('images/screenshot.png')
  .then((image) => Image.checkImage(image))
  .then((result) => convertFormat(result))
  .then((grid) => init(grid))
// init()
  .then(() => solve(), (err) => console.log(err))
  .then((wordData) => makeWords(wordData))
  // .then(() => console.log(trie.search('rises')))

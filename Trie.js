'use strict'
function Trie() {
  this.head = {
    children: {}
  }
}

Trie.prototype.add = function (key) {
  let curIndex = 0,
    curNode = this.head
  while(typeof curNode.children[key[curIndex]] !== 'undefined' && curIndex < key.length) {
    curNode = curNode.children[key[curIndex]]
    curIndex += 1
  }
  while(curIndex < key.length) {
    curNode.children[key[curIndex]] = {
      wordEnd: curIndex === key.length - 1,
      children: {}
    }
    curNode = curNode.children[key[curIndex]]
    curIndex += 1
  }
}

Trie.prototype.search = function (key) {
  let curIndex = 0,
    curNode = this.head
  while(typeof curNode.children[key[curIndex]] !== 'undefined' && curIndex < key.length) {
    curNode = curNode.children[key[curIndex]]
    if(curIndex === key.length - 1 && curNode.wordEnd) {
      return { status: true, hasWordChain: hasProperties(curNode.children) }
    }

    curIndex += 1
  }
  let hasWordChain
  if(curIndex < key.length - 1) {
    hasWordChain = typeof curNode.children[key[curIndex]] !== 'undefined'
  }
  else {
    hasWordChain = hasProperties(curNode.children)
  }
  return { status: false, hasWordChain }
}

function hasProperties(o) {
  for(let prop in o) {
    if(o.hasOwnProperty(prop))
      return true
  }

  return false
}

module.exports = Trie

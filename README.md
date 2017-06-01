# wordament-solver

A bot that solves wordament games. Built using NodeJS with libraries like Jimp, Tesseract.js and Robot.js doing the heavy lifting.


## Getting Started

I've built this code to run on desktop and not on the phone so an emulator has to be used. 

Make sure to go through the prerequisites section to get the environment set up properly for this to work.


### Prerequisites

Since this code works on the desktop, an android emulator(genymotion, etc.) has to be setup with wordament installed on it.

The libraries used are [Jimp](https://www.npmjs.com/package/jimp) for image manipulation, [Tesseract.js](http://tesseract.projectnaptha.com/) for the OCR and [Robot.js](http://robotjs.io/docs/syntax) to move the mouse and form words on the screen. These need to be installed before using this code.


## Running the code

wordFinder.js is the main file for this project. 

1. Run wordament in the android emulator. Make sure that the game has begun.
2. Run wordFinder.js
```
node wordFinder.js
```
3. Profit!


## Authors

* **Utkarsh Shekhar** - [Twitter](https://twitter.com/__utkarsh__)


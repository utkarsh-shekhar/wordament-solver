'use strict'
const jimp = require('jimp');

function Image() {
  // Uses Tesseract js to recognize the letters
  this.recognize = function (path) {
    return new Promise((resolve,reject) => {
      var Tesseract = require('tesseract.js')
      Tesseract.recognize(path)
      .then(function(result){
        let prettyText = result.text.trim().toLowerCase()
        console.log(prettyText)
        resolve(prettyText)
      })
    })
  }

  // This function gets the screenshot and finds out the
  // letter regions
  this.checkImage = function(image) {
    return new Promise((resolve, reject) => {
      let prevPixel = '',
        prevPixelx = 0,
        prevPixely = 0,
        xEdges = [],
        yEdges = []

      for(let i = 0; i < image.bitmap.height; i++) {
        let obj = {startX: -1, endX: -1},
          length = 0
        if(xEdges.length === 4)
          break
        else
          xEdges = []

        for(let j = 0; j < image.bitmap.width; j++) {
          let currentPixelHex = image.getPixelColor(j, i).toString('16').toLowerCase()
          // f09609ff - hex for "orange"
          if(currentPixelHex === 'f09609ff' && prevPixel === 'f09609ff') {
            prevPixel = 'f09609ff'
            length += 1
          } else if(currentPixelHex === 'f09609ff' && prevPixel !== 'f09609ff'){
            obj.startX = j
          } else if(currentPixelHex !== 'f09609ff' && prevPixel === 'f09609ff' && length >= 80){
            obj.endX = j
            xEdges.push(obj)
            obj = {startX: -1, endX: -1}
            length = 0
          }

          prevPixel = currentPixelHex
          prevPixelx = j
          prevPixely = i
        }
      }

      prevPixelx = 0
      prevPixely = 0
      let obj = {startY: -1, endY: -1}
      for(let i = 0; i < image.bitmap.height; i++) {
        let currentPixelHex = image.getPixelColor(xEdges[0].startX + 1, i).toString('16').toLowerCase()
        if(currentPixelHex === 'f09609ff' && prevPixel === 'f09609ff') {
          prevPixel = 'f09609ff'
        } else if(currentPixelHex === 'f09609ff' && prevPixel !== 'f09609ff'){
          obj.startY = i
        } else if(currentPixelHex !== 'f09609ff' && prevPixel === 'f09609ff'){
          obj.endY = i
          yEdges.push(obj)
          obj = {startY: -1, endY: -1}
        }
        prevPixel = currentPixelHex
      }

      let letterRegions = []
      yEdges.forEach((yEdge) => {
        xEdges.forEach((xEdge) => {
          letterRegions.push({
            x: xEdge.startX,
            y: yEdge.startY,
            width: xEdge.endX - xEdge.startX,
            height: yEdge.endY - yEdge.startY,
            center: {
              x: xEdge.startX + (xEdge.endX - xEdge.startX) / 2,
              y: yEdge.startY + (yEdge.endY - yEdge.startY) / 2
            }
          })
        })
      })

      let image_width = 0
      for(let i = 0; i < 4; i++) {
        image_width += letterRegions[i].width
      }
      let image_height = 0
      for(let i = 0; i < letterRegions.length; i += 4) {
        image_height += letterRegions[i].width
      }

      let self = this
      let newImage = new jimp(image_width, image_height, function (err, newimage) {
          letterRegions.forEach((letterRegion, index) => {
            console.log(letterRegion.x, letterRegion.y, letterRegion.width, letterRegion.height);
            let copy = image.clone()
            copy.crop(letterRegion.x, letterRegion.y, letterRegion.width, letterRegion.height)
            for(let i = 0; i < 20; i++) {
              for(let j = 0; j < 20; j++) {
                copy.setPixelColor(0xf09609ff, j, i)
              }
            }
            let file = 'images/' + index + '.' + image.getExtension();
            copy.write(file)

            newimage.composite(copy, (index % 4) * (letterRegion.width ), parseInt(index / 4) * (letterRegion.height ))
          })

          newimage.write('images/newImage.png', () => {
            self.recognize('images/newImage.png')
              .then((prettyText) => resolve({text: prettyText, letterRegions}))
            })
          })
      });
  }

}


module.exports = new Image()

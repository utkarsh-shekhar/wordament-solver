'use strict'
// var tesseract = require('node-tesseract');
// // Recognize text of any language in any format
// tesseract.process(__dirname + '/images/4.png',function(err, text) {
//     if(err) {
//         console.error(err);
//     } else {
//         console.log(text);
//     }
// });

var Tesseract = require('tesseract.js')
Tesseract.recognize('images/newImage.png')
.then(function(result){
  let prettyText = result.text.trim()
  console.log(prettyText)
})

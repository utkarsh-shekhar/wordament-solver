'use strict'
const childProcess = require('child_process')

function takeScreenshot(path, time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      childProcess.exec('import -window root ' + path, function(err){
        if(err) {
          console.log(503,'Error creating image!', err);
          reject(err)
        } else {
           console.log('screenshot.png')
           resolve(path)
        }
      })
    }, time)
  })
}

module.exports = takeScreenshot

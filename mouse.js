'use strict'
const robot = require('robotjs');

function moveMouse(list) {
  robot.setMouseDelay(15)

  robot.moveMouse(list[0][0], list[0][1]);
  robot.mouseToggle("down");
  for(let i = 1; i < list.length; i++)
    robot.moveMouse(list[i][0], list[i][1]);
  robot.mouseToggle("up");

}

module.exports = moveMouse

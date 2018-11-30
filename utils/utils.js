const baseIntervalLength = 1500;
const baseDecayLength = 100;

function generateRGBValue (upperLimit) {
  return Math.floor(Math.random() * upperLimit);
}

function randomize (multiplier) {
  return Math.random() * multiplier;
}

function CMole() {
  this.id = null;
  this.color = null;
  this.visible = null;
}

function CGame() {
  this.moles = [];
  this.intervals = [];
  this.timer = null;
  this.intervalGame = null;
  this.hasStarted = null;
  this.hasEnded = null;
  this.points = null;
}

CGame.prototype.initialize = function (socket) {
  this.points = 0;
  this.hasStarted = false;
  this.hasEnded = false;

  for (var i = 0; i < 9; i++) {
    var color = 'rgb(' + generateRGBValue(255) + ',' + generateRGBValue(255) + ',' + generateRGBValue(255) + ')';
    var visible = (Math.random() > 0.35 ? true : false);
    var mole = new CMole();
    mole.initialize(i, color, visible);
    this.moles.push(mole);
  }
  console.log(this.moles);
  socket.emit('init', this.moles);
};

CGame.prototype.click = function (index, socket) {
  var self = this;

  if (!this.hasStarted) {
    this.hasStarted = true;
    this.startGameInterval(socket);
    this.moles.forEach(function (mole, index) {
      self.stopMoleInterval(index);
      self.startMoleInterval(index, baseIntervalLength - randomize(500), baseDecayLength, socket);
    });
  } else {
    this.stopMoleInterval(index);
    this.startMoleInterval(index, baseIntervalLength - randomize(500), baseDecayLength, socket);
  }

  this.points++;
  socket.emit('point');  
};

CGame.prototype.startGameInterval = function (socket) {
  var self = this;

  this.intervalGame = setInterval(function () {
    self.timer++;
    self.checkGameEnd(socket);
    socket.emit('ticker');
  }, 1000);
};

CGame.prototype.stopGameInterval = function () {
  clearInterval(this.intervalGame);
};

CGame.prototype.startMoleInterval = function (index, duration, decay, socket) {
  var self = this;
  var intervalDuration = duration;  

  this.intervals[index] = setInterval(function () {
    self.moles[index].toggleVisibility();
    intervalDuration -= decay;
    socket.emit('moleInterval', index);
    console.log('Mole interval: ' + index);
  }, intervalDuration);
};

CGame.prototype.stopMoleInterval = function (index) {
  clearInterval(this.intervals[index]);
};

CGame.prototype.checkGameEnd = function (socket) {
  if (this.timer == 60) {
    socket.emit('end', this.points);
    this.end(socket);
    console.log('Game ended with ' + this.points + ' points.');
  }
};

CGame.prototype.end = function (socket) {
  var self = this;
  this.hasEnded = true;
  this.stopGameInterval();
  
  this.intervals.forEach(function (interval, index) {
    self.stopMoleInterval(index);
  });
};

CMole.prototype.initialize = function (id, color, visible) {
  this.id = id;
  this.color = color;
  this.visible = visible;
};

CMole.prototype.toggleVisibility = function () {
  this.visible = !this.visible;
};

module.exports = {
  game: CGame,
  initialize: CGame.prototype.initialize,
  end: CGame.prototype.end
};
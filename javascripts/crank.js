function getCrankSpeedText() {
  return `Current Speed: ${shortenMoney(player.crankSpeed)}/${shortenMoney(player.crankSpeedCap)}`
}

var crankSpeedBar = new ProgressBar.Line('#crankSpeedBar', {
  strokeWidth: 4,
  easing: 'easeInOut',
  duration: 5000,
  color: '#FFEA82',
  trailColor: '#eee',
  trailWidth: 1,
  svgStyle: {width: '100%', height: '100%'},
  text: {
    style: {
      // Text color.
      // Default: same as stroke color (options.color)
      position: 'relative',
      color: '#999',
      right: '0',
      top: '30px',
      padding: 0,
      margin: 0,
      transform: null
    },
    autoStyleContainer: false
  },
  from: {color: '#7FFF00'},
  to: {color: '#DC143C'},
  step: (state, bar) => {
    bar.path.setAttribute('stroke', state.color);
    bar.setText(getCrankSpeedText());
  }
});

function updateCrankSpeedBar() {
  crankSpeedBar.set(player.crankSpeed.div(player.crankSpeedCap))
}

function spinCrank() {
  player.crankSpeedDelta = Decimal.min(player.crankMaxDelta, player.crankSpeedDelta.plus(player.crankSpinPower))
}

function refreshCrankStats() {
  resetValues(["crankSpeed","crankSpeedCap","crankSpinPower","crankSlowdownRate","crankSpeedDelta","crankMaxDelta"])
}

function getCrankBoost() {
  return player.crankSpeed.div(100).plus(1)
}

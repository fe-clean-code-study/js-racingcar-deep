import Car from './Car.js'
import Game from './Game.js'

export default class RacingGame extends Game {
  constructor({ miniGames }) {
    super({ miniGames })
    this.cars = []
    this.players = []
  }

  get maxPosition() {
    return Math.max(...Object.values(this.lastResult.positions))
  }

  get winners() {
    const { positions } = this.lastResult
    return Object.keys(positions).filter(name => positions[name] === this.maxPosition)
  }

  setMaxRound(maxRound) {
    this.maxRound = maxRound
  }

  addPlayer(name) {
    const newPlayerCar = new Car(name)
    this.players.push(newPlayerCar.name)
    this.cars.push(newPlayerCar)
  }

  addCar(name) {
    const newCar = new Car(name)
    this.cars.push(newCar)
  }

  async doRound() {
    this.selectRandomMiniGame()
    this.emitEvent('roundStart')

    for (const car of this.cars) {
      await this.race(car)
    }

    this.addResult(this.createResult())
    this.emitEvent('roundEnd')
  }

  createResult() {
    const result = {
      ruleName: this.currentMiniGame,
      positions: this.cars.reduce((acc, car) => ({
        ...acc,
        [car.name]: car.position,
      }), {}),
      gameLogs: this.gameLogs,
    }
    this.gameLogs = {}
    return result
  }

  async race(car) {
    const miniGameResult = await this.doMiniGame(car)
    if (miniGameResult.hasOwnProperty('score')) {
      car.move(miniGameResult.score)
    }
    if (miniGameResult.hasOwnProperty('win')) {
      car.move(miniGameResult.win ? 1 : 0)
    }
    this.gameLogs = { ...this.gameLogs, [car.name]: miniGameResult.log }
  }

  async doMiniGame(car) {
    const miniGame = this.miniGames[this.currentMiniGame]

    if (this.players.includes(car.name)) {
      this.emitEvent('miniGameStart', car.name)
      return await miniGame.PvC(car.name)
    }

    return miniGame.CvC(car.name)
  }
}
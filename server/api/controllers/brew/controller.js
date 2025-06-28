/**
 * @class Controller
 * @description Handles the endpoint for brewing coffee
 * @method brew
 * @param {import('express').Request} req - The request object
 * @param {import('express').Response} res - The response object
 * @returns {Promise<void>} - A promise that resolves when the endpoint
 * is finished
 */
class Controller {
  /**
   * Simulates the brewing process.
   * Responds with a successful juice brewing message 20% of the time,
   * otherwise responds with a teapot error message.
   *
   * @param {import('express').Request} req - The request object
   * @param {import('express').Response} res - The response object
   */
  brew(req, res) {
    let random = req.query.luck
      ? 1 - Number(req.query.luck) / 100
      : Math.random();
    if (random < 0.2) {
      res.status(200).json({
        message: 'Juice successfully brewed. Wait, what?',
      });
    } else {
      res.status(418).json({
        message:
          "I'm a teapot. I cannot brew coffee, because I am, quite literally, a teapot.",
      });
    }
  }
}

export { Controller };
export default new Controller();

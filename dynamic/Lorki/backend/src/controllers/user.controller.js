const UserService = require("../services/user.service");

class UserController {
  static async checkEmail(req, res) {
    await UserService.checkEmail(req.body.email);
    res.json({ msg: "Valid email" });
  }

  static async register(req, res, next) {
    const data = await UserService.register(req.body);

    return res.status(201).json({
      data,
    });
  }

  static async login(req, res, next) {
    const data = await UserService.login(req.body);
    return res.status(200).json({
      data,
    });
  }

  static async getUser(req, res) {
    const data = await UserService.getUser(req.params.userId);
    res.json(data);
  }

  static async getCurrentUser(req, res) {
    const data = await UserService.getUser(req.user.userId);
    res.json(data);
  }

  static async getAllUsers(req, res) {
    const data = await UserService.getAllUsers();
    res.json({ data });
  }

  static async update(req, res) {
    const data = await UserService.update(req.params.userId, req.body);
    res.json({ data });
  }
}

module.exports = UserController;

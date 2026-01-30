import User from "../models/User.model.js";

export const getUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
};

export const createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};

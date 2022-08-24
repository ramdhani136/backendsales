const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { permissionUser } = require("../utils/getPermission");
var IO = require("../app");
const Users = db.users;
const sharp = require("sharp");
const path = require("path");

const newUsers = async (userId, type) => {
  const isUser = await permissionUser(userId, type);
  return await Users.findAll({
    where: isUser.length > 0 && { id: isUser },
    include: [
      {
        model: db.roleusers,
        as: "role",
        attributes: ["id", "id_roleprofile", "status"],
        include: [
          {
            model: db.roleprofiles,
            as: "roleprofile",
            attributes: ["id", "name", "status"],
            include: [
              {
                model: db.rolelists,
                as: "rolelist",
                attributes: [
                  "id",
                  "doc",
                  "create",
                  "read",
                  "update",
                  "delete",
                  "amend",
                  "submit",
                  "report",
                  "export",
                  "status",
                ],
              },
            ],
          },
        ],
      },
    ],
    attributes: [
      "id",
      "name",
      "username",
      "email",
      "phone",
      "img",
      "erpToken",
      "status",
    ],
  });
};

const newUsersById = async (id, userId, type) => {
  const isUser = await permissionUser(userId, type);
  return await Users.findAll({
    where: isUser.length > 0 && [{ id: isUser }, { id: id }],
    include: [
      {
        model: db.roleusers,
        as: "role",
        attributes: ["id", "id_roleprofile", "status"],
        include: [
          {
            model: db.roleprofiles,
            as: "roleprofile",
            attributes: ["id", "name", "status"],
            include: [
              {
                model: db.rolelists,
                as: "rolelist",
                attributes: [
                  "id",
                  "doc",
                  "create",
                  "read",
                  "update",
                  "delete",
                  "amend",
                  "submit",
                  "report",
                  "export",
                  "status",
                ],
              },
            ],
          },
        ],
      },
    ],
    attributes: [
      "id",
      "name",
      "username",
      "email",
      "phone",
      "img",
      "erpToken",
      "status",
    ],
  });
};

const getUsers = async (req, res) => {
  const isUser = await permissionUser(req.userId, "user");
  try {
    const users = await Users.findAll({
      where: isUser.length > 0 && { id: isUser },
      include: [
        {
          model: db.roleusers,
          as: "role",
          attributes: ["id", "id_roleprofile", "status"],
          include: [
            {
              model: db.roleprofiles,
              as: "roleprofile",
              attributes: ["id", "name", "status"],
              include: [
                {
                  model: db.rolelists,
                  as: "rolelist",
                  attributes: [
                    "id",
                    "doc",
                    "create",
                    "read",
                    "update",
                    "delete",
                    "amend",
                    "submit",
                    "report",
                    "export",
                    "status",
                  ],
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "phone",
        "img",
        "erpToken",
        "status",
      ],
    });
    IO.setEmit("users", await newUsers(req.userId, "user"));
    res.json({ users });
  } catch (err) {
    res.json(err);
  }
};

const getUsersById = async (req, res) => {
  let id = req.params.id;
  const isUser = await permissionUser(req.userId, "user");
  try {
    const users = await Users.findAll({
      where: [isUser.length > 0 && { id: isUser }, { id: id }],
      include: [
        {
          model: db.roleusers,
          as: "role",
          attributes: ["id", "id_roleprofile", "status"],
          include: [
            {
              model: db.roleprofiles,
              as: "roleprofile",
              attributes: ["id", "name", "status"],
              include: [
                {
                  model: db.rolelists,
                  as: "rolelist",
                  attributes: [
                    "id",
                    "doc",
                    "create",
                    "read",
                    "update",
                    "delete",
                    "amend",
                    "submit",
                    "report",
                    "export",
                    "status",
                  ],
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "phone",
        "img",
        "erpToken",
        "status",
      ],
    });
    IO.setEmit("users", await newUsers(req.userId, "user"));
    res.json({ users });
  } catch (err) {
    res.json(err);
  }
};

const register = async (req, res) => {
  const { name, username, email, password, confpassword, phone, img } =
    req.body;
  if (password !== confpassword)
    return res.status(400).json({
      status: false,
      message: "Password dan confirm password tidak cocok",
    });
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    const user = await Users.create({
      name: name,
      email: email,
      username: username,
      password: hashPassword,
      phone: phone,
      img: img,
    });
    IO.setEmit("users", await newUsers(req.userId, "user"));
    res.status(200).send(user);
  } catch (error) {
    res.json(error);
  }
};

const login = async (req, res) => {
  try {
    const user = await Users.findAll({
      where: { username: req.body.username },
      include: [
        {
          model: db.roleusers,
          as: "role",
          attributes: ["id", "id_roleprofile", "status"],
          include: [
            {
              model: db.roleprofiles,
              as: "roleprofile",
              attributes: ["id", "name", "status"],
              include: [
                {
                  model: db.rolelists,
                  as: "rolelist",
                  attributes: [
                    "id",
                    "doc",
                    "create",
                    "read",
                    "update",
                    "delete",
                    "amend",
                    "submit",
                    "report",
                    "export",
                    "status",
                  ],
                },
              ],
            },
          ],
        },
      ],
      attribute: [
        "id",
        "name",
        "username",
        "email",
        "phone",
        "img",
        "erpToken",
        "status",
      ],
    });
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match)
      return res.status(400).json({ status: false, msg: "Wrong Password" });
    const userId = user[0].id;
    const name = user[0].name;
    const username = user[0].username;
    const email = user[0].email;
    const phone = user[0].phone;
    const img = user[0].img;
    const role = user[0].dataValues.role;
    const erpToken = user[0].erpToken;

    const accessToken = jwt.sign(
      { userId, name, username, email, phone, img, role, erpToken },
      process.env.ACCESS_TOKEN_SECRET,
      {
        // expiresIn: "20s",
        expiresIn: "324000s",
      }
    );

    const refreshToken = jwt.sign(
      { userId, name, username, email, phone, img, role, erpToken },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "90d",
      }
    );
    await Users.update(
      { refresh_token: refreshToken },
      { where: { id: userId } }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: false, msg: "User not found!" });
  }
};

const refreshToken = async (req, res) => {
  const userId = req.params.id;
  try {
    if (!userId) return res.sendStatus(401);
    const user = await Users.findAll({
      where: { id: userId },
      include: [
        {
          model: db.roleusers,
          as: "role",
          attributes: ["id", "id_roleprofile", "status"],
          include: [
            {
              model: db.roleprofiles,
              as: "roleprofile",
              attributes: ["id", "name", "status"],
              include: [
                {
                  model: db.rolelists,
                  as: "rolelist",
                  attributes: [
                    "id",
                    "doc",
                    "create",
                    "read",
                    "update",
                    "delete",
                    "amend",
                    "submit",
                    "report",
                    "export",
                    "status",
                  ],
                },
              ],
            },
          ],
        },
      ],
      attribute: [
        "id",
        "name",
        "username",
        "email",
        "phone",
        "img",
        "erpToken",
        "status",
      ],
    });

    if (!user[0]) return res.sendStatus(403);
    jwt.verify(
      user[0].refresh_token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return sendStatus(403);
        const userId = user[0].id;
        const name = user[0].name;
        const username = user[0].username;
        const email = user[0].email;
        const phone = user[0].phone;
        const img = user[0].img;
        const role = user[0].dataValues.role;
        const erpToken = user[0].erpToken;
        const accessToken = jwt.sign(
          {
            userId,
            name,
            username,
            email,
            phone,
            img,
            role,
            erpToken,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            // expiresIn: "20s",
            expiresIn: "324000s",
          }
        );

        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  const user = await Users.findAll({
    where: { refresh_token: refreshToken },
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await Users.update({ refresh_token: null }, { where: { id: userId } });
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};

const updateData = async (req, res) => {
  let id = req.params.id;
  let result = await newUsersById(id, req.userId, "user");
  if (result.length > 0) {
    try {
      await db.users.update(req.body, {
        where: { id: id },
      });

      if (req.file != undefined) {
        try {
          const compressedImage = await path.join(
            __dirname,
            "../public/users",
            `${result[0].name}.jpg`
          );
          await sharp(req.file.path)
            .resize(640, 480, {
              fit: sharp.fit.inside,
              withoutEnlargement: true,
            })
            .jpeg({
              quality: 100,
              progressive: true,
              chromaSubsampling: "4:4:4",
            })
            .withMetadata()
            .toFile(compressedImage, (err, info) => {
              if (err) {
                console.log(err);
              } else {
                console.log(info);
              }
            });

          await db.users.update(
            { img: `${result[0].name}.jpg` },
            {
              where: { id: id },
            }
          );
          res.status(200).json({
            status: true,
            message: "successfully save data",
            data: await newUsersById(id, req.userId, "user"),
          });
        } catch (error) {
          console.log(error);
          res.status(400).json({ status: false, message: error });
        }
      } else {
        res.status(200).json({
          status: true,
          msg: "Success",
          data: await newUsersById(id, req.userId, "user"),
        });
      }
    } catch (err) {
      res.status(404).json({ status: false, msg: "Error!" });
    }
  } else {
    res.status(404).json({ status: false, msg: "User not found" });
  }
};

module.exports = {
  getUsers,
  register,
  login,
  refreshToken,
  logout,
  getUsersById,
  updateData,
};

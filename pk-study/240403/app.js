const express = require("express");
const badyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;
// ! JWT 비밀 키
const SECRET_KEY = crypto.randomBytes(256).toString("hex");

app.use(bodyParser.json());

app.use(express.static("public"));

// ? 간단한 사용자 데이터베이스 대용
const users = [
  {
    id: "1",
    username: "user1",
    password: "1234",
  },
  {
    id: "2",
    username: "user2",
    password: "5678",
  },
];

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 사용자 검증
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // JWT 생성
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } else {
    res.status(401).send("Username or password is incorrect");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

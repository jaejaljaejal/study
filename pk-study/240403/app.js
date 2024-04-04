const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;
// ! JWT 비밀 키
const SECRET_KEY = crypto.randomBytes(256).toString("hex");
const ACCESS_TOKEN_SECRET = crypto.randomBytes(256).toString("hex");
const REFRESH_TOKEN_SECRET = crypto.randomBytes(256).toString("hex");

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

// JWT 토큰 디코딩
function parseJwt(token) {
  var base64Payload = token.split(".")[1]; // 토큰의 두 번째 부분(페이로드)을 가져옴
  var payload = Buffer.from(base64Payload, "base64"); // Base64 디코딩
  return JSON.parse(payload); // JSON 객체로 파싱
}

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
    const accessToken = jwt.sign(
      {
        /* 페이로드 */
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      {
        /* 페이로드 */
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, accessToken, refreshToken });

    let decoded = parseJwt(token);
    console.log(decoded);
  } else {
    res.status(401).send("Username or password is incorrect");
  }
});

app.post("/verify", (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // 'Bearer TOKEN_STRING'에서 토큰 추출
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ message: "유효하지 않은 jwt 토큰입니다" });
    }
    res.json({ message: "유효한 jwt 토큰입니다" });
  });
});

app.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Refresh Token is invalid" });
    }
    // 리프레시 토큰이 유효한 경우, 새로운 액세스 토큰 발급
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken: newAccessToken });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authToken = req.headers.authorization.split(" ")[1];
    const decodedData = jwt.verify(authToken, "test_secret_token");
    if(req.body) {
      req.body.userId = decodedData.userId;
      req.body.username = decodedData.username;
    }
    next();
  } catch {
    res.send(401).json({
      message: "Authentication token not found"
    })
  }

}

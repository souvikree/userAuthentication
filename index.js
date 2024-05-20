const express = require("express");
const passport = require("passport");
const User = require("./models/User.js")
require("dotenv").config();
const authRoutes = require("./routes/auth.js")
require("./Database/db.js");
const JwtStrategy = require("passport-jwt").Strategy,
ExtractJwt = require("passport-jwt").ExtractJwt;
const app = express();
const port = 8000;

app.use(express.json());

//setup passport jwt
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "thiskeyissupposedtobesecret";
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne({ id: jwt_payload.sub }, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    });
  })
);
app.get("/", (_req, res) => {
  res.send("server is running");
});

app.use("/auth", authRoutes);


app.listen(port, () => {
  console.log("App is running on port " + port);
});

const jwt = require("jsonwebtoken");
exports= {}


exports.getToken = async (_email, user)=> {
    const token = jwt.sign({identifier: user._id}, "thiskeyissupposedtobesecret");
    return token;
}


module.exports = exports
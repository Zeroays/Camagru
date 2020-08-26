require('dotenv').config({path: '../../../.env'});
const User = require('./Models/SignupModel');

const security = require('./Security');

const checkUser = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                res.json({ authorized: false });
            } else {
                const { username } = user;
                if (security.createHash(password) == user.pwd) {
                    const token = security.createToken(email, username);
                    res.json({ authorized: true, access_token: token });
                } else {
                    res.json({ authorized: false });
                }
            }
        })
        .catch(err => console.log(err));
}

module.exports = {
    checkUser
}


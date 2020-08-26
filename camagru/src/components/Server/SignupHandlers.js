require('dotenv').config({path: '../../../.env'});
const User = require("./Models/SignupModel");
const sendEmail = require("./Email")
const template = require('./Email Templates/SignupTemplate');

const security = require('./Security');

const msgs = {
    confirm: "Confirmation Email has been sent.  Please check your Inbox, and confirm",
    confirmed: "Your email has been successfully confirmed",
    userExists: "A user with that email is on file.  Please Sign-In",
    resend: "A new Confirmation email has been sent.",
    couldNotFind: "User could not be found",
    alreadyConfirmed: "Your email has already been confirmed"
}

const checkAccount = (req, res) => {
    const { firstName, lastName, username, password, email } = req.body
    User.findOne({ $or: [{email}, {username}] })
        .then(user => {
            if (!user) {
                pwd = security.createHash(password);
                User.create({ firstName, lastName, username, email, pwd })
                    .then(newUser => {
                        sendEmail(newUser.email, template.confirm(newUser._id))
                        const token = security.createToken(newUser.email, newUser.username);
                        res.json({ 'access_token': token });
                    })
                    .catch(err => console.log(err))
            }
            else if (user && !user.confirmed) {
                sendEmail(user.email, template.confirm(user._id))
                    .then(() => res.json({ msg: msgs.resend, userExists: true }))
            }
            else {
                res.json({ msg: msgs.alreadyConfirmed, userExists: true })
            }
        })
        .catch(err => console.log(err))
}

const confirmAccount = (req, res) => {
    const { id } = req.params
    User.findById(id)
        .then(user => {
            if (user && !user.confirmed) {
                User.findByIdAndUpdate(id, { confirmed: true })
                .then(() => res.json({ msg: msgs.confirmed }))
                .catch(err => console.log(err))
            }
            else
                res.json({ msg: msgs.alreadyConfirmed })
        })
        .catch(err => {
            console.log(err)
            if (err.name === "CastError")
                res.json({ msg: msgs.couldNotFind })
        })
}

module.exports = {
    checkAccount,
    confirmAccount
}
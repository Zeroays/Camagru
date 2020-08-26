require('dotenv').config({path: '../../../.env'});

const User = require("./Models/SignupModel");
const UserPhoto = require("./Models/UserPhotosModel");
const AllPhotos = require("./Models/AllPhotosModel");

const resetTemplate = require('./Email Templates/ResetTemplate');
const confirmTemplate = require('./Email Templates/SignupTemplate');
const commentNotificationTemplate = require('./Email Templates/CommentNotificationTemplate');

const sendEmail = require('./Email');

const jwt = require('jsonwebtoken');
const security = require('./Security');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const resetPassword = (req, res) => {
    const { login } = req.body
    const loginQuery = [ {email: login}, {username: login} ]
    User.findOne({ $or: loginQuery })
        .then(user => {
            if (user) {
                const generatedPWD = security.createPWD();
                const hashTmpPWD = security.createHash(generatedPWD);
                User.updateOne({email: user.email}, {$set: {'pwd': hashTmpPWD}})
                .then(() => {
                    sendEmail(user.email, resetTemplate.confirm(tmpPWD))
                        .then(() => res.json({ msg: "Email sent" }))
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
}

const getUserInfo = (req, res) => {
    const payload = security.getTokenPayload(req);
    User.findOne({ email: payload.email })
        .then(user => {
            if (user) {
                const { firstName, lastName, username, email, notification } = user;
                res.json({ firstName, lastName, username, email, notification, authorized: true });
            } else {
                res.json({ authorized: false });
            }
                
        })
        .catch(err => console.log(err))
}

const modifyUserInfo = (req, res) => {
    const payload = security.getTokenPayload(req);
    const { firstName, lastName, username, email, password, newPassword, notification } = req.body;
    
    User.findOne({ email: payload.email })
        .then(user => {
            if (user && security.createHash(password) === user.pwd) {
                updateUserSettingsOnServer(user);
            } else {
                res.json({ authorized: false });
            }
        })
        .catch(err => {console.log(err)});

    const updateUserSettingsOnServer = user => {
        const updateQuery = {
            $set: {
                'confirmed': user.email === req.body.email ? user.confirmed : false,
                'firstName': firstName, 
                'lastName': lastName, 
                'username': username,
                'email': email,
                'notification': notification,
                'pwd': newPassword !== "" ? security.createHash(newPassword) : security.createHash(password)
            }
        }

        User.updateOne({ email: payload.email }, updateQuery)
            .then(() => {
                if (payload.email !== email) {
                    sendEmail(email, confirmTemplate.confirm(user._id))
                        .then(() => {
                            //ADDED BELOW
                            const token = security.createToken(email, username);
                            res.json({ authorized: true, access_token: token })
                        })
                        .catch(err => console.log(err))
                } else {
                    res.json({ authorized: true });
                }
            })
            .catch(err => {console.log(err)});
    }
}

const addUserPhoto = (req, res) => {
    let cloudinaryResult = null;
    const payload = security.getTokenPayload(req);
    const { username } = payload;

    cloudinary.uploader.upload(
        req.body.photo, {
            resource_type: "image", 
            folder: username,
            use_filename: true,
            overwrite: false
        }, 
        (err, result) => {
            if (err) { res.json({ success: false })}
            else {
                cloudinaryResult = result;
                createUserPhotoDBEntry();
            }
        }
    );

    const createUserPhotoDBEntry = () => {
        UserPhoto.findOne({ username })
            .then(user => {
                if (!user) {
                    UserPhoto.create({ username })
                        .then(newUser => {
                            updateUserPhotoDBEntry(newUser.username); 
                        })
                        .catch(err => {console.log(err)})
                } else { 
                    updateUserPhotoDBEntry(username); 
                }
            })
    }

    const updateUserPhotoDBEntry = user => {
        UserPhoto.updateOne(
            { username: user }, 
            { $push: { 'photos': cloudinaryResult.url } }
        )
            .then(() => {
                AllPhotos.create({ 
                    username, creationDate: Date.now(), 
                    imgLink: cloudinaryResult.url, publicID: cloudinaryResult.public_id 
                })
                    .then(() => {res.json({ imgLink: cloudinaryResult.url })})
                    .catch(err => {console.log(err)})
            
            })
    }
    
}

const getUserPhotos = (req, res) => {
    const payload = security.getTokenPayload(req);
    UserPhoto.findOne({ username: payload.username })
        .then(user => {
            if (user) {
                const userPhotos = user.photos;
                res.json({ photos: userPhotos });
            } else {
                res.json({ authorized: false })
            }
        })
        .catch(err => {console.log(err)})
}

const getAllPhotos = (req, res) => {
    const payload = security.getTokenPayload(req);
    AllPhotos.find({})
        .then(photos => {
            res.json({ photos: photos, user: payload ? payload.username : null })
        })
        .catch(err => {console.log(err)})
}

const delUserPhoto = (req, res) => {
    const payload = security.getTokenPayload(req);
    const imgSrc = req.body.src;
    
    const deletePhotoFromServers = () => {
        AllPhotos.findOneAndDelete({ imgLink: imgSrc })
            .then(user => {
                if (user) {
                    cloudinary.uploader.destroy(user.publicID);
                    res.json({ deleted: true })
                }
            })
            .catch(err => {console.log(err)})
    }

    UserPhoto.findOneAndUpdate({ username: payload.username }, { $pull: {'photos' : { $in: imgSrc } } })
        .then(user => {
            if (user) { deletePhotoFromServers(); }
        })
        .catch(err => {console.log(err)})
}

const likePhoto = (req, res) => {
    const payload = security.getTokenPayload(req);
    const { imgLink, liked } = req.body;
    if (payload) {
        const updateQuery = 
            liked 
                ? { $addToSet: { likes: payload.username }, $inc: { likesAmt: 1 } }
                : { $pull: { likes: payload.username }, $inc: { likesAmt: -1 } };
        AllPhotos.findOneAndUpdate({ imgLink: imgLink }, updateQuery, { "new": true })
            .then(result => {
                res.json({ likesAmt: result.likesAmt, authorized: true })
            })
            .catch(err => {console.log(err)})
    } else {
        res.json({ authorized: false })
    }
}

const commentPhoto = (req, res) => {
    const payload = security.getTokenPayload(req);
    const { imgLink, user, content, date } = req.body;

    if (payload !== null) {
        AllPhotos.findOneAndUpdate(
            { imgLink: imgLink },
            { $push: { comments: { user: payload.username, content, date }} },
            { "new": true }
        )
            .then(result => {
                const commentPostedConfirmation = () => {
                    const { comments } = result;
                    const recentCommentID = comments[comments.length - 1]._id;
                    res.json({ _id: recentCommentID, authorized: true });
                }
    
    
                if (user !== payload.username) {
                    User.findOne({ username: user })
                        .then(username => {
                            if (username.notification === true) {
                                sendEmail(username.email, commentNotificationTemplate.confirm(payload.username, content, imgLink))
                                    .then(() => { commentPostedConfirmation(); })
                                    .catch(err => console.log(err))
                            } else {
                                commentPostedConfirmation();
                            }
                        })
                        .catch(err => {console.log(err)})
                } else {
                    commentPostedConfirmation();
                }
            })
            .catch(err => {console.log(err)})
    } else {
        res.json({ authorized: false });
    }
    
}

module.exports = {
    resetPassword, getUserInfo, modifyUserInfo,
    addUserPhoto, getUserPhotos, delUserPhoto,
    getAllPhotos, likePhoto, commentPhoto
}
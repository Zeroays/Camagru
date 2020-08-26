require('dotenv').config({path: '../../.env'});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

const signupController = require('./SignupHandlers');
const loginController = require('./LoginHandlers');
const userController = require('./UserHandlers');

const { PORT, CLIENT_ORIGIN, TRUE_CLIENT_ORIGIN, DB_URL } = require('./Config');

app.use((req, res, next) => {
    // cors({ origin: 'http://' + CLIENT_ORIGIN });
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
})
    
app.use(express.json());

app.get('/', (req, res) => { res.json({ authorized: true }) });
app.get('/signup/confirm/:id', signupController.confirmAccount);
app.get('/studio', verifyToken, (req, res) => { res.json({ authorized: true }) });
app.get('/settings', verifyToken, userController.getUserInfo);
app.get('/getPhotos', verifyToken, userController.getUserPhotos);
app.get('/allPhotos', userController.getAllPhotos);

app.post('/signup', signupController.checkAccount);
app.post('/login', loginController.checkUser);
app.post('/forgot', userController.resetPassword);
app.post('/modify', verifyToken, userController.modifyUserInfo)
app.post('/submitPhoto', verifyToken, userController.addUserPhoto);
app.post('/deletePhoto', verifyToken, userController.delUserPhoto);
app.post('/likePhoto', userController.likePhoto);
app.post('/commentPhoto', userController.commentPhoto);

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (e) {
        return res.json({ authorized: false });
    }
}

app.use('*', (req, res) => {
   res.status(404).json({ msg: 'Not Found' })
})

const options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}

mongoose.connect(DB_URL, options, (err, db) => {
        app.listen(PORT, CLIENT_ORIGIN, () => {
            console.log(`Listening on ${TRUE_CLIENT_ORIGIN} Port: ${PORT}`);
            console.log("Server Connection Successful");
        })
    })
    .catch(err => console.log(err))

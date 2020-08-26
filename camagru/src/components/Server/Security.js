require('dotenv').config({path: '../../../.env'});
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pwdGenerator = require('generate-password');

const createPWD = () => {
    tmpPWD = pwdGenerator.generate({
        length: 10,
        numbers: true
    })
    return (tmpPWD);
}

const createHash = data => {
    const hash = crypto.createHash('sha256');
    encryptData = hash.update(data).digest('hex');
    return (encryptData);
}

const createToken = (email, username) => {
    const token = jwt.sign({ email, username }, process.env.JWT_SECRET, { expiresIn: '16h' });
    return (token);
}

const getTokenPayload = req => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    try {
        const decode = jwt.decode(token, process.env.JWT_SECRET);
        return (decode);
    } catch (e) {
        return null;
    } 
}

module.exports = {
    createPWD,
    createHash,
    createToken,
    getTokenPayload
}
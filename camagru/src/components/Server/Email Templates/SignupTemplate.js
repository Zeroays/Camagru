require('dotenv').config({path: '../../../../.env'});
const { TRUE_CLIENT_ORIGIN } = require('../Config')

module.exports = {
    confirm: id => ({
        subject: 'React Confirm Email',
        html: `
            <a href='http://${TRUE_CLIENT_ORIGIN}:${process.env.PORT}/signup/confirm/${id}'>
                Click to Confirm Email
            </a>
        `,
        text: `Copy and paste this link: http://${TRUE_CLIENT_ORIGIN}:${process.env.PORT}/signup/confirm/${id}`
    })
}
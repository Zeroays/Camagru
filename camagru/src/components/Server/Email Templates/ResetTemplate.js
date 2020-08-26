module.exports = {

    confirm: pwd => ({
    subject: 'React Reset Password',
    html: `
        <h1>Password Reset</h1>
        <p>
            Use this temporary password ${pwd} to sign in.  Reset it under your
            Account Settings
        </p>
    `,
    text: `Use this temporary password ${pwd} to sign in.  Reset it under your
    Account Settings`
    })
     
}
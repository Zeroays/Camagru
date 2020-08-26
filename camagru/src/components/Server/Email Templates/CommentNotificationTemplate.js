module.exports = {

    confirm: (user, comment, imgLink) => ({
    subject: 'Camagru - Your Photo got Commented!',
    html: `
        <h1>Camagru</h1>
        <img src=${imgLink} />
        <p>${user} wrote a comment for the above image!</p>
        <p>${comment}</p>
    `,
    text: `${user} posted a comment on one of your photos.  Login to see it!`
    })
     
}
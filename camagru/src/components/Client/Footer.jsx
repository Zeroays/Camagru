import React, { Component } from 'react';

import "./Footer.css";

class Footer extends Component {
    state = {  }

    
    render() {
        const copyright = '\u00A9';
        const description = `Camagru is a re-imagination of Instagram, allowing you to
        take pictures alongside other images.  This is a 42 Academic
        project, that aims to educate future Web Developers in utilizing
        Javascript's Media API, and handle saving/displaying/uploading 
        user photos.  Camagru aims to be secure and interactive`;
        return (
                <div className="footer">
                    <h1 id="footer-title">About Us</h1>
                    {/* <div class="color-overlay"></div> */}
                    <hr/>
                    <p id="footer-about-us">{description}</p>
                    <div className="footer-bottom">
                        {copyright} Vasu Rabaib | 42 Silicon Valley | 2019-2020
                    </div>
                </div>
        );
    }
}

export default Footer;
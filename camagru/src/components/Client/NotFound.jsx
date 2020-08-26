import React, { Component } from 'react';

import { NOT_FOUND_GIF } from './Config';

class NotFound extends Component {    
    render() {
        
        const notFoundContainer = {
            position: "relative",
            textAlign: "center"
        };
        const notFound = {
            width: "50%"
        };
        const notFoundCaption = {
            fontSize: "4vw",
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textTransform: "uppercase",
            letterSpacing: "2px"
        };

        return (
            <div style={notFoundContainer}>
                <img style={notFound} src={NOT_FOUND_GIF} alt="Falling Camera"/>
                <h2 style={notFoundCaption}>404 Not Found</h2>
            </div>
        );
    }
}

export default NotFound;
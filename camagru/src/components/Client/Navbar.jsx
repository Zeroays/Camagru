import React, { Component } from 'react';

import { FaAlignJustify } from 'react-icons/fa'
import { Link } from 'react-router-dom';

import "./navbar.css";

const NavLink = (toggleState, toggleStyle, value, link) => {
    return (
        <Link style={toggleState ? toggleStyle : {}} to={link} key={value}>
            <li className="links" style={toggleState ? {display:'block'} : {}}>
                {value}
            </li>
        </Link>
    );
}

class Navbar extends Component {
    state = { 
        toggle: false 
    }
    handleToggle = () => {
        this.setState( {toggle: !this.state.toggle} );
    }
    render() {
        const { toggle } = this.state;
        const toggleStyle = {
            textDecoration: "none",
            "width" : "100%"
        };
        const navLinks = Object.keys(this.props).map(name => {
            return NavLink(toggle, toggleStyle, name, this.props[name])
        })
        return ( 
            <nav className="navbar-main">
                <ul className="navbar-menu">
                    <Link to="/">
                        <li className="logo">Camagru</li>
                    </Link>
                    {navLinks}
                    <li className="burger">
                        <FaAlignJustify 
                            onClick={this.handleToggle}  
                        />
                    </li>
                </ul>
            </nav>
        );
    }
}
 
export default Navbar;
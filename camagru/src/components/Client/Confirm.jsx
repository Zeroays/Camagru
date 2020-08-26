import React, { Component } from 'react';
import { FaSync } from "react-icons/fa";

import axios from "axios";
import "./Reusables/spinner.css";

class Confirm extends Component {
    state = { 
        confirming: true,
        status: ""
    };

    componentDidMount = () => {
        this.confirmAccount();
    }
    confirmAccount = async() => {
        const { id } = this.props.match.params
        const res = await axios.get(`/signup/confirm/${id}`)
        if (res.data) {
            this.setState({
                confirming: false,
                status: res.data.msg
            })
        }
    }

    render() {
        const { confirming, status } = this.state
        return (
            <div className="spinner-container">
                <h1>{status}</h1>
                {confirming ? <FaSync className="spinner" ></FaSync> : <></>}
            </div>
        );
    }
}

export default Confirm;
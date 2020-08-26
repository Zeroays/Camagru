import React, { Component } from 'react';

import Modal from "react-bootstrap/Modal";
import { FormHeader, FormBody, FormFooter, Form } from "./Reusables/Form";

import ForgotLoginFields from "./Form Fields/ForgotLoginFields";

import axios from "axios";

class ForgotLogin extends Component {
    state = {
        modalVisible: false,
        user: ForgotLoginFields.reduce((obj, item) => Object.assign(obj, { [item.name]: '' }), {}),
        errors: {},
        checkingLogin: false
    };
    handleChange = event => {
        const { user } = this.state;
        user[event.target.name] = event.target.value;
        this.setState({ user });
    }
    submitForm = event => {
        event.preventDefault();
        this.checkForm();  
    }
    obtainData = async() => {
        this.setState({ sendingEmail: true })
        const { user } = this.state;
        const res = await axios.post(`/forgot`, user, { headers: {'Authorization': `Bearer ${localStorage.getItem("access_token")}`} });
        if (res) {
            this.setState({ emailSent: true });
            this.setState({ sendingEmail: false });
            this.setState({ modalVisible: true });
        }
    }
    checkForm = () => {
        const { user } = this.state;
        //Alternative to Conditional Statements for 
        //populating err variable Object with error messages
        let err = ForgotLoginFields.reduce((obj, item) => 
            Object.assign(
                obj,
                (!user[item.name] && { [item.name]: item.error })), {}
            )
        this.setState({ errors: err }, () => {
            if (Object.entries(this.state.errors).length === 0)
                this.obtainData();
            // else
            //     console.log("Form not checked out");
        })
        
    }
    toggleEmailConfirmation = () => {
        this.setState({ modalVisible: !this.state.modalVisible })
    }
    render() {
        const { modalVisible, errors, user, checkingLogin } = this.state;
        return (
            <>
                <Form submitHandler={this.submitForm}>
                    {FormHeader("Reset Password")}
                    {FormBody(ForgotLoginFields, errors, user, this.handleChange)}
                    {FormFooter(checkingLogin)}
                </Form>
                {/* <h1>
                {
                     emailSent 
                     ? "Email Sent"
                     : null
                }
                </h1> */}
                <Modal 
                    show={modalVisible} 
                    onHide={this.toggleEmailConfirmation}
                >
                    <Modal.Body>
                        <h6>Email has been sent</h6>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

export default ForgotLogin;
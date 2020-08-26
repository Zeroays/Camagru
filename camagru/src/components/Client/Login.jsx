import React, { Component } from 'react';

// import { API_URL } from "./Config";
import { FormHeader, FormBody, FormFooter, Form } from "./Reusables/Form";
import LoginFields from "./Form Fields/LoginFields";

import axios from "axios";

import "./Reusables/form.css";

class Login extends Component {
    state = {
        user: LoginFields.reduce((obj, item) => Object.assign(obj, { [item.name]: '' }), {}),
        errors: {},
        buttonPressed: "",
        loggingIn: false
    };
    handleChange = event => {
        const { user } = this.state;
        user[event.target.name] = event.target.value;
        this.setState({ user });
    }
    registerButton = event => {
        this.setState({ buttonPressed: event.target.name }, () => {
            if (this.state.buttonPressed === "forgot-password")
                this.props.history.push("/forgot")
            else
                this.checkForm();
        })
    }
    submitForm = event => {
        event.preventDefault();
        this.checkForm();  
    }
    obtainData = async() => {
        const { email, password } = this.state.user;
        this.setState({ sendingEmail: true })
        const res = await axios.post(`/login`,
            { email, password }
        )
        if (res.data.access_token) {
            localStorage.setItem('access_token', res.data.access_token)
            this.props.login();
            this.props.history.push('/')
        } else {
            const errMsg = "Wrong Email or Password.  Try again."
            this.setState({ 
                errors: { 'email': errMsg },
                loggingIn: false
            });
        }
    }
    checkForm = () => {
        const { user } = this.state;
        //Alternative to Conditional Statements for 
        //populating err variable Object with error messages
        let err = LoginFields.reduce((obj, item) => 
            Object.assign(
                obj,
                (!user[item.name] && { [item.name]: item.error })), {}
            )
        this.setState({ errors: err }, () => {
            if (Object.entries(this.state.errors).length === 0)
                this.obtainData();
        })
        
    }
    
    render() {
        const { errors, user, loggingIn } = this.state;
        return (
            <Form submitHandler={this.submitForm}>
                {FormHeader("Log In")}
                {FormBody(LoginFields, errors, user, this.handleChange)}
                {FormFooter(
                    loggingIn, 
                    ForgotPasswordButton(this.registerButton)
                )}
            </Form>
        );
    }
}

const ForgotPasswordButton = register => {
    return (
        <button
            //Type to turn off "Cancelled Form Submission Warning" in Console
            type="button"
            //Name to get a String-Based ID from onClick Event Handler
            name="forgot-password"
            className="btn btn-primary mb1 bg-navy"
            onClick={register}
        >
        Forgot Password?
        </button>
    );
}


export default Login;

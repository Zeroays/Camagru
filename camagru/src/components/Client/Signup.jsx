import React, { Component } from 'react';

import { FormHeader, FormBody, FormFooter, Form } from "./Reusables/Form";

import SignUpFields from "./Form Fields/SignupFields";

import axios from "axios";

class Signup extends Component {
    state = {
        user: SignUpFields.reduce((obj, item) => Object.assign(obj, { [item.name]: '' }), {}),
        errors: {},
        sendingEmail: false
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
        const res = await axios.post(`/signup`,
            user,
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}`} }
        )
        this.setState({ sendingEmail: false }, () => {
            if (res.data.userExists)
                this.props.history.push("/login")
            else {
                localStorage.setItem('access_token', res.data.access_token);
                this.props.login();
                this.props.history.push('/')
            }
        })
    }
    checkPassword = (user, err) => {
        const specialRegExp = /[*@!#%&()^~{}]+/;
        const capitalLtrRegExp = /([A-Z]+)/;
        const minOneNumRegExp = /.*[0-9].*/;
        const pwd = user.password;
        if (pwd.length < 8 || !capitalLtrRegExp.test(pwd) || 
            !minOneNumRegExp.test(pwd) || !specialRegExp.test(pwd))
            err.password = `Password must be at least 8 characters long, 
            have at least one number, one capital letter,
            and one special character`;
        else if (user.password !== user.passwordConfirmation)
            err.password = "Passwords do not match";
    }
    checkForm = () => {
        const { user } = this.state;
        //Alternative to Conditional Statements for 
        //populating err variable Object with error messages
        let err = SignUpFields.reduce((obj, item) => 
            Object.assign(
                obj,
                (!user[item.name] && { [item.name]: item.error })), {}
            )
        this.checkPassword(user, err);
        this.setState({ errors: err }, () => {
            if (Object.entries(this.state.errors).length === 0)
                this.obtainData();
        })
        
    }
    render() {
        const { errors, user, sendingEmail } = this.state;
        return (
            <Form submitHandler={this.submitForm}>
                {FormHeader("Create Account")}
                {FormBody(SignUpFields, errors, user, this.handleChange)}
                {FormFooter(sendingEmail)}
            </Form>
        );
    }
}

export default Signup;

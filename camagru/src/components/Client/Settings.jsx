import React, { Component } from 'react';

import { FormHeader, FormBody, FormFooter, Form } from "./Reusables/Form";

import AccountSettingsFields from "./Form Fields/AccountSettingsFields";

import axios from "axios";

class Settings extends Component {
    state = {
        user: AccountSettingsFields.reduce((obj, item) => Object.assign(obj, { [item.name]: '' }), {}),
        errors: {},
        changingSettings: false
    }
    componentDidMount = () => {
        this.loadSettingsData();
    }
    loadSettingsData = async() => {
        const { user } = this.state;
        const res = await axios.get(`/settings`,
            { headers: {'Authorization': `Bearer ${localStorage.getItem("access_token")}`} }
        )
        const populateUserInfo = () => {
            for (const entry in res.data) {
                user[entry] = res.data[entry]
            }
            this.setState({ user: user });
        }
        populateUserInfo();
    }
    checkPassword = (pwd, confirmPWD, err) => {
        const specialRegExp = /[*@!#%&()^~{}]+/;
        const capitalLtrRegExp = /([A-Z]+)/;
        const minOneNumRegExp = /.*[0-9].*/;
        if (pwd !== "" && (pwd.length < 8 || !capitalLtrRegExp.test(pwd) || 
            !minOneNumRegExp.test(pwd) || !specialRegExp.test(pwd)))
            err.newPassword = `Password must be at least 8 characters long, 
            have at least one number, one capital letter,
            and one special character`;
        else if (pwd !== confirmPWD)
            err.newPasswordConfirmation = "Enter and confirm your new Password";
        this.setState({ errors: err })
    }


    handleChange = event => {
        const { user } = this.state;
        if (event.target.value === "on")
            user[event.target.name] = !user[event.target.name]
        else
            user[event.target.name] = event.target.value;
        this.setState({ user });
    }
    submitForm = event => {
        event.preventDefault();
        this.checkForm();  
    }
    changeCredentials = async() => {
        this.setState({ changingSettings: true })
        const res = await axios.post(`/modify`,
            this.state.user, 
            { headers: {'Authorization': `Bearer ${localStorage.getItem("access_token")}`} }
        )
        this.setState({ changingSettings: false }, () => {
            const { errors } = this.state;
            if (!res.data.authorized)
                errors['password'] = "Incorrect Password"
            //ADDED BELOW -> Must reissue access token because of email change
            if (res.data.access_token)
                localStorage.setItem('access_token', res.data.access_token)
            this.setState({ errors });
        })
    }
    checkForm = () => {
        const { user } = this.state;
        //Alternative to Conditional Statements for 
        //populating err variable Object with error messages
        let err = AccountSettingsFields.reduce((obj, item) => 
            Object.assign(
                obj,
                (!user[item.name] && item.error && { [item.name]: item.error })), {}
            )
        if (user.password === "")
                err['password'] = "Please enter password to change settings";
        this.setState({ errors: err }, () => {
            this.checkPassword(user.newPassword, user.newPasswordConfirmation, err);

            if (Object.entries(this.state.errors).length === 0)
                this.changeCredentials();
        })
        
    }
    render() {
        const { errors, user, changingSettings } = this.state;
        return (
            <>
                <Form submitHandler={this.submitForm}>
                    {FormHeader("Modify Credentials")}
                    {FormBody(AccountSettingsFields, errors, user, this.handleChange)}
                    {FormFooter(changingSettings)}
                </Form>
            </>
        );
    }
}

export default Settings;
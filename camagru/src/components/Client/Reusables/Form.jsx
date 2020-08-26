import React, { Component } from 'react';

import FormInput from "./FormInput";

import "./form.css"

const FormHeader = header => {
    return (
        <div className="form-header">
            <h1>{header}</h1>
        </div>
    );
}

const FormBody = (fieldData, errors, user, handleChange) => {
    return (
        <div className="form-body">
            {fieldData.map(fields => {
                return (
                    <div key={fields.name} className="form-group">
                        <FormInput
                            key={fields.name}
                            label={fields.label}
                            name={fields.name}
                            type={fields.type}
                            value={user[fields.name]}
                            checked={user[fields.name]}
                            onChange={handleChange}
                            placeholder={fields.placeholder}
                            error={errors[fields.name]}
                            required
                            className="form-control"
                        />
                    </div>
                );
            })}
        </div>
    );
}

const FormFooter = (formState, buttons) => {
    return (
        <div className="form-footer">
            {buttons}
            <button
                name="submit"
                type="submit" 
                className={formState ? "spinner-border" : "btn btn-primary"}
                
            >
            {formState ? "" : "Submit"}
            </button>
            
        </div>
    );
}

class Form extends Component {
    render() {
        const { submitHandler } = this.props;
        return (
            <form className="form" onSubmit={submitHandler} method="POST">
                {this.props.children}
            </form>
        );
    }
}

export { FormHeader, FormFooter, FormBody, Form };
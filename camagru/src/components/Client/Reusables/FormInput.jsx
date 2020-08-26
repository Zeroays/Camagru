import React from "react";
import PropTypes from 'prop-types';

const FormInput = ({
    name, type, placeholder,
    onChange, className, value,
    error, label, checked, ...props
    }) => {
        return (
            <>
                {type === "checkbox"
                    ? <>
                        <label>
                            <input
                                id={name}
                                name={name}
                                type={type}
                                onChange={onChange}
                                checked={checked ? "checked" : ""}
                            />
                            {label}

                        </label>
                      </> 
                    : <>
                        <input
                            id={name}
                            name={name} type={type} placeholder={placeholder}
                            onChange={onChange} className={className} value={value}
                            style={error && {border: 'solid 1px red'}}
                        />
                        {error && <p style={{textAlign: 'left'}}>{ error }</p>}
                    </> 
                }
                
            </>
        );
    }

FormInput.defaultProps = {
    type: "text",
    className: ""
}

FormInput.propTypes = {
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    type: PropTypes.oneOf(['text', 'number', 'password', 'email', 'checkbox']),
    className: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired
}

export default FormInput;
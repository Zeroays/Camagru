const AccountSettingsFields = [
    {
        label:"firstName",
        name:"firstName",
        type:"text",
        placeholder:"First name",
        error: "Enter first name"
    },
    {
        label:"lastName",
        name:"lastName",
        type:"text",
        placeholder:"Last name",
        error: "Enter last name"
    },
    {
        label:"username",
        name:"username",
        type:"text",
        placeholder:"Username",
        error: "Choose a username"
    },
    {
        label:"email",
        name:"email",
        type:"email",
        placeholder:"Email",
        error: "Enter your email"
    },
    {
        label:"password",
        name:"password",
        type:"password",
        placeholder:"Enter Current Password...",
        error: "Enter Current Password"
    },
    {
        label:"newPassword",
        name:"newPassword",
        type:"password",
        placeholder:"Enter New Password..."
    },
    {
        label:"newPasswordConfirmation",
        name:"newPasswordConfirmation",
        type:"password",
        placeholder:"Confirm New Password..."
    },
    {
        label:"Receive Notifications on Comments",
        name:"notification",
        type:"checkbox"
    }
]

export default AccountSettingsFields;
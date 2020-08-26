require('dotenv').config({path: '../../../.env'});

//No Longer Used -> Refer to Proxy in package.json file
//Can use API_URL constant, if can find a way to change IP address
//to one broadcasted on network
export const API_URL = `http://0.0.0.0:${process.env.REACT_APP_SERVER_PORT}`

export const NOT_FOUND_GIF = "https://mir-s3-cdn-cf.behance.net/project_modules/disp/4be13019063419.562d46c78e8a2.gif"
/*
    'production' -> offload to hosting service URL
*/

export const CLOUDINARY_NAME = 'dq2u9uow5';
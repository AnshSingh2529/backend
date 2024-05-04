{/*this part is for navigating you to the page... */}   

import { Router } from "express";

import {logoutUser, loginUser, registerUser} from "../Controllers/user.controller.js";
import {upload} from '../Middlewares/Multer.middleware.js';
import varifyJWT from '../Middlewares/Auth.middleware.js'

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//Secured Routes
router.route("/logout").post(varifyJWT, logoutUser)       //here the next() comes in role it's used to pass the control to the next middleware.




export default router;
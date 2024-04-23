{/*this part is for navigating you to the page... */}   

import { Router } from "express";

import {registerUser} from "../Controllers/user.controller.js";
import {upload} from '../Middlewares/Multer.middleware.js';

const router = Router();

router.route('/register').post(upload.fields
   ( [
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"cover-image",
            maxCount:1
        }
    ]),registerUser)

export default router;
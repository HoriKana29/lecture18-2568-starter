import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { UserPayload } from "../libs/types.js";
dotenv.config();

import type { User, CustomRequest } from "../libs/types.js";

// import database
import { users, reset_users } from "../db/db.js";
import { success } from "zod";

import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdmin.js";

const router = Router();

// GET /api/v2/users
router.get("/", authenticateToken,checkRoleAdmin,(req: CustomRequest, res: Response) => {
  try {
        return res.status(200).json({
            success:true,
            message: "yatta",
            data : users
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"day no",
            error: err,
        })
    }
    // return all users
  });

// POST /api/v2/users/login
router.post("/login", (req: Request, res: Response) => {
  // 1. get username and password from body
    try{
        const { username,password }  = req.body;
        const user = users.find(
            (u:User) => u.username === username && u.password === password
        );

        if(!user){
            return res.status(400).json({
                success:false,
                message:"good bye"
            })
        }
    
  // 2. check if user exists (search with username & password in DB)
  // 3. create JWT token (with user info object as payload) using JWT_SECRET_KEY
  //    (optional: save the token as part of User data)
    const jwt_secret = process.env.JWT_SECRET || "forgot";
    const token = jwt.sign({
        // create JWT payload
        username: user.username,
        studentId: user.studentId,
        role:user?.role,
    },jwt_secret,{expiresIn:"5m"});

    res.status(200).json({
        success:true,
        Login : "login success",
        token
    })

  // 4. send HTTP response with JWT token
    }
  catch(err){
        return res.status(500).json({
            success:false,
            message:"day no",
            error: err,
        })
    }
  return res.status(500).json({
    success: false,
    message: "POST /api/v2/users/login has not been implemented yet",
  });

  
});

// POST /api/v2/users/logout
router.post("/logout",authenticateToken, (req: CustomRequest, res: Response) => {
  // 1. check Request if "authorization" header exists
  //    and container "Bearer ...JWT-Token..."

  // 2. extract the "...JWT-Token..." if available

  // 3. verify token using JWT_SECRET_KEY and get payload (username, studentId and role)

  // 4. check if user exists (search with username)

  // 5. proceed with logout process and return HTTP response
  //    (optional: remove the token from User data)

  return res.status(500).json({
    success: false,
    message: "POST /api/v2/users/logout has not been implemented yet",
  });
});

// POST /api/v2/users/reset
router.post("/reset", (req: Request, res: Response) => {
  try {
    reset_users();
    return res.status(200).json({
      success: true,
      message: "User database has been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;
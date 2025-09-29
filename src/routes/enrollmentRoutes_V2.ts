import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { UserPayload } from "../libs/types.js";
dotenv.config();

import type { Enrollment, CustomRequest } from "../libs/types.js";

// import database
import { enrollments } from "../db/db.js";
import { zEnrollmentBody, zStudentId } from "../libs/zodValidators.js";
import { reset_enrollments } from "../db/db.js";
import { success } from "zod";

import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdmin.js";
import { checkRole } from "../middlewares/checkall.js";
import { checkRoleStudent } from "../middlewares/checkRoleStudentMiddleware.js";
import { checkEnrollDrop } from "../middlewares/DeleteEnrollmiddleware.js";

const router = Router();

// GET /api/v2/users
router.get(
  "/",
  authenticateToken,
  checkRoleAdmin,
  (req: CustomRequest, res: Response) => {
    try {
      return res.status(200).json({
        success: true,
        message: "Enrollments Information",
        data: enrollments,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: err,
      });
    }
    // return all enrollments
  }
);

// POST /api/v2/enrollments/reset
router.post(
  "/reset",
  authenticateToken,
  checkRoleAdmin,
  (req: CustomRequest, res: Response) => {
    try {
      reset_enrollments();
      res.status(200).json({
        success: true,
        message: "enrollments database has been reset",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "day no",
        error: err,
      });
    }
    return res.status(500).json({
      success: false,
      message: "POST has not been implemented yet",
    });
  }
);

router.get(
  "/:studentId",
  authenticateToken,
  checkRole,
  (req: CustomRequest, res: Response) => {
    try {
      const studentId = req.params.studentId;
      const parseResult = zStudentId.safeParse(studentId);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parseResult.error.issues[0]?.message,
        });
      }
      const foundIndex = enrollments.findIndex(
        (e: Enrollment) => e.studentId === studentId
      );

      if (foundIndex === -1) {
        return res.status(404).json({
          success: false,
          message: `Course ${studentId} does not exists`,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Student Information",
        data: enrollments[foundIndex],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: err,
      });
    }
    // return all enrollments
  }
);

router.post(
  "/:studentId",
  authenticateToken,
  checkRoleStudent,
  (req: CustomRequest, res: Response) => {
    try {
      const body = req.body as Enrollment;
      const result = zEnrollmentBody.safeParse(body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.issues[0]?.message,
        });
      }
      const found = enrollments.find(
        (enroll) => enroll.studentId === body.studentId
      );
      if (found) {
        return res.status(409).json({
          success: false,
          message: "studentId & courseId database is already exist",
        });
      }
      const new_enroll = body;
      enrollments.push(new_enroll);
      res.status(200).json({
        success: true,
        message: `Student ${new_enroll.studentId} & Course ${new_enroll.courseId} has been added successfully`,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "day no",
        error: err,
      });
    }
    return res.status(500).json({
      success: false,
      message: "POST has not been implemented yet",
    });
  }
);

router.delete(
  "/:studentId",
  authenticateToken,
  checkEnrollDrop,
  (req: CustomRequest, res: Response) => {
    try {
      const body = req.body as Enrollment;
      const result = zEnrollmentBody.safeParse(body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.issues[0]?.message,
        });
      }
      const foundIndex = enrollments.findIndex(
        (e: Enrollment) => e.studentId === body.studentId
      );

      if (foundIndex === -1) {
        return res.status(404).json({
          success: false,
          message: `Enrollment does not exists`,
        });
      }
      enrollments.splice(foundIndex, 1);

      return res.status(200).json({
        success: true,
        message: `Student ${body.studentId} && Course ${body.courseId} has been deleted successfully`,
        data: enrollments,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: err,
      });
    }
  }
);

export default router;

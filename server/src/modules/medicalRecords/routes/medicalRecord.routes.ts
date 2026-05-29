import { Router } from "express";
import {
  createMedicalRecordController,
  listMedicalRecordsByAnimalController,
  listMyMedicalRecordsController,
} from "../controllers/medicalRecord.controller";
import { authenticateJWT } from "../../../middlewares/auth";
import { authorizeRoles } from "../../../middlewares/authorize";

const router = Router();

router.post("/", authenticateJWT, authorizeRoles("medico"), createMedicalRecordController);
router.get("/my", authenticateJWT, authorizeRoles("medico"), listMyMedicalRecordsController);
router.get("/animal/:id", authenticateJWT, listMedicalRecordsByAnimalController);

export default router;

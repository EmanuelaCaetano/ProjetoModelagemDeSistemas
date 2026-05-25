import { Router } from "express";
import * as petController from "../controllers/petController";
import { authenticateJWT } from "../middlewares/auth";

const router = Router();

// Rotas protegidas para pets
router.post("/", authenticateJWT, petController.createPet);
router.get("/", authenticateJWT, petController.listMyPets);
router.get("/:id", authenticateJWT, petController.getPetById);
router.put("/:id", authenticateJWT, petController.updatePet);
router.delete("/:id", authenticateJWT, petController.deletePet);

export default router;

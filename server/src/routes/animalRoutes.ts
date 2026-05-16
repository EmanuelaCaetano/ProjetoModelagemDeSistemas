import { Router } from "express";
import { getAnimals, getAllAnimals, registerAnimal } from "../controllers/animalController";

const router = Router();

router.get("/", getAllAnimals);
router.get("/:clienteId", getAnimals);
router.post("/", registerAnimal);

export default router;
import { Router } from "express";
import { getAnimals, registerAnimal } from "../controllers/animalController";

const router = Router();

router.get("/:clienteId", getAnimals);
router.post("/", registerAnimal);

export default router;
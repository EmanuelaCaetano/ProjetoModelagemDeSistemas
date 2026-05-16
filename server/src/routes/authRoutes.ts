import { Router } from "express";
import { login, register, getUsers, updateUserController, deleteUserController } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", getUsers);
router.put("/users/:id", updateUserController);
router.delete("/users/:id", deleteUserController);

export default router;

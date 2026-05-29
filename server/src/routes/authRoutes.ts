import { Router } from "express";
import { login, register, getUsers, updateUserController, deleteUserController } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", authenticateJWT, getUsers);
router.put("/users/:id", authenticateJWT, updateUserController);
router.delete("/users/:id", authenticateJWT, deleteUserController);

export default router;

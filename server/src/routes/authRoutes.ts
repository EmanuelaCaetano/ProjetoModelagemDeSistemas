import { Router } from "express";
import { login, register, getUsers, updateUserController, deleteUserController, updateProfileController, changePasswordController } from "../controllers/authController";
import { authenticateJWT } from "../middlewares/auth";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", getUsers);
router.put("/users/:id", updateUserController);
router.delete("/users/:id", deleteUserController);

// Rotas protegidas para perfil do usuário autenticado
router.put("/profile", authenticateJWT, updateProfileController);
router.put("/change-password", authenticateJWT, changePasswordController);

export default router;

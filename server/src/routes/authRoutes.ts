import { Router } from "express";
import { login, register, getUsers, updateUserController, deleteUserController, updateProfileController, changePasswordController } from "../controllers/authController";
import { authenticateJWT } from "../middlewares/auth";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", authenticateJWT, getUsers);
router.put("/users/:id", authenticateJWT, updateUserController);
router.delete("/users/:id", authenticateJWT, deleteUserController);

// Rotas protegidas para perfil do usuário autenticado
router.put("/profile", authenticateJWT, updateProfileController);
router.put("/change-password", authenticateJWT, changePasswordController);

export default router;

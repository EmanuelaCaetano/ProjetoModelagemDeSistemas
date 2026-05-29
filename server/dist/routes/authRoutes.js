"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/login", authController_1.login);
router.post("/register", authController_1.register);
router.get("/users", auth_1.authenticateJWT, authController_1.getUsers);
router.put("/users/:id", auth_1.authenticateJWT, authController_1.updateUserController);
router.delete("/users/:id", auth_1.authenticateJWT, authController_1.deleteUserController);
// Rotas protegidas para perfil do usuário autenticado
router.put("/profile", auth_1.authenticateJWT, authController_1.updateProfileController);
router.put("/change-password", auth_1.authenticateJWT, authController_1.changePasswordController);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map
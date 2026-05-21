"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post("/login", authController_1.login);
router.post("/register", authController_1.register);
router.get("/users", authController_1.getUsers);
router.put("/users/:id", authController_1.updateUserController);
router.delete("/users/:id", authController_1.deleteUserController);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map
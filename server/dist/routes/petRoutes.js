"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const petController = __importStar(require("../controllers/petController"));
const userModel = __importStar(require("../models/user"));
const password_1 = require("../utils/password");
const router = (0, express_1.Router)();
// Middleware para autenticação simples (verifica se o token/userId existe)
const authenticateUser = async (req, res, next) => {
    try {
        // Por enquanto, usamos um header simples com userId
        // Em produção, usar JWT
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({ error: "Não autenticado" });
        }
        req.userId = parseInt(userId);
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Erro na autenticação" });
    }
};
// Rotas protegidas para pets
router.post("/", authenticateUser, petController.createPet);
router.get("/", authenticateUser, petController.listMyPets);
router.get("/:id", authenticateUser, petController.getPetById);
router.put("/:id", authenticateUser, petController.updatePet);
router.delete("/:id", authenticateUser, petController.deletePet);
exports.default = router;
//# sourceMappingURL=petRoutes.js.map
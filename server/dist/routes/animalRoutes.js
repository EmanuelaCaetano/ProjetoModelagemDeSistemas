"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const animalController_1 = require("../controllers/animalController");
const router = (0, express_1.Router)();
router.get("/", animalController_1.getAllAnimals);
router.get("/:clienteId", animalController_1.getAnimals);
router.post("/", animalController_1.registerAnimal);
exports.default = router;
//# sourceMappingURL=animalRoutes.js.map
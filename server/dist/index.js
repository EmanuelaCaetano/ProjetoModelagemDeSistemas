"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const agendamentoRoutes_1 = __importDefault(require("./routes/agendamentoRoutes"));
const petRoutes_1 = __importDefault(require("./routes/petRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
require("./config/db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.json({ message: "API de autenticação da clínica veterinária NewPet está disponível." });
});
app.use("/auth", authRoutes_1.default);
app.use("/agendamentos", agendamentoRoutes_1.default);
app.use("/pets", petRoutes_1.default);
app.use("/appointments", appointmentRoutes_1.default);
// Aguardar um pouco para garantir que o banco foi inicializado
setTimeout(() => {
    const port = Number(process.env.PORT || 4000);
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}, 1000);
//# sourceMappingURL=index.js.map
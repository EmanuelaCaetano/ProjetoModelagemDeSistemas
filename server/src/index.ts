import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import agendamentoRoutes from "./routes/agendamentoRoutes";
import petRoutes from "./routes/petRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import "./config/db";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API de autenticação da clínica veterinária NewPet está disponível." });
});

app.use("/auth", authRoutes);
app.use("/agendamentos", agendamentoRoutes);
app.use("/pets", petRoutes);
app.use("/appointments", appointmentRoutes);

// Aguardar um pouco para garantir que o banco foi inicializado
setTimeout(() => {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}, 1000);

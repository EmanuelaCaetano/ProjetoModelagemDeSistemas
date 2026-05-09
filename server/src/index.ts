import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import petRoutes from "./routes/petRoutes";
import "./config/db";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API de autenticação da clínica veterinária NewPet está disponível." });
});

app.use("/auth", authRoutes);
app.use("/pets", petRoutes);

// Aguardar um pouco para garantir que o banco foi inicializado
setTimeout(() => {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}, 1000);

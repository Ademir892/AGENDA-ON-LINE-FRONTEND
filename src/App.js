import { useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");

  const horarios = ["09:00", "10:00", "11:00", "15:00", "16:00"];

  const handleSubmit = async () => {
    if (!name || !phone || !time) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      await axios.post("http://localhost:8080/agendar", {
        name,
        phone,
        time
      });
      alert("✅ Agendamento enviado com sucesso!");
      setName("");
      setPhone("");
      setTime("");
    } catch (err) {
      alert("❌ Erro ao enviar agendamento!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Agende seu horário</h1>

      <input
        placeholder="Seu nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Seu telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <br /><br />

      <select value={time} onChange={(e) => setTime(e.target.value)}>
        <option value="">Selecione o horário</option>
        {horarios.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <br /><br />

      <button onClick={handleSubmit}>Agendar</button>
    </div>
  );
}

export default App;

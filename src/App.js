import React, { useState, useEffect } from "react";
import "./App.css";

const horarios = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "15:00", "16:00"];

export default function Agenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [formData, setFormData] = useState({ nome: "", telefone: "", observacao: "" });

  // 🔹 1️⃣ Função de carregar agendamentos
  const carregarAgendamentos = () => {
    fetch("http://localhost:8080/agendamentos")
      .then((res) => res.json())
      .then((data) => setAgendamentos(data))
      .catch((err) => console.error("Erro ao buscar:", err));
  };

  // 🔹 2️⃣ useEffect que usa a função
  useEffect(() => {
    carregarAgendamentos();
    const interval = setInterval(carregarAgendamentos, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Início da semana (segunda-feira)
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1);

  const diasSemana = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(inicioSemana);
    d.setDate(inicioSemana.getDate() + i);
    return d;
  });

  const abrirModal = (dia, hora) => {
    const [h, m] = hora.split(":");
    const data = new Date(dia);
    data.setHours(parseInt(h, 10));
    data.setMinutes(parseInt(m, 10));
    setDataSelecionada(data);
    setModalAberto(true);
  };

  const confirmarAgendamento = () => {
    if (!formData.nome) {
      alert("⚠️ Informe o nome.");
      return;
    }

    if (!validarTelefone(formData.telefone)) {
      alert("⚠️ Informe um telefone válido com DDD (ex: 51997923275).");
      return;
    }

    const novoAgendamento = {
      ...formData,
      telefone: formatarTelefone(formData.telefone),
      data: dataSelecionada.toISOString(),
    };

    fetch("http://localhost:8080/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoAgendamento),
    })
      .then((res) => res.json())
      .then(() => {
        setModalAberto(false);
        setFormData({ nome: "", telefone: "", observacao: "" });
        carregarAgendamentos(); // 🔹 recarrega tabela do backend
      })
      .catch((err) => console.error("Erro ao salvar:", err));
  };

  const getAgendamento = (dia, hora) => {
    if (!Array.isArray(agendamentos)) return null;

    const [h, m] = hora.split(":");
    const data = new Date(dia);
    data.setHours(parseInt(h, 10));
    data.setMinutes(parseInt(m, 10));
    const iso = data.toISOString().slice(0, 16);

    return agendamentos.find(
      (a) => a?.data && typeof a.data === "string" && a.data.startsWith(iso)
    ) || null;
  };


  const cancelarAgendamento = (id) => {
    fetch(`http://localhost:8080/agendamentos/${id}`, { method: "DELETE" })
      .then(() => {
        setAgendamentos(agendamentos.filter((a) => a.id !== id));
      })
      .catch((err) => console.error("Erro ao cancelar:", err));
  };

  const formatarTelefone = (telefone) => {
    // remove tudo que não for número
    let apenasNumeros = telefone.replace(/\D/g, "");

    // garante que comece com DDI do Brasil (+55)
    if (!apenasNumeros.startsWith("55")) {
      apenasNumeros = "55" + apenasNumeros;
    }

    return "+" + apenasNumeros;
  };

  const validarTelefone = (telefone) => {
    const apenasNumeros = telefone.replace(/\D/g, ""); // só números
    return apenasNumeros.length >= 10 && apenasNumeros.length <= 13;
  };


  return (
    <>
      <div className="agenda-container">
        <h1 className="agenda-title">📅 Agenda do Personal Trainer Ademir 💪</h1>

        <div className="overflow-x-auto w-full max-w-5xl">
          <table className="agenda-table">
            <thead>
              <tr>
                <th className="agenda-th">Horário</th>
                {diasSemana.map((dia) => (
                  <th key={dia.toDateString()} className="agenda-th">
                    {dia.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "numeric" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horarios.map((hora) => (
                <tr key={hora} className="hover:bg-gray-50 transition">
                  <td className="agenda-horario">{hora}</td>
                  {diasSemana.map((dia) => {
                    const agendamento = getAgendamento(dia, hora);
                    return (
                      <td
                        key={dia.toDateString() + hora}
                        className={`agenda-cell ${agendamento ? "agenda-ocupado" : "agenda-livre"}`}
                        onClick={() => !agendamento && abrirModal(dia, hora)}
                      >
                        {agendamento ? (
                          <div>
                            Ocupado
                            <button
                              className="cancel-btn"
                              onClick={(e) => {
                                e.stopPropagation(); // evita abrir o modal
                                cancelarAgendamento(agendamento.id);
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          "Disponível"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              Agendar para {dataSelecionada.toLocaleString("pt-BR")}
            </h2>

            <input
              type="text"
              placeholder="Seu nome"
              className="modal-input"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            <input
              type="text"
              placeholder="Seu telefone (ex: 51997923275)"
              className="modal-input"
              value={formData.telefone}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, telefone: apenasNumeros });
              }}
            />
            <textarea
              placeholder="Observação (opcional)"
              className="modal-input"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
            />

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button className="modal-btn-confirm" onClick={confirmarAgendamento}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const usuariosSalvos = JSON.parse(localStorage.getItem("Usuarios Renovação")) || [];

    const usuarioEncontrado = usuariosSalvos.find(
      (u) => u.usuario === usuario && u.senha === senha && (u.status === "Ativo" || u.status === "Admin")
    );

    if (usuarioEncontrado) {
      localStorage.setItem("auth", "true");
      navigate("/dashboard");
    } else {
      setErro("Usuário, senha ou status inválidos.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Entrar
        </button>
      </form>
    </div>
  );
}

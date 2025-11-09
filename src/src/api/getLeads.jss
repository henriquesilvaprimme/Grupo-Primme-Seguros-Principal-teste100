// src/api/getLeads.js
const GOOGLE_SCRIPT_URL = "/api/gas";

export async function getLeads() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL);
    if (!res.ok) throw new Error("Erro ao buscar leads");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Erro ao buscar leads:", err);
    return [];
  }
}

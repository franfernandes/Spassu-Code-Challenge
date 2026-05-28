const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api"

export async function buscarApi<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_BASE_URL}${caminho}`)

  if (!resposta.ok) {
    throw new Error("Nao foi possivel consultar a API.")
  }

  return resposta.json() as Promise<T>
}

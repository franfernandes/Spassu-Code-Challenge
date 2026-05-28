const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api"

type MetodoHttp = "GET" | "POST" | "PUT" | "DELETE"

type OpcoesRequisicao = {
  metodo?: MetodoHttp
  corpo?: unknown
}

async function requisitarApi<T>(
  caminho: string,
  { metodo = "GET", corpo }: OpcoesRequisicao = {},
): Promise<T> {
  const resposta = await fetch(`${API_BASE_URL}${caminho}`, {
    method: metodo,
    headers: corpo ? { "Content-Type": "application/json" } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
  })

  if (!resposta.ok) {
    const detalhe = await resposta.text()
    throw new Error(
      `Nao foi possivel consultar a API. Status: ${resposta.status}. ${detalhe}`,
    )
  }

  if (resposta.status === 204) {
    return undefined as T
  }

  return resposta.json() as Promise<T>
}

export const api = {
  get: <T>(caminho: string) => requisitarApi<T>(caminho),
  post: <T>(caminho: string, corpo: unknown) =>
    requisitarApi<T>(caminho, { metodo: "POST", corpo }),
  put: <T>(caminho: string, corpo: unknown) =>
    requisitarApi<T>(caminho, { metodo: "PUT", corpo }),
  delete: (caminho: string) =>
    requisitarApi<void>(caminho, { metodo: "DELETE" }),
}

export async function buscarApi<T>(caminho: string): Promise<T> {
  return api.get<T>(caminho)
}

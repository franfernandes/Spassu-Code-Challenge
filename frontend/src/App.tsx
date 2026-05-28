import { useState } from "react"

import "./App.css"

type PaginaAtual = "vendas" | "comissoes"

function App() {
  const [paginaAtual, setPaginaAtual] = useState<PaginaAtual>("vendas")

  return (
    <div>
      <header className="app-header">
        <div className="header-container">
          <strong className="marca">Spassu</strong>
          <nav className="menu-principal" aria-label="Menu principal">
            <button
              className={paginaAtual === "vendas" ? "ativo" : ""}
              type="button"
              onClick={() => setPaginaAtual("vendas")}
            >
              Vendas
            </button>
            <button
              className={paginaAtual === "comissoes" ? "ativo" : ""}
              type="button"
              onClick={() => setPaginaAtual("comissoes")}
            >
              Comissões
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <section className="page-heading">
          <div>
            <span className="etiqueta">Papelaria</span>
            <h1>Gerenciador de vendas e comissões</h1>
            <p>
              Registre vendas e consulte as comissões dos vendedores por
              período.
            </p>
          </div>
        </section>

        {paginaAtual === "vendas" ? <PaginaVendas /> : <PaginaComissoes />}
      </main>
    </div>
  )
}

function PaginaVendas() {
  return (
    <section>
      <div className="page-actions">
        <h2>Vendas</h2>
        <button className="btn btn-primary" type="button">
          Nova venda
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <input
            className="input"
            placeholder="Buscar por nota fiscal, cliente ou vendedor..."
            type="search"
          />
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Data/hora</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Valor total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    Nenhuma venda carregada ainda. A próxima etapa conecta esta
                    tabela ao endpoint de vendas.
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function PaginaComissoes() {
  return (
    <section>
      <div className="page-actions">
        <h2>Comissões</h2>
      </div>

      <div className="card filtros">
        <label>
          Data inicial
          <input className="input" type="date" />
        </label>
        <label>
          Data final
          <input className="input" type="date" />
        </label>
        <button className="btn btn-primary" type="button">
          Consultar
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Total de comissão</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={2}>
                  <div className="empty-state">
                    Informe uma faixa de datas para consultar as comissões.
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Total geral</td>
                <td>R$ 0,00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  )
}

export default App

import { Fragment, useEffect, useState } from "react"

import "./App.css"
import { api } from "./api/cliente-http"
import logoipsum from "./assets/logoipsum.svg"

type PaginaAtual = "vendas" | "comissoes"

type VendaTabela = {
  id: number
  notaFiscal: string
  clienteId: number
  cliente: string
  vendedorId: number
  vendedor: string
  dataVenda: string
  valorTotal: string
  itens: ItemVendaTabela[]
}

type ItemVendaTabela = {
  produtoId: number
  codigo: string
  descricao: string
  quantidade: number
  precoUnitario: string
  totalProduto: string
  percentualComissao: string
  comissao: string
}

type ProdutoCatalogo = {
  id: number
  codigo: string
  descricao: string
  precoUnitario: number
  percentualComissao: number
}

type PessoaOpcao = {
  id: number
  nome: string
}

type ProdutoApi = {
  id: number
  codigo: string
  descricao: string
  valor_unitario: string
  percentual_comissao: string
}

type PessoaApi = {
  id: number
  nome: string
}

type ItemVendaApi = {
  id: number
  produto: number
  produto_codigo: string
  produto_descricao: string
  quantidade: number
  valor_unitario: string
  percentual_comissao: string
  percentual_comissao_aplicado: string
  valor_total: string
  valor_comissao: string
}

type VendaApi = {
  id: number
  numero_nota_fiscal: string
  data_hora: string
  cliente: number
  cliente_nome: string
  vendedor: number
  vendedor_nome: string
  itens: ItemVendaApi[]
  valor_total: string
}

type ItemVendaPayload = {
  produto: number
  quantidade: number
}

type VendaPayload = {
  numero_nota_fiscal: string
  data_hora: string
  cliente: number
  vendedor: number
  itens: ItemVendaPayload[]
}

type LinhaComissaoApi = {
  vendedor_id: number
  vendedor_nome: string
  total_vendas: number
  total_comissao: string
}

type RelatorioComissoesApi = {
  resultados: LinhaComissaoApi[]
  total_geral: string | number
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

function converterMoedaParaNumero(valor: string) {
  return Number(valor.replace("R$", "").replace(/\./g, "").replace(",", "."))
}

function converterDecimalApi(valor: string | number) {
  return Number(valor)
}

function montarRotuloProduto(produto: ProdutoCatalogo) {
  return `${produto.codigo} - ${produto.descricao}`
}

function criarItemVenda(
  produto: ProdutoCatalogo,
  quantidade: number,
): ItemVendaTabela {
  const totalProduto = produto.precoUnitario * quantidade
  const comissao = totalProduto * (produto.percentualComissao / 100)

  return {
    produtoId: produto.id,
    codigo: produto.codigo,
    descricao: produto.descricao,
    quantidade,
    precoUnitario: formatarMoeda(produto.precoUnitario),
    totalProduto: formatarMoeda(totalProduto),
    percentualComissao: `${produto.percentualComissao}%`,
    comissao: formatarMoeda(comissao),
  }
}

function gerarProximaNotaFiscal(vendas: VendaTabela[]) {
  const maiorNota = Math.max(
    ...vendas.map((venda) => Number(venda.notaFiscal)),
    0,
  )

  return String(maiorNota + 1).padStart(8, "0")
}

function criarVendaVazia(notaFiscal: string): VendaTabela {
  return {
    id: 0,
    notaFiscal,
    clienteId: 0,
    cliente: "",
    vendedorId: 0,
    vendedor: "",
    dataVenda: formatarDataHoraFormulario(new Date()),
    valorTotal: formatarMoeda(0),
    itens: [],
  }
}

function formatarDataHoraFormulario(valor: Date) {
  const data = new Intl.DateTimeFormat("pt-BR").format(valor)
  const hora = valor.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return `${data} - ${hora}`
}

function formatarDataHoraApi(valor: string) {
  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return valor
  }

  return formatarDataHoraFormulario(data)
}

function converterDataHoraParaApi(valor: string) {
  const [data, hora] = valor.split(" - ")
  const [dia, mes, ano] = data.split("/")

  return `${ano}-${mes}-${dia}T${hora}:00-03:00`
}

function converterDataParaApi(valor: string) {
  const [dia, mes, ano] = valor.split("/")

  return `${ano}-${mes}-${dia}`
}

function formatarPercentual(valor: string) {
  return `${converterDecimalApi(valor).toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  })}%`
}

function mapearProdutoApi(produto: ProdutoApi): ProdutoCatalogo {
  return {
    id: produto.id,
    codigo: produto.codigo,
    descricao: produto.descricao,
    precoUnitario: converterDecimalApi(produto.valor_unitario),
    percentualComissao: converterDecimalApi(produto.percentual_comissao),
  }
}

function mapearVendaApi(venda: VendaApi): VendaTabela {
  return {
    id: venda.id,
    notaFiscal: venda.numero_nota_fiscal,
    clienteId: venda.cliente,
    cliente: venda.cliente_nome,
    vendedorId: venda.vendedor,
    vendedor: venda.vendedor_nome,
    dataVenda: formatarDataHoraApi(venda.data_hora),
    valorTotal: formatarMoeda(converterDecimalApi(venda.valor_total)),
    itens: venda.itens.map((item) => {
      return {
        produtoId: item.produto,
        codigo: item.produto_codigo,
        descricao: item.produto_descricao,
        quantidade: item.quantidade,
        precoUnitario: formatarMoeda(converterDecimalApi(item.valor_unitario)),
        totalProduto: formatarMoeda(converterDecimalApi(item.valor_total)),
        percentualComissao: formatarPercentual(
          item.percentual_comissao_aplicado,
        ),
        comissao: formatarMoeda(converterDecimalApi(item.valor_comissao)),
      }
    }),
  }
}

function montarPayloadVenda(venda: VendaTabela): VendaPayload {
  return {
    numero_nota_fiscal: venda.notaFiscal,
    data_hora: converterDataHoraParaApi(venda.dataVenda),
    cliente: venda.clienteId,
    vendedor: venda.vendedorId,
    itens: venda.itens.map((item) => ({
      produto: item.produtoId,
      quantidade: item.quantidade,
    })),
  }
}

function formatarData(valor: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(valor)
}

function formatarMesAno(valor: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(valor)
}

function gerarDiasCalendario(mesAtual: Date) {
  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const primeiroDiaMes = new Date(ano, mes, 1)
  const inicioCalendario = new Date(primeiroDiaMes)
  inicioCalendario.setDate(primeiroDiaMes.getDate() - primeiroDiaMes.getDay())

  return Array.from({ length: 42 }, (_, indice) => {
    const data = new Date(inicioCalendario)
    data.setDate(inicioCalendario.getDate() + indice)

    return {
      data,
      foraDoMes: data.getMonth() !== mes,
    }
  })
}

function App() {
  const [paginaAtual, setPaginaAtual] = useState<PaginaAtual>("vendas")
  const [menuAberto, setMenuAberto] = useState(false)
  const [vendaEmEdicao, setVendaEmEdicao] = useState<VendaTabela | null>(null)
  const [cadastrandoVenda, setCadastrandoVenda] = useState(false)
  const tituloPagina = cadastrandoVenda
    ? "Nova Venda"
    : vendaEmEdicao
    ? `Alterar Venda - Nº ${Number(vendaEmEdicao.notaFiscal)}`
    : paginaAtual === "vendas"
      ? "Vendas"
      : "Comissões"

  return (
    <div className="app-shell">
      {menuAberto && (
        <aside className="menu-lateral">
          <nav aria-label="Menu lateral">
            <button
              className={paginaAtual === "vendas" ? "ativo" : ""}
              type="button"
              onClick={() => {
                setPaginaAtual("vendas")
                setVendaEmEdicao(null)
                setCadastrandoVenda(false)
                setMenuAberto(false)
              }}
            >
              <IconeVendas />
              <span>Vendas</span>
              <IconeSeta />
            </button>
            <button
              className={paginaAtual === "comissoes" ? "ativo" : ""}
              type="button"
              onClick={() => {
                setPaginaAtual("comissoes")
                setVendaEmEdicao(null)
                setCadastrandoVenda(false)
                setMenuAberto(false)
              }}
            >
              <IconeComissoes />
              <span>Comissões</span>
              <IconeSeta />
            </button>
          </nav>
        </aside>
      )}

      <main className="conteudo-principal">
        <header className="topo-pagina">
          <div className="topo-identidade">
            <button
              className="botao-menu"
              type="button"
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              <IconeHamburguer />
            </button>
            <img src={logoipsum} alt="logoipsum" className="logo" />
          </div>
          <h1>{tituloPagina}</h1>
        </header>

        {paginaAtual === "vendas" ? (
          <PaginaVendas
            cadastrandoVenda={cadastrandoVenda}
            vendaEmEdicao={vendaEmEdicao}
            onCadastrarVenda={() => setCadastrandoVenda(true)}
            onEditarVenda={setVendaEmEdicao}
            onFecharCadastro={() => setCadastrandoVenda(false)}
            onFecharEdicao={() => setVendaEmEdicao(null)}
          />
        ) : (
          <PaginaComissoes />
        )}
      </main>
    </div>
  )
}

function PaginaVendas({
  cadastrandoVenda,
  vendaEmEdicao,
  onCadastrarVenda,
  onEditarVenda,
  onFecharCadastro,
  onFecharEdicao,
}: {
  cadastrandoVenda: boolean
  vendaEmEdicao: VendaTabela | null
  onCadastrarVenda: () => void
  onEditarVenda: (venda: VendaTabela) => void
  onFecharCadastro: () => void
  onFecharEdicao: () => void
}) {
  const [listaVendas, setListaVendas] = useState<VendaTabela[]>([])
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([])
  const [clientes, setClientes] = useState<PessoaOpcao[]>([])
  const [vendedores, setVendedores] = useState<PessoaOpcao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [notaFiscalAberta, setNotaFiscalAberta] = useState<string | null>(null)
  const [vendaParaRemover, setVendaParaRemover] = useState<VendaTabela | null>(
    null,
  )
  const [mostrarAlertaRemocao, setMostrarAlertaRemocao] = useState(false)
  const [mostrarAlertaAlteracao, setMostrarAlertaAlteracao] = useState(false)
  const [mostrarAlertaCadastro, setMostrarAlertaCadastro] = useState(false)

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true)
        setErro("")
        const [vendasApi, produtosApi, clientesApi, vendedoresApi] =
          await Promise.all([
            api.get<VendaApi[]>("/vendas/"),
            api.get<ProdutoApi[]>("/produtos/"),
            api.get<PessoaApi[]>("/clientes/"),
            api.get<PessoaApi[]>("/vendedores/"),
          ])

        setListaVendas(vendasApi.map(mapearVendaApi))
        setProdutos(produtosApi.map(mapearProdutoApi))
        setClientes(clientesApi.map(({ id, nome }) => ({ id, nome })))
        setVendedores(vendedoresApi.map(({ id, nome }) => ({ id, nome })))
      } catch (erro) {
        setErro(
          erro instanceof Error
            ? erro.message
            : "Não foi possível carregar os dados da API.",
        )
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  function alternarItens(notaFiscal: string) {
    setNotaFiscalAberta((notaAtual) =>
      notaAtual === notaFiscal ? null : notaFiscal,
    )
  }

  async function confirmarRemocao() {
    if (!vendaParaRemover) {
      return
    }

    try {
      setErro("")
      await api.delete("/vendas/" + vendaParaRemover.id + "/")
      setListaVendas((vendasAtuais) =>
        vendasAtuais.filter((venda) => venda.id !== vendaParaRemover.id),
      )
      setVendaParaRemover(null)
      setMostrarAlertaRemocao(true)
    } catch {
      setErro("Não foi possível remover a venda.")
    }
  }

  async function finalizarEdicao(vendaAtualizada: VendaTabela) {
    try {
      setErro("")
      const vendaApi = await api.put<VendaApi>(
        "/vendas/" + vendaAtualizada.id + "/",
        montarPayloadVenda(vendaAtualizada),
      )
      const vendaMapeada = mapearVendaApi(vendaApi)

      setListaVendas((vendasAtuais) =>
        vendasAtuais.map((venda) =>
          venda.id === vendaMapeada.id ? vendaMapeada : venda,
        ),
      )
      setNotaFiscalAberta(null)
      setMostrarAlertaAlteracao(true)
      onFecharEdicao()
    } catch (erro) {
      setErro("Não foi possível alterar a venda.")
      throw erro
    }
  }

  async function finalizarCadastro(novaVenda: VendaTabela) {
    try {
      setErro("")
      const vendaApi = await api.post<VendaApi>(
        "/vendas/",
        montarPayloadVenda(novaVenda),
      )
      const vendaMapeada = mapearVendaApi(vendaApi)

      setListaVendas((vendasAtuais) => [vendaMapeada, ...vendasAtuais])
      setNotaFiscalAberta(null)
      setMostrarAlertaCadastro(true)
      onFecharCadastro()
    } catch (erro) {
      setErro("Não foi possível cadastrar a venda.")
      throw erro
    }
  }

  if (cadastrandoVenda) {
    return (
      <TelaFormularioVenda
        modo="criar"
        venda={criarVendaVazia(gerarProximaNotaFiscal(listaVendas))}
        produtos={produtos}
        clientes={clientes}
        vendedores={vendedores}
        onCancelar={onFecharCadastro}
        onFinalizar={finalizarCadastro}
      />
    )
  }

  if (vendaEmEdicao) {
    return (
      <TelaFormularioVenda
        modo="editar"
        venda={vendaEmEdicao}
        produtos={produtos}
        clientes={clientes}
        vendedores={vendedores}
        onCancelar={onFecharEdicao}
        onFinalizar={finalizarEdicao}
      />
    )
  }

  return (
    <>
      <section className="cartao-conteudo">
        <div className="cabecalho-lista">
          <h2>Vendas Realizadas</h2>
          <button
            className="botao-primario"
            type="button"
            onClick={onCadastrarVenda}
          >
            Inserir nova Venda
          </button>
        </div>

        {erro && <p className="estado-vazio">{erro}</p>}
        {carregando && <p className="estado-vazio">Carregando vendas...</p>}

        {!carregando && !erro && (
          <div className="tabela-scroll">
            <table className="tabela-vendas">
              <thead>
                <tr>
                  <th>Nota Fiscal</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Data da Venda</th>
                  <th>Valor Total</th>
                  <th>Opções</th>
                </tr>
              </thead>
              <tbody>
                {listaVendas.map((venda) => {
                  const estaAberta = notaFiscalAberta === venda.notaFiscal

                  return (
                    <Fragment key={venda.id}>
                      <tr>
                        <td>{venda.notaFiscal}</td>
                        <td>{venda.cliente}</td>
                        <td>{venda.vendedor}</td>
                        <td>{venda.dataVenda}</td>
                        <td>{venda.valorTotal}</td>
                        <td>
                          <AcoesVenda
                            estaAberta={estaAberta}
                            onAlternarItens={() =>
                              alternarItens(venda.notaFiscal)
                            }
                            onRemover={() => setVendaParaRemover(venda)}
                            onEditar={() => onEditarVenda(venda)}
                          />
                        </td>
                      </tr>
                      {estaAberta && (
                        <tr className="linha-detalhes">
                          <td colSpan={6}>
                            <TabelaItensVenda venda={venda} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {vendaParaRemover && (
        <ModalRemoverVenda
          onCancelar={() => setVendaParaRemover(null)}
          onConfirmar={confirmarRemocao}
        />
      )}

      {mostrarAlertaRemocao && (
        <AlertaVendaRemovida onFechar={() => setMostrarAlertaRemocao(false)} />
      )}

      {mostrarAlertaAlteracao && (
        <AlertaVendaAlterada
          onFechar={() => setMostrarAlertaAlteracao(false)}
        />
      )}

      {mostrarAlertaCadastro && (
        <AlertaVendaCadastrada
          onFechar={() => setMostrarAlertaCadastro(false)}
        />
      )}
    </>
  )
}

function AcoesVenda({
  estaAberta,
  onAlternarItens,
  onRemover,
  onEditar,
}: {
  estaAberta: boolean
  onAlternarItens: () => void
  onRemover: () => void
  onEditar: () => void
}) {
  return (
    <div className="acoes-venda">
      <button type="button" onClick={onAlternarItens}>
        {estaAberta ? "Fechar" : "Ver itens"}
      </button>
      <button type="button" aria-label="Editar venda" onClick={onEditar}>
        <IconeEditar />
      </button>
      <button
        className="acao-remover"
        type="button"
        aria-label="Excluir venda"
        onClick={onRemover}
      >
        <IconeExcluir />
      </button>
    </div>
  )
}

function ModalRemoverVenda({
  onCancelar,
  onConfirmar,
}: {
  onCancelar: () => void
  onConfirmar: () => void
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-remover-venda"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-remover-venda"
      >
        <header className="modal-remover-cabecalho">
          <h2 id="titulo-remover-venda">Remover Venda</h2>
          <button type="button" aria-label="Fechar modal" onClick={onCancelar}>
            ×
          </button>
        </header>

        <p>Deseja remover esta venda?</p>

        <footer className="modal-remover-acoes">
          <button className="botao-modal botao-modal-secundario" type="button" onClick={onCancelar}>
            Não
          </button>
          <button className="botao-modal botao-modal-primario" type="button" onClick={onConfirmar}>
            Sim
          </button>
        </footer>
      </section>
    </div>
  )
}

function AlertaVendaRemovida({ onFechar }: { onFechar: () => void }) {
  return (
    <aside className="alerta-venda-removida" role="status">
      <strong>VENDA REMOVIDA COM SUCESSO!</strong>
      <button type="button" aria-label="Fechar alerta" onClick={onFechar}>
        <IconeFecharAlerta />
      </button>
    </aside>
  )
}

function AlertaVendaAlterada({ onFechar }: { onFechar: () => void }) {
  return (
    <aside className="alerta-venda-removida" role="status">
      <strong>VENDA ALTERADA COM SUCESSO!</strong>
      <button type="button" aria-label="Fechar alerta" onClick={onFechar}>
        <IconeFecharAlerta />
      </button>
    </aside>
  )
}

function AlertaVendaCadastrada({ onFechar }: { onFechar: () => void }) {
  return (
    <aside className="alerta-venda-removida" role="status">
      <strong>VENDA REALIZADA COM SUCESSO!</strong>
      <button type="button" aria-label="Fechar alerta" onClick={onFechar}>
        <IconeFecharAlerta />
      </button>
    </aside>
  )
}

function TabelaItensVenda({ venda }: { venda: VendaTabela }) {
  const quantidadeTotal = venda.itens.reduce(
    (total, item) => total + item.quantidade,
    0,
  )
  const comissaoTotal = venda.itens.reduce(
    (total, item) => total + converterMoedaParaNumero(item.comissao),
    0,
  )

  return (
    <table className="tabela-itens-venda">
      <colgroup>
        <col className="col-produto" />
        <col className="col-quantidade" />
        <col className="col-preco" />
        <col className="col-total-produto" />
        <col className="col-percentual" />
        <col className="col-comissao" />
      </colgroup>
      <thead>
        <tr>
          <th>Produtos/Serviço</th>
          <th>Quantidade</th>
          <th>Preço unitário</th>
          <th>Total do Produto</th>
          <th>% de Comissão</th>
          <th>Comissão</th>
        </tr>
      </thead>
      <tbody>
        {venda.itens.map((item) => (
          <tr key={`${venda.notaFiscal}-${item.codigo}`}>
            <td>
              {item.codigo} - {item.descricao}
            </td>
            <td>{item.quantidade}</td>
            <td>{item.precoUnitario}</td>
            <td>{item.totalProduto}</td>
            <td>{item.percentualComissao}</td>
            <td>{item.comissao}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="linha-total-itens">
          <td>Total da Venda</td>
          <td>{quantidadeTotal}</td>
          <td />
          <td>{venda.valorTotal}</td>
          <td />
          <td>{formatarMoeda(comissaoTotal)}</td>
        </tr>
      </tfoot>
    </table>
  )
}

function TelaFormularioVenda({
  modo,
  venda,
  produtos,
  clientes,
  vendedores,
  onCancelar,
  onFinalizar,
}: {
  modo: "editar" | "criar"
  venda: VendaTabela
  produtos: ProdutoCatalogo[]
  clientes: PessoaOpcao[]
  vendedores: PessoaOpcao[]
  onCancelar: () => void
  onFinalizar: (vendaAtualizada: VendaTabela) => void | Promise<void>
}) {
  const [buscaProduto, setBuscaProduto] = useState("")
  const [quantidadeProduto, setQuantidadeProduto] = useState("0")
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoCatalogo | null>(null)
  const [dataVenda, setDataVenda] = useState(venda.dataVenda)
  const [vendedorSelecionado, setVendedorSelecionado] = useState(() =>
    venda.vendedorId > 0 ? String(venda.vendedorId) : "",
  )
  const [clienteSelecionado, setClienteSelecionado] = useState(() =>
    venda.clienteId > 0 ? String(venda.clienteId) : "",
  )
  const [itensEditaveis, setItensEditaveis] = useState(venda.itens)
  const [salvando, setSalvando] = useState(false)
  const textoBuscaNormalizado = buscaProduto.trim().toLowerCase()
  const sugestoesFiltradas = produtos.filter((produto) =>
    montarRotuloProduto(produto).toLowerCase().includes(textoBuscaNormalizado),
  )
  const exibirSugestoes =
    buscaProduto.trim().length > 0 &&
    !produtoSelecionado &&
    sugestoesFiltradas.length > 0
  const valorTotalEdicao = formatarMoeda(
    itensEditaveis.reduce(
      (total, item) => total + converterMoedaParaNumero(item.totalProduto),
      0,
    ),
  )
  const formularioValido =
    dataVenda.trim().length > 0 &&
    vendedorSelecionado.length > 0 &&
    clienteSelecionado.length > 0 &&
    itensEditaveis.length > 0

  function adicionarProduto() {
    const quantidade = Number(quantidadeProduto)
    const produto =
      produtoSelecionado ??
      produtos.find(
        (item) =>
          montarRotuloProduto(item).toLowerCase() === textoBuscaNormalizado ||
          item.codigo === textoBuscaNormalizado,
      ) ??
      sugestoesFiltradas[0]

    if (!produto || quantidade <= 0) {
      return
    }

    setItensEditaveis((itensAtuais) => {
      const itemExistente = itensAtuais.find(
        (item) => item.produtoId === produto.id,
      )

      if (!itemExistente) {
        return [...itensAtuais, criarItemVenda(produto, quantidade)]
      }

      return itensAtuais.map((item) =>
        item.produtoId === produto.id
          ? criarItemVenda(produto, item.quantidade + quantidade)
          : item,
      )
    })
    setBuscaProduto("")
    setProdutoSelecionado(null)
    setQuantidadeProduto("0")
  }

  function removerProduto(produtoId: number) {
    setItensEditaveis((itensAtuais) =>
      itensAtuais.filter((item) => item.produtoId !== produtoId),
    )
  }

  async function finalizarVenda() {
    const cliente = clientes.find(
      (opcao) => opcao.id === Number(clienteSelecionado),
    )
    const vendedor = vendedores.find(
      (opcao) => opcao.id === Number(vendedorSelecionado),
    )

    if (!formularioValido || !cliente || !vendedor || salvando) {
      return
    }

    try {
      setSalvando(true)
      await onFinalizar({
        ...venda,
        clienteId: cliente.id,
        cliente: cliente.nome,
        vendedorId: vendedor.id,
        vendedor: vendedor.nome,
        dataVenda,
        itens: itensEditaveis,
        valorTotal: valorTotalEdicao,
      })
    } catch {
      setSalvando(false)
    }
  }

  return (
    <section className="cartao-conteudo tela-alterar-venda">
      <div className="alterar-venda-produtos">
        <h2>Produtos</h2>

        <div className="formulario-produto">
          <label className="campo-busca-produto">
            <span>Buscar pelo código de barras ou descrição</span>
            <input
              type="text"
              placeholder="Digite o código ou nome do produto"
              value={buscaProduto}
              onChange={(event) => {
                setBuscaProduto(event.target.value)
                setProdutoSelecionado(null)
              }}
            />
            {exibirSugestoes && (
              <ul className="sugestoes-produtos">
                {sugestoesFiltradas.map((produto) => (
                  <li key={produto.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setBuscaProduto(montarRotuloProduto(produto))
                        setProdutoSelecionado(produto)
                      }}
                    >
                      {montarRotuloProduto(produto)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>

          <label className="campo-quantidade-produto">
            <span>Quantidade de itens</span>
            <input
              type="number"
              min="0"
              value={quantidadeProduto}
              onChange={(event) => setQuantidadeProduto(event.target.value)}
            />
          </label>

          <button
            className="botao-primario botao-adicionar-produto"
            type="button"
            onClick={adicionarProduto}
          >
            Adicionar
          </button>
        </div>

        <table className="tabela-produtos-edicao">
          <thead>
            <tr>
              <th>Produtos/Serviço</th>
              <th>Quantidade</th>
              <th>Preço unitário</th>
              <th>Total</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {itensEditaveis.map((item) => (
              <tr key={item.produtoId}>
                <td>
                  {item.codigo} - {item.descricao}
                </td>
                <td>{item.quantidade}</td>
                <td>{item.precoUnitario}</td>
                <td>{item.totalProduto}</td>
                <td>
                  <button
                    type="button"
                    aria-label="Remover produto"
                    onClick={() => removerProduto(item.produtoId)}
                  >
                    <IconeExcluir />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="alterar-venda-dados">
        <h2>Dados da venda</h2>

        <form className="formulario-dados-venda">
          <label>
            <span>Data e Hora da Venda</span>
            <input
              type="text"
              value={dataVenda}
              onChange={(event) => setDataVenda(event.target.value)}
            />
          </label>

          <label>
            <span>Escolha um vendedor</span>
            <select
              value={vendedorSelecionado}
              onChange={(event) => setVendedorSelecionado(event.target.value)}
            >
              <option value="" disabled>
                Selecione o nome
              </option>
              {vendedores.map((opcao) => (
                <option key={opcao.id} value={opcao.id}>
                  {String(opcao.id).padStart(3, "0")} - {opcao.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Escolha um cliente</span>
            <select
              value={clienteSelecionado}
              onChange={(event) => setClienteSelecionado(event.target.value)}
            >
              <option value="" disabled>
                Selecione o nome
              </option>
              {clientes.map((opcao) => (
                <option key={opcao.id} value={opcao.id}>
                  {String(opcao.id).padStart(3, "0")} - {opcao.nome}
                </option>
              ))}
            </select>
          </label>
        </form>

        <div className="rodape-dados-venda">
          <div className="total-edicao-venda">
            <strong>
              {modo === "criar"
                ? "Valor total da venda:"
                : "Valor total da venda"}
            </strong>
            <span>{valorTotalEdicao}</span>
          </div>

          <div className="acoes-edicao-venda">
            <button type="button" onClick={onCancelar}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={finalizarVenda}
              disabled={!formularioValido || salvando}
            >
              {salvando ? "Salvando..." : "Finalizar"}
            </button>
          </div>
        </div>
      </aside>
    </section>
  )
}

function PaginaComissoes() {
  const [periodoInicio, setPeriodoInicio] = useState("")
  const [periodoFim, setPeriodoFim] = useState("")
  const [campoCalendarioAberto, setCampoCalendarioAberto] = useState<
    "inicio" | "fim" | null
  >(null)
  const [mesCalendario, setMesCalendario] = useState(() => {
    const hoje = new Date()

    return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  })
  const [relatorioVisivel, setRelatorioVisivel] = useState(false)
  const [relatorioComissoes, setRelatorioComissoes] = useState<
    LinhaComissaoApi[]
  >([])
  const [totalGeralComissoes, setTotalGeralComissoes] = useState("0.00")
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false)
  const [erroRelatorio, setErroRelatorio] = useState("")
  const diasCalendario = gerarDiasCalendario(mesCalendario)

  function navegarMes(direcao: -1 | 1) {
    setMesCalendario(
      (mesAtual) =>
        new Date(mesAtual.getFullYear(), mesAtual.getMonth() + direcao, 1),
    )
  }

  function selecionarData(data: Date) {
    const dataSelecionada = formatarData(data)

    if (campoCalendarioAberto === "inicio") {
      setPeriodoInicio(dataSelecionada)
    }

    if (campoCalendarioAberto === "fim") {
      setPeriodoFim(dataSelecionada)
    }

    setCampoCalendarioAberto(null)
  }

  async function pesquisarComissoes() {
    if (!periodoInicio || !periodoFim) {
      return
    }

    try {
      setCarregandoRelatorio(true)
      setErroRelatorio("")
      const caminho =
        "/comissoes/?data_inicio=" +
        converterDataParaApi(periodoInicio) +
        "&data_fim=" +
        converterDataParaApi(periodoFim)
      const relatorio = await api.get<RelatorioComissoesApi>(caminho)

      setRelatorioComissoes(relatorio.resultados)
      setTotalGeralComissoes(String(relatorio.total_geral))
      setRelatorioVisivel(true)
    } catch {
      setErroRelatorio("Não foi possível carregar o relatório de comissões.")
      setRelatorioVisivel(false)
    } finally {
      setCarregandoRelatorio(false)
    }
  }

  return (
    <section className="cartao-conteudo cartao-comissoes">
      <div className="cabecalho-comissoes">
        <h2>Relatório de Comissões</h2>

        <div className="filtros-comissoes">
          <label>
            <span className="sr-only">Período de Início</span>
            <input
              type="text"
              placeholder="Período de Início"
              value={periodoInicio}
              onChange={(event) => setPeriodoInicio(event.target.value)}
              onFocus={() => setCampoCalendarioAberto("inicio")}
            />
            <button
              className="botao-calendario"
              type="button"
              aria-label="Abrir calendário de início"
              onClick={() => setCampoCalendarioAberto("inicio")}
            >
              <IconeCalendario />
            </button>
          </label>

          <label>
            <span className="sr-only">Período de Fim</span>
            <input
              type="text"
              placeholder="Período de Fim"
              value={periodoFim}
              onChange={(event) => setPeriodoFim(event.target.value)}
              onFocus={() => setCampoCalendarioAberto("fim")}
            />
            <button
              className="botao-calendario"
              type="button"
              aria-label="Abrir calendário de fim"
              onClick={() => setCampoCalendarioAberto("fim")}
            >
              <IconeCalendario />
            </button>
          </label>

          <button
            className="botao-pesquisar-comissoes"
            type="button"
            aria-label="Pesquisar comissões"
            onClick={pesquisarComissoes}
          >
            <IconeLupa />
          </button>
        </div>
      </div>

      {campoCalendarioAberto && (
        <div className="calendario-comissoes">
          <div className="calendario-cabecalho">
            <button
              className="calendario-mes-anterior"
              type="button"
              aria-label="Mês anterior"
              onClick={() => navegarMes(-1)}
            />
            <strong>{formatarMesAno(mesCalendario)}</strong>
            <button
              className="calendario-proximo-mes"
              type="button"
              aria-label="Próximo mês"
              onClick={() => navegarMes(1)}
            />
          </div>
          <div className="calendario-semana">
            <span>do</span>
            <span>2ª</span>
            <span>3ª</span>
            <span>4ª</span>
            <span>5ª</span>
            <span>6ª</span>
            <span>sá</span>
          </div>
          <div className="calendario-dias">
            {diasCalendario.map((diaCalendario) => (
              <button
                className={[
                  diaCalendario.foraDoMes ? "fora-do-mes" : "",
                  formatarData(diaCalendario.data) === periodoInicio ||
                  formatarData(diaCalendario.data) === periodoFim
                    ? "selecionado"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                type="button"
                key={diaCalendario.data.toISOString()}
                onClick={() => selecionarData(diaCalendario.data)}
              >
                {diaCalendario.data.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}

      {carregandoRelatorio && (
        <p className="estado-vazio">Carregando relatório...</p>
      )}

      {erroRelatorio && <p className="estado-vazio">{erroRelatorio}</p>}

      {relatorioVisivel && !carregandoRelatorio ? (
        <div className="tabela-comissoes-scroll">
          <table className="tabela-comissoes">
            <thead>
              <tr>
                <th>Cód.</th>
                <th>Vendedor</th>
                <th>Total de Vendas</th>
                <th>Total de Comissões</th>
              </tr>
            </thead>
            <tbody>
              {relatorioComissoes.map((linha) => (
                <tr key={linha.vendedor_id}>
                  <td>{String(linha.vendedor_id).padStart(3, "0")}</td>
                  <td>{linha.vendedor_nome}</td>
                  <td>{linha.total_vendas}</td>
                  <td>{formatarMoeda(converterDecimalApi(linha.total_comissao))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Total de Comissões do Período</td>
                <td>
                  {formatarMoeda(converterDecimalApi(totalGeralComissoes))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        !carregandoRelatorio &&
        !erroRelatorio && (
          <p className="estado-vazio">
            Para visualizar o relatório, selecione um período nos campos acima.
          </p>
        )
      )}
    </section>
  )
}

function IconeHamburguer() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
      <path
        d="M0 1h18M0 7h18M0 13h18"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  )
}

function IconeCalendario() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 18.5V10H19V18.5C19 19.3438 18.3125 20 17.5 20H6.5C5.65625 20 5 19.3438 5 18.5ZM15 12.375V13.625C15 13.8438 15.1562 14 15.375 14H16.625C16.8125 14 17 13.8438 17 13.625V12.375C17 12.1875 16.8125 12 16.625 12H15.375C15.1562 12 15 12.1875 15 12.375ZM15 16.375V17.625C15 17.8438 15.1562 18 15.375 18H16.625C16.8125 18 17 17.8438 17 17.625V16.375C17 16.1875 16.8125 16 16.625 16H15.375C15.1562 16 15 16.1875 15 16.375ZM11 12.375V13.625C11 13.8438 11.1562 14 11.375 14H12.625C12.8125 14 13 13.8438 13 13.625V12.375C13 12.1875 12.8125 12 12.625 12H11.375C11.1562 12 11 12.1875 11 12.375ZM11 16.375V17.625C11 17.8438 11.1562 18 11.375 18H12.625C12.8125 18 13 17.8438 13 17.625V16.375C13 16.1875 12.8125 16 12.625 16H11.375C11.1562 16 11 16.1875 11 16.375ZM7 12.375V13.625C7 13.8438 7.15625 14 7.375 14H8.625C8.8125 14 9 13.8438 9 13.625V12.375C9 12.1875 8.8125 12 8.625 12H7.375C7.15625 12 7 12.1875 7 12.375ZM7 16.375V17.625C7 17.8438 7.15625 18 7.375 18H8.625C8.8125 18 9 17.8438 9 17.625V16.375C9 16.1875 8.8125 16 8.625 16H7.375C7.15625 16 7 16.1875 7 16.375ZM17.5 6C18.3125 6 19 6.6875 19 7.5V9H5V7.5C5 6.6875 5.65625 6 6.5 6H8V4.5C8 4.25 8.21875 4 8.5 4H9.5C9.75 4 10 4.25 10 4.5V6H14V4.5C14 4.25 14.2188 4 14.5 4H15.5C15.75 4 16 4.25 16 4.5V6H17.5Z"
        fill="#00585E"
      />
    </svg>
  )
}

function IconeLupa() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <g clipPath="url(#clip-lupa-comissoes)">
        <path
          d="M15.7812 13.8438C16.0625 14.1562 16.0625 14.625 15.75 14.9062L14.875 15.7812C14.5938 16.0938 14.125 16.0938 13.8125 15.7812L10.7188 12.6875C10.5625 12.5312 10.5 12.3438 10.5 12.1562V11.625C9.375 12.5 8 13 6.5 13C2.90625 13 0 10.0938 0 6.5C0 2.9375 2.90625 0 6.5 0C10.0625 0 13 2.9375 13 6.5C13 8.03125 12.4688 9.40625 11.625 10.5H12.125C12.3125 10.5 12.5 10.5938 12.6562 10.7188L15.7812 13.8438ZM6.5 10.5C8.6875 10.5 10.5 8.71875 10.5 6.5C10.5 4.3125 8.6875 2.5 6.5 2.5C4.28125 2.5 2.5 4.3125 2.5 6.5C2.5 8.71875 4.28125 10.5 6.5 10.5Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip-lupa-comissoes">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function IconeVendas() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
      <path
        d="M14.9736 11.0977L14.1914 6.41016C14.1152 5.95898 13.7256 5.62793 13.2656 5.62793H6.09375V3.75293H8.90625C9.16406 3.75293 9.375 3.54199 9.375 3.28418V0.46875C9.375 0.210938 9.16406 0 8.90625 0H1.40625C1.14844 0 0.9375 0.210938 0.9375 0.46875V3.28125C0.9375 3.53906 1.14844 3.75 1.40625 3.75H4.21875V5.625H1.73145C1.27441 5.625 0.881836 5.95605 0.805664 6.40723L0.0234375 11.0947C0.00585938 11.1973 -0.00292969 11.2998 -0.00292969 11.4023V14.0625C-0.00292969 14.5811 0.416016 15 0.93457 15H14.0596C14.5781 15 14.9971 14.5811 14.9971 14.0625V11.4053C15 11.3027 14.9912 11.2002 14.9736 11.0977ZM8.20312 7.26562C8.20312 7.00781 8.41406 6.79688 8.67188 6.79688H9.14062C9.39844 6.79688 9.60938 7.00781 9.60938 7.26562V7.73438C9.60938 7.99219 9.39844 8.20312 9.14062 8.20312H8.67188C8.41406 8.20312 8.20312 7.99219 8.20312 7.73438V7.26562ZM7.26562 9.14062H7.73438C7.99219 9.14062 8.20312 9.35156 8.20312 9.60938V10.0781C8.20312 10.3359 7.99219 10.5469 7.73438 10.5469H7.26562C7.00781 10.5469 6.79688 10.3359 6.79688 10.0781V9.60938C6.79688 9.35156 7.00781 9.14062 7.26562 9.14062ZM6.32812 6.79688C6.58594 6.79688 6.79688 7.00781 6.79688 7.26562V7.73438C6.79688 7.99219 6.58594 8.20312 6.32812 8.20312H5.85938C5.60156 8.20312 5.39062 7.99219 5.39062 7.73438V7.26562C5.39062 7.00781 5.60156 6.79688 5.85938 6.79688H6.32812ZM2.34375 2.34375V1.40625H7.96875V2.34375H2.34375ZM3.51562 8.20312H3.04688C2.78906 8.20312 2.57812 7.99219 2.57812 7.73438V7.26562C2.57812 7.00781 2.78906 6.79688 3.04688 6.79688H3.51562C3.77344 6.79688 3.98438 7.00781 3.98438 7.26562V7.73438C3.98438 7.99219 3.77344 8.20312 3.51562 8.20312ZM3.98438 10.0781V9.60938C3.98438 9.35156 4.19531 9.14062 4.45312 9.14062H4.92188C5.17969 9.14062 5.39062 9.35156 5.39062 9.60938V10.0781C5.39062 10.3359 5.17969 10.5469 4.92188 10.5469H4.45312C4.19531 10.5469 3.98438 10.3359 3.98438 10.0781ZM10.3125 13.3594C10.3125 13.4883 10.207 13.5938 10.0781 13.5938H4.92188C4.79297 13.5938 4.6875 13.4883 4.6875 13.3594V12.8906C4.6875 12.7617 4.79297 12.6562 4.92188 12.6562H10.0781C10.207 12.6562 10.3125 12.7617 10.3125 12.8906V13.3594ZM11.0156 10.0781C11.0156 10.3359 10.8047 10.5469 10.5469 10.5469H10.0781C9.82031 10.5469 9.60938 10.3359 9.60938 10.0781V9.60938C9.60938 9.35156 9.82031 9.14062 10.0781 9.14062H10.5469C10.8047 9.14062 11.0156 9.35156 11.0156 9.60938V10.0781ZM12.4219 7.73438C12.4219 7.99219 12.2109 8.20312 11.9531 8.20312H11.4844C11.2266 8.20312 11.0156 7.99219 11.0156 7.73438V7.26562C11.0156 7.00781 11.2266 6.79688 11.4844 6.79688H11.9531C12.2109 6.79688 12.4219 7.00781 12.4219 7.26562V7.73438Z"
        fill="#2B7D83"
      />
    </svg>
  )
}

function IconeComissoes() {
  return (
    <svg width="14" height="15" viewBox="0 0 14 15" aria-hidden="true">
      <path
        d="M11.7188 0H1.40625C0.65625 0 0 0.65625 0 1.40625V13.5938C0 14.3438 0.65625 15 1.40625 15H11.7188C12.4688 15 13.125 14.3438 13.125 13.5938V1.40625C13.125 0.65625 12.4688 0 11.7188 0ZM3.75 12.75C3.75 12.9375 3.5625 13.125 3.375 13.125H2.25C2.0625 13.125 1.875 12.9375 1.875 12.75V11.625C1.875 11.4375 2.0625 11.25 2.25 11.25H3.375C3.5625 11.25 3.75 11.4375 3.75 11.625V12.75ZM3.75 9C3.75 9.1875 3.5625 9.375 3.375 9.375H2.25C2.0625 9.375 1.875 9.1875 1.875 9V7.875C1.875 7.6875 2.0625 7.5 2.25 7.5H3.375C3.5625 7.5 3.75 7.6875 3.75 7.875V9ZM7.5 12.75C7.5 12.9375 7.3125 13.125 7.125 13.125H6C5.8125 13.125 5.625 12.9375 5.625 12.75V11.625C5.625 11.4375 5.8125 11.25 6 11.25H7.125C7.3125 11.25 7.5 11.4375 7.5 11.625V12.75ZM7.5 9C7.5 9.1875 7.3125 9.375 7.125 9.375H6C5.8125 9.375 5.625 9.1875 5.625 9V7.875C5.625 7.6875 5.8125 7.5 6 7.5H7.125C7.3125 7.5 7.5 7.6875 7.5 7.875V9ZM11.25 12.75C11.25 12.9375 11.0625 13.125 10.875 13.125H9.75C9.5625 13.125 9.375 12.9375 9.375 12.75V7.875C9.375 7.6875 9.5625 7.5 9.75 7.5H10.875C11.0625 7.5 11.25 7.6875 11.25 7.875V12.75ZM11.25 5.25C11.25 5.4375 11.0625 5.625 10.875 5.625H2.25C2.0625 5.625 1.875 5.4375 1.875 5.25V2.25C1.875 2.0625 2.0625 1.875 2.25 1.875H10.875C11.0625 1.875 11.25 2.0625 11.25 2.25V5.25Z"
        fill="#2B7D83"
      />
    </svg>
  )
}

function IconeSeta() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" aria-hidden="true">
      <path
        d="M17.2021 13.3301L10.5615 19.9707C10.1025 20.4297 9.36035 20.4297 8.90625 19.9707L7.80273 18.8672C7.34375 18.4082 7.34375 17.666 7.80273 17.2119L12.5098 12.5049L7.80273 7.79785C7.34375 7.33887 7.34375 6.59668 7.80273 6.14258L8.90137 5.0293C9.36035 4.57031 10.1025 4.57031 10.5566 5.0293L17.1973 11.6699C17.6611 12.1289 17.6611 12.8711 17.2021 13.3301Z"
        fill="#DADADA"
      />
    </svg>
  )
}

function IconeEditar() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" aria-hidden="true">
      <path
        d="M13.2802 3.79998L16.2556 6.77533C16.3809 6.90068 16.3809 7.10519 16.2556 7.23054L9.05139 14.4347L5.99028 14.7745C5.58125 14.8206 5.2349 14.4743 5.28108 14.0653L5.62083 11.0042L12.825 3.79998C12.9503 3.67464 13.1549 3.67464 13.2802 3.79998ZM18.624 3.0446L17.0142 1.43488C16.5128 0.933491 15.6981 0.933491 15.1934 1.43488L14.0257 2.60259C13.9003 2.72794 13.9003 2.93245 14.0257 3.0578L17.001 6.03314C17.1264 6.15849 17.3309 6.15849 17.4563 6.03314L18.624 4.86544C19.1253 4.36075 19.1253 3.54599 18.624 3.0446ZM12.6667 12.4753V15.8333H2.11111V5.27776H9.69132C9.79688 5.27776 9.89583 5.23488 9.9717 5.16231L11.2911 3.84287C11.5418 3.59217 11.3637 3.16665 11.0108 3.16665H1.58333C0.709201 3.16665 0 3.87585 0 4.74998V16.3611C0 17.2352 0.709201 17.9444 1.58333 17.9444H13.1944C14.0686 17.9444 14.7778 17.2352 14.7778 16.3611V11.1559C14.7778 10.8029 14.3523 10.6281 14.1016 10.8755L12.7821 12.1949C12.7095 12.2708 12.6667 12.3698 12.6667 12.4753Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconeExcluir() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
      <path
        d="M12.6562 1.00001H9.14062L8.86523 0.41563C8.8069 0.290697 8.71704 0.185606 8.60576 0.11218C8.49448 0.0387537 8.3662 -9.46239e-05 8.23535 5.47897e-06H4.88672C4.75617 -0.00052985 4.62811 0.0381736 4.51723 0.111682C4.40634 0.18519 4.31712 0.290529 4.25977 0.41563L3.98438 1.00001H0.46875C0.34443 1.00001 0.225201 1.05268 0.137294 1.14645C0.049386 1.24022 0 1.3674 0 1.50001L0 2.50001C0 2.63261 0.049386 2.75979 0.137294 2.85356C0.225201 2.94733 0.34443 3.00001 0.46875 3.00001H12.6562C12.7806 3.00001 12.8998 2.94733 12.9877 2.85356C13.0756 2.75979 13.125 2.63261 13.125 2.50001V1.50001C13.125 1.3674 13.0756 1.24022 12.9877 1.14645C12.8998 1.05268 12.7806 1.00001 12.6562 1.00001ZM1.55859 14.5938C1.58095 14.9746 1.73852 15.332 1.99924 15.5932C2.25995 15.8545 2.6042 16 2.96191 16H10.1631C10.5208 16 10.8651 15.8545 11.1258 15.5932C11.3865 15.332 11.544 14.9746 11.5664 14.5938L12.1875 4.00001H0.9375L1.55859 14.5938Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconeFecharAlerta() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <g clipPath="url(#clip-fechar-alerta)">
        <path
          d="M10 0.3125C4.64844 0.3125 0.3125 4.64844 0.3125 10C0.3125 15.3516 4.64844 19.6875 10 19.6875C15.3516 19.6875 19.6875 15.3516 19.6875 10C19.6875 4.64844 15.3516 0.3125 10 0.3125ZM14.75 12.543C14.9336 12.7266 14.9336 13.0234 14.75 13.207L13.2031 14.75C13.0195 14.9336 12.7227 14.9336 12.5391 14.75L10 12.1875L7.45703 14.75C7.27344 14.9336 6.97656 14.9336 6.79297 14.75L5.25 13.2031C5.06641 13.0195 5.06641 12.7227 5.25 12.5391L7.8125 10L5.25 7.45703C5.06641 7.27344 5.06641 6.97656 5.25 6.79297L6.79688 5.24609C6.98047 5.0625 7.27734 5.0625 7.46094 5.24609L10 7.8125L12.543 5.25C12.7266 5.06641 13.0234 5.06641 13.207 5.25L14.7539 6.79688C14.9375 6.98047 14.9375 7.27734 14.7539 7.46094L12.1875 10L14.75 12.543Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip-fechar-alerta">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default App

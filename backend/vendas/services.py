from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Prefetch

from .models import ItemVenda, RegraComissao, Venda


PRECISAO_MONETARIA = Decimal("0.01")


@dataclass(frozen=True)
class ComissaoVendedor:
    vendedor_id: int
    vendedor_nome: str
    total_vendas: int
    total_comissao: Decimal


def calcular_comissao_item(item):
    percentual = obter_percentual_comissao_aplicado(
        data_hora=item.venda.data_hora,
        percentual_produto=item.percentual_comissao,
    )

    return arredondar_valor_monetario(
        item.valor_total * percentual / Decimal("100.00"),
    )


def calcular_comissao_venda(venda):
    return sum(
        (calcular_comissao_item(item) for item in venda.itens.all()),
        Decimal("0.00"),
    )


def listar_comissoes_vendedores(data_inicio, data_fim):
    vendas = (
        Venda.objects.filter(data_hora__date__gte=data_inicio, data_hora__date__lte=data_fim)
        .select_related("vendedor")
        .prefetch_related(
            Prefetch(
                "itens",
                queryset=ItemVenda.objects.select_related("produto"),
            )
        )
    )

    totais_por_vendedor = {}
    for venda in vendas:
        atual = totais_por_vendedor.get(
            venda.vendedor_id,
            {
                "vendedor_nome": venda.vendedor.nome,
                "total_vendas": 0,
                "total_comissao": Decimal("0.00"),
            },
        )
        atual["total_vendas"] += 1
        atual["total_comissao"] += calcular_comissao_venda(venda)
        totais_por_vendedor[venda.vendedor_id] = atual

    comissoes = [
        ComissaoVendedor(
            vendedor_id=vendedor_id,
            vendedor_nome=dados["vendedor_nome"],
            total_vendas=dados["total_vendas"],
            total_comissao=arredondar_valor_monetario(dados["total_comissao"]),
        )
        for vendedor_id, dados in totais_por_vendedor.items()
    ]

    return sorted(comissoes, key=lambda comissao: comissao.vendedor_nome)


def obter_percentual_comissao_aplicado(data_hora, percentual_produto):
    dia_semana = obter_dia_semana(data_hora)
    regra = RegraComissao.objects.filter(dia_semana=dia_semana).first()

    if regra is None:
        return percentual_produto

    return min(max(percentual_produto, regra.percentual_minimo), regra.percentual_maximo)


def obter_dia_semana(valor):
    if isinstance(valor, datetime):
        return valor.weekday()

    return valor


def arredondar_valor_monetario(valor):
    return valor.quantize(PRECISAO_MONETARIA, rounding=ROUND_HALF_UP)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import RegraComissao, Venda
from .serializers import (
    ComissaoVendedorSerializer,
    FiltroComissaoSerializer,
    RegraComissaoSerializer,
    VendaSerializer,
)
from .services import listar_comissoes_vendedores


class RegraComissaoViewSet(ModelViewSet):
    queryset = RegraComissao.objects.all()
    serializer_class = RegraComissaoSerializer


class VendaViewSet(ModelViewSet):
    queryset = (
        Venda.objects.select_related("cliente", "vendedor")
        .prefetch_related("itens__produto")
        .all()
    )
    serializer_class = VendaSerializer


@api_view(["GET"])
def listar_comissoes(request):
    filtros = FiltroComissaoSerializer(data=request.query_params)
    filtros.is_valid(raise_exception=True)

    comissoes = listar_comissoes_vendedores(
        data_inicio=filtros.validated_data["data_inicio"],
        data_fim=filtros.validated_data["data_fim"],
    )
    serializer = ComissaoVendedorSerializer(comissoes, many=True)
    total_geral = sum((item.total_comissao for item in comissoes), 0)

    return Response(
        {
            "resultados": serializer.data,
            "total_geral": total_geral,
        }
    )

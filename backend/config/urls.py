from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from pessoas.views import ClienteViewSet, VendedorViewSet
from produtos.views import ProdutoViewSet
from vendas.views import RegraComissaoViewSet, VendaViewSet, listar_comissoes
from .views import verificar_saude

router = DefaultRouter()
router.register("produtos", ProdutoViewSet, basename="produto")
router.register("clientes", ClienteViewSet, basename="cliente")
router.register("vendedores", VendedorViewSet, basename="vendedor")
router.register("regras-comissao", RegraComissaoViewSet, basename="regra-comissao")
router.register("vendas", VendaViewSet, basename="venda")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/saude/", verificar_saude, name="verificar-saude"),
    path("api/comissoes/", listar_comissoes, name="listar-comissoes"),
    path("api/", include(router.urls)),
]

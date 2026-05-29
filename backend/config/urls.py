from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
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
    # Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    
    path("api/saude/", verificar_saude, name="verificar-saude"),
    path("api/comissoes/", listar_comissoes, name="listar-comissoes"),
    path("api/", include(router.urls)),
]

from django.contrib import admin

from .models import Produto


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ("codigo", "descricao", "valor_unitario", "percentual_comissao")
    search_fields = ("codigo", "descricao")
    ordering = ("descricao",)

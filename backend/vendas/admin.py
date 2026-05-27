from django.contrib import admin

from .models import ItemVenda, RegraComissao, Venda


@admin.register(RegraComissao)
class RegraComissaoAdmin(admin.ModelAdmin):
    list_display = ("dia_semana", "percentual_minimo", "percentual_maximo")
    ordering = ("dia_semana",)


class ItemVendaInline(admin.TabularInline):
    model = ItemVenda
    extra = 1
    readonly_fields = ("valor_unitario", "percentual_comissao")


@admin.register(Venda)
class VendaAdmin(admin.ModelAdmin):
    inlines = [ItemVendaInline]
    list_display = (
        "numero_nota_fiscal",
        "data_hora",
        "cliente",
        "vendedor",
        "valor_total",
    )
    list_filter = ("data_hora", "vendedor")
    search_fields = (
        "numero_nota_fiscal",
        "cliente__nome",
        "vendedor__nome",
    )
    ordering = ("-data_hora", "numero_nota_fiscal")

from django.contrib import admin

from .models import Cliente, Vendedor


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("nome", "email", "telefone")
    search_fields = ("nome", "email", "telefone")
    ordering = ("nome",)


@admin.register(Vendedor)
class VendedorAdmin(admin.ModelAdmin):
    list_display = ("nome", "email", "telefone")
    search_fields = ("nome", "email", "telefone")
    ordering = ("nome",)

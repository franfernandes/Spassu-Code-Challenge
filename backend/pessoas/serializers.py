from rest_framework import serializers

from .models import Cliente, Vendedor


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            "id",
            "nome",
            "email",
            "telefone",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = ["id", "criado_em", "atualizado_em"]


class VendedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendedor
        fields = [
            "id",
            "nome",
            "email",
            "telefone",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = ["id", "criado_em", "atualizado_em"]

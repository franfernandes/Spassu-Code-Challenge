from rest_framework import serializers

from .models import Produto


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = [
            "id",
            "codigo",
            "descricao",
            "valor_unitario",
            "percentual_comissao",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = ["id", "criado_em", "atualizado_em"]

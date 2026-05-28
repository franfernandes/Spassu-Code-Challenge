from rest_framework import serializers

from .models import ItemVenda, RegraComissao, Venda
from .services import calcular_comissao_item, obter_percentual_comissao_aplicado


class RegraComissaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegraComissao
        fields = [
            "id",
            "dia_semana",
            "percentual_minimo",
            "percentual_maximo",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = ["id", "criado_em", "atualizado_em"]


class ItemVendaSerializer(serializers.ModelSerializer):
    produto_codigo = serializers.CharField(source="produto.codigo", read_only=True)
    produto_descricao = serializers.CharField(source="produto.descricao", read_only=True)
    percentual_comissao_aplicado = serializers.SerializerMethodField()
    valor_comissao = serializers.SerializerMethodField()
    valor_total = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = ItemVenda
        fields = [
            "id",
            "produto",
            "produto_codigo",
            "produto_descricao",
            "quantidade",
            "valor_unitario",
            "percentual_comissao",
            "percentual_comissao_aplicado",
            "valor_total",
            "valor_comissao",
        ]
        read_only_fields = [
            "id",
            "valor_unitario",
            "percentual_comissao",
            "percentual_comissao_aplicado",
            "valor_total",
            "valor_comissao",
        ]

    def get_percentual_comissao_aplicado(self, obj):
        percentual = obter_percentual_comissao_aplicado(
            data_hora=obj.venda.data_hora,
            percentual_produto=obj.percentual_comissao,
        )

        return f"{percentual:.2f}"

    def get_valor_comissao(self, obj):
        return f"{calcular_comissao_item(obj):.2f}"


class VendaSerializer(serializers.ModelSerializer):
    itens = ItemVendaSerializer(many=True)
    cliente_nome = serializers.CharField(source="cliente.nome", read_only=True)
    vendedor_nome = serializers.CharField(source="vendedor.nome", read_only=True)
    valor_total = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Venda
        fields = [
            "id",
            "numero_nota_fiscal",
            "data_hora",
            "cliente",
            "cliente_nome",
            "vendedor",
            "vendedor_nome",
            "itens",
            "valor_total",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = ["id", "valor_total", "criado_em", "atualizado_em"]

    def validate_itens(self, value):
        if not value:
            raise serializers.ValidationError("Informe ao menos um item para a venda.")
        return value

    def create(self, validated_data):
        itens_data = validated_data.pop("itens")
        venda = Venda.objects.create(**validated_data)
        self.criar_itens(venda, itens_data)
        return venda

    def update(self, instance, validated_data):
        itens_data = validated_data.pop("itens", None)

        for atributo, valor in validated_data.items():
            setattr(instance, atributo, valor)
        instance.save()

        if itens_data is not None:
            instance.itens.all().delete()
            self.criar_itens(instance, itens_data)

        return instance

    def criar_itens(self, venda, itens_data):
        for item_data in itens_data:
            ItemVenda.objects.create(venda=venda, **item_data)


class ComissaoVendedorSerializer(serializers.Serializer):
    vendedor_id = serializers.IntegerField()
    vendedor_nome = serializers.CharField()
    total_vendas = serializers.IntegerField()
    total_comissao = serializers.DecimalField(max_digits=12, decimal_places=2)


class FiltroComissaoSerializer(serializers.Serializer):
    data_inicio = serializers.DateField()
    data_fim = serializers.DateField()

    def validate(self, attrs):
        if attrs["data_inicio"] > attrs["data_fim"]:
            raise serializers.ValidationError(
                "data_inicio nao pode ser maior que data_fim."
            )

        return attrs

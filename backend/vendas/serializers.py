from rest_framework import serializers

from .models import ItemVenda, RegraComissao, Venda


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
            "quantidade",
            "valor_unitario",
            "percentual_comissao",
            "valor_total",
        ]
        read_only_fields = ["id", "valor_unitario", "percentual_comissao", "valor_total"]


class VendaSerializer(serializers.ModelSerializer):
    itens = ItemVendaSerializer(many=True)
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
            "vendedor",
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

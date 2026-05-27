from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from pessoas.models import Cliente, Vendedor
from produtos.models import Produto


class RegraComissao(models.Model):
    class DiaSemana(models.IntegerChoices):
        SEGUNDA = 0, "Segunda-feira"
        TERCA = 1, "Terca-feira"
        QUARTA = 2, "Quarta-feira"
        QUINTA = 3, "Quinta-feira"
        SEXTA = 4, "Sexta-feira"
        SABADO = 5, "Sabado"
        DOMINGO = 6, "Domingo"

    dia_semana = models.PositiveSmallIntegerField(
        choices=DiaSemana.choices,
        unique=True,
    )
    percentual_minimo = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00")),
            MaxValueValidator(Decimal("10.00")),
        ],
    )
    percentual_maximo = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00")),
            MaxValueValidator(Decimal("10.00")),
        ],
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["dia_semana"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(percentual_minimo__lte=models.F("percentual_maximo")),
                name="regra_comissao_minimo_menor_igual_maximo",
            ),
        ]

    def __str__(self):
        return (
            f"{self.get_dia_semana_display()}: "
            f"{self.percentual_minimo}% - {self.percentual_maximo}%"
        )


class Venda(models.Model):
    numero_nota_fiscal = models.CharField(max_length=50, unique=True)
    data_hora = models.DateTimeField()
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name="vendas")
    vendedor = models.ForeignKey(
        Vendedor,
        on_delete=models.PROTECT,
        related_name="vendas",
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-data_hora", "numero_nota_fiscal"]

    @property
    def valor_total(self):
        return sum((item.valor_total for item in self.itens.all()), Decimal("0.00"))

    def __str__(self):
        return self.numero_nota_fiscal


class ItemVenda(models.Model):
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE, related_name="itens")
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name="itens_venda",
    )
    quantidade = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    valor_unitario = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    percentual_comissao = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        editable=False,
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    @property
    def valor_total(self):
        return self.quantidade * self.valor_unitario

    def save(self, *args, **kwargs):
        if not self.valor_unitario:
            self.valor_unitario = self.produto.valor_unitario
        if not self.percentual_comissao:
            self.percentual_comissao = self.produto.percentual_comissao
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantidade} x {self.produto}"

from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Produto(models.Model):
    codigo = models.CharField(max_length=30, unique=True)
    descricao = models.CharField(max_length=255)
    valor_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    percentual_comissao = models.DecimalField(
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
        ordering = ["descricao"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(valor_unitario__gt=0),
                name="produto_valor_unitario_positivo",
            ),
            models.CheckConstraint(
                condition=models.Q(percentual_comissao__gte=0)
                & models.Q(percentual_comissao__lte=10),
                name="produto_percentual_comissao_intervalo",
            ),
        ]

    def __str__(self):
        return f"{self.codigo} - {self.descricao}"

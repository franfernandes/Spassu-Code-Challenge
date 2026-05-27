from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase

from .models import Produto


class ProdutoModelTests(TestCase):
    def test_representacao_textual_usa_codigo_e_descricao(self):
        produto = Produto.objects.create(
            codigo="CAN-001",
            descricao="Caneta azul",
            valor_unitario=Decimal("2.50"),
            percentual_comissao=Decimal("5.00"),
        )

        self.assertEqual(str(produto), "CAN-001 - Caneta azul")

    def test_percentual_comissao_nao_pode_ser_maior_que_dez(self):
        produto = Produto(
            codigo="CAN-002",
            descricao="Caneta vermelha",
            valor_unitario=Decimal("2.50"),
            percentual_comissao=Decimal("10.01"),
        )

        with self.assertRaises(ValidationError):
            produto.full_clean()

    def test_valor_unitario_deve_ser_positivo(self):
        produto = Produto(
            codigo="CAN-003",
            descricao="Caneta preta",
            valor_unitario=Decimal("0.00"),
            percentual_comissao=Decimal("5.00"),
        )

        with self.assertRaises(ValidationError):
            produto.full_clean()

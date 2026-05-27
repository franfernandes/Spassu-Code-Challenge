from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

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


class ProdutoApiTests(APITestCase):
    def test_cria_produto(self):
        response = self.client.post(
            "/api/produtos/",
            {
                "codigo": "LAP-001",
                "descricao": "Lapiseira",
                "valor_unitario": "12.90",
                "percentual_comissao": "6.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Produto.objects.count(), 1)
        self.assertEqual(response.data["codigo"], "LAP-001")

    def test_lista_produtos(self):
        Produto.objects.create(
            codigo="BOR-001",
            descricao="Borracha",
            valor_unitario=Decimal("3.00"),
            percentual_comissao=Decimal("2.00"),
        )

        response = self.client.get("/api/produtos/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["codigo"], "BOR-001")

    def test_valor_unitario_deve_ser_positivo(self):
        produto = Produto(
            codigo="CAN-003",
            descricao="Caneta preta",
            valor_unitario=Decimal("0.00"),
            percentual_comissao=Decimal("5.00"),
        )

        with self.assertRaises(ValidationError):
            produto.full_clean()

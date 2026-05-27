from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Cliente, Vendedor


class ClienteModelTests(TestCase):
    def test_representacao_textual_usa_nome(self):
        cliente = Cliente.objects.create(
            nome="Maria Cliente",
            email="maria.cliente@example.com",
            telefone="11999990000",
        )

        self.assertEqual(str(cliente), "Maria Cliente")


class VendedorModelTests(TestCase):
    def test_representacao_textual_usa_nome(self):
        vendedor = Vendedor.objects.create(
            nome="Joao Vendedor",
            email="joao.vendedor@example.com",
            telefone="11888880000",
        )

        self.assertEqual(str(vendedor), "Joao Vendedor")


class ClienteApiTests(APITestCase):
    def test_cria_cliente(self):
        response = self.client.post(
            "/api/clientes/",
            {
                "nome": "Cliente API",
                "email": "cliente.api@example.com",
                "telefone": "11999990000",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Cliente.objects.count(), 1)
        self.assertEqual(response.data["nome"], "Cliente API")


class VendedorApiTests(APITestCase):
    def test_cria_vendedor(self):
        response = self.client.post(
            "/api/vendedores/",
            {
                "nome": "Vendedor API",
                "email": "vendedor.api@example.com",
                "telefone": "11888880000",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Vendedor.objects.count(), 1)
        self.assertEqual(response.data["nome"], "Vendedor API")

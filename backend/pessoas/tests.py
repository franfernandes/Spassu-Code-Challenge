from django.test import TestCase

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

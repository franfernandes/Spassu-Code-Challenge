from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from pessoas.models import Cliente, Vendedor
from produtos.models import Produto

from .models import ItemVenda, RegraComissao, Venda


class VendaModelTests(TestCase):
    def test_valor_total_soma_itens_da_venda(self):
        cliente = Cliente.objects.create(
            nome="Maria Cliente",
            email="maria.venda@example.com",
            telefone="11999990000",
        )
        vendedor = Vendedor.objects.create(
            nome="Joao Vendedor",
            email="joao.venda@example.com",
            telefone="11888880000",
        )
        produto = Produto.objects.create(
            codigo="CAN-001",
            descricao="Caneta azul",
            valor_unitario=Decimal("2.50"),
            percentual_comissao=Decimal("5.00"),
        )
        venda = Venda.objects.create(
            numero_nota_fiscal="NF-001",
            data_hora=timezone.now(),
            cliente=cliente,
            vendedor=vendedor,
        )

        ItemVenda.objects.create(venda=venda, produto=produto, quantidade=4)

        self.assertEqual(venda.valor_total, Decimal("10.00"))

    def test_item_venda_mantem_snapshot_do_produto(self):
        cliente = Cliente.objects.create(
            nome="Ana Cliente",
            email="ana.venda@example.com",
            telefone="11777770000",
        )
        vendedor = Vendedor.objects.create(
            nome="Bia Vendedora",
            email="bia.venda@example.com",
            telefone="11666660000",
        )
        produto = Produto.objects.create(
            codigo="CAD-001",
            descricao="Caderno",
            valor_unitario=Decimal("15.90"),
            percentual_comissao=Decimal("4.00"),
        )
        venda = Venda.objects.create(
            numero_nota_fiscal="NF-002",
            data_hora=timezone.now(),
            cliente=cliente,
            vendedor=vendedor,
        )

        item = ItemVenda.objects.create(venda=venda, produto=produto, quantidade=2)
        produto.valor_unitario = Decimal("20.00")
        produto.percentual_comissao = Decimal("8.00")
        produto.save()
        item.refresh_from_db()

        self.assertEqual(item.valor_unitario, Decimal("15.90"))
        self.assertEqual(item.percentual_comissao, Decimal("4.00"))


class RegraComissaoModelTests(TestCase):
    def test_percentual_minimo_nao_pode_ser_maior_que_maximo(self):
        regra = RegraComissao(
            dia_semana=RegraComissao.DiaSemana.SEGUNDA,
            percentual_minimo=Decimal("6.00"),
            percentual_maximo=Decimal("5.00"),
        )

        with self.assertRaises(ValidationError):
            regra.full_clean()

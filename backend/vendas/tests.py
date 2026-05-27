from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from pessoas.models import Cliente, Vendedor
from produtos.models import Produto

from .models import ItemVenda, RegraComissao, Venda
from .services import calcular_comissao_item, listar_comissoes_vendedores


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


class ServicoComissaoTests(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(
            nome="Cliente Padrao",
            email="cliente.servico@example.com",
            telefone="11999990000",
        )
        self.vendedor = Vendedor.objects.create(
            nome="Vendedor Padrao",
            email="vendedor.servico@example.com",
            telefone="11888880000",
        )

    def test_comissao_item_usa_percentual_do_produto_sem_regra_no_dia(self):
        item = self.criar_item_venda(
            valor_unitario=Decimal("100.00"),
            percentual_produto=Decimal("4.00"),
        )

        comissao = calcular_comissao_item(item)

        self.assertEqual(comissao, Decimal("4.00"))

    def test_comissao_item_aplica_percentual_minimo_do_dia(self):
        RegraComissao.objects.create(
            dia_semana=RegraComissao.DiaSemana.SEGUNDA,
            percentual_minimo=Decimal("3.00"),
            percentual_maximo=Decimal("5.00"),
        )
        item = self.criar_item_venda(
            valor_unitario=Decimal("100.00"),
            percentual_produto=Decimal("2.00"),
        )

        comissao = calcular_comissao_item(item)

        self.assertEqual(comissao, Decimal("3.00"))

    def test_comissao_item_aplica_percentual_maximo_do_dia(self):
        RegraComissao.objects.create(
            dia_semana=RegraComissao.DiaSemana.SEGUNDA,
            percentual_minimo=Decimal("3.00"),
            percentual_maximo=Decimal("5.00"),
        )
        item = self.criar_item_venda(
            valor_unitario=Decimal("100.00"),
            percentual_produto=Decimal("10.00"),
        )

        comissao = calcular_comissao_item(item)

        self.assertEqual(comissao, Decimal("5.00"))

    def test_relatorio_soma_comissoes_por_vendedor_no_periodo(self):
        outro_vendedor = Vendedor.objects.create(
            nome="Outro Vendedor",
            email="outro.vendedor@example.com",
            telefone="11777770000",
        )
        self.criar_item_venda(
            numero_nota_fiscal="NF-100",
            valor_unitario=Decimal("100.00"),
            percentual_produto=Decimal("5.00"),
            quantidade=2,
            vendedor=self.vendedor,
        )
        self.criar_item_venda(
            numero_nota_fiscal="NF-101",
            valor_unitario=Decimal("50.00"),
            percentual_produto=Decimal("4.00"),
            quantidade=1,
            vendedor=outro_vendedor,
        )

        relatorio = listar_comissoes_vendedores(
            data_inicio=timezone.datetime(2026, 6, 1).date(),
            data_fim=timezone.datetime(2026, 6, 1).date(),
        )

        totais = {item.vendedor_nome: item.total_comissao for item in relatorio}
        self.assertEqual(totais["Vendedor Padrao"], Decimal("10.00"))
        self.assertEqual(totais["Outro Vendedor"], Decimal("2.00"))

    def criar_item_venda(
        self,
        valor_unitario,
        percentual_produto,
        quantidade=1,
        numero_nota_fiscal="NF-SERVICO",
        vendedor=None,
    ):
        produto = Produto.objects.create(
            codigo=numero_nota_fiscal,
            descricao=f"Produto {numero_nota_fiscal}",
            valor_unitario=valor_unitario,
            percentual_comissao=percentual_produto,
        )
        venda = Venda.objects.create(
            numero_nota_fiscal=numero_nota_fiscal,
            data_hora=timezone.make_aware(timezone.datetime(2026, 6, 1, 10, 0)),
            cliente=self.cliente,
            vendedor=vendedor or self.vendedor,
        )

        return ItemVenda.objects.create(
            venda=venda,
            produto=produto,
            quantidade=quantidade,
        )


class VendaApiTests(APITestCase):
    def test_cria_venda_com_itens(self):
        cliente = Cliente.objects.create(
            nome="Cliente API",
            email="cliente.venda.api@example.com",
            telefone="11999990000",
        )
        vendedor = Vendedor.objects.create(
            nome="Vendedor API",
            email="vendedor.venda.api@example.com",
            telefone="11888880000",
        )
        produto = Produto.objects.create(
            codigo="PAP-001",
            descricao="Papel sulfite",
            valor_unitario=Decimal("25.00"),
            percentual_comissao=Decimal("5.00"),
        )

        response = self.client.post(
            "/api/vendas/",
            {
                "numero_nota_fiscal": "NF-API-001",
                "data_hora": "2026-06-01T10:00:00-03:00",
                "cliente": cliente.id,
                "vendedor": vendedor.id,
                "itens": [
                    {
                        "produto": produto.id,
                        "quantidade": 2,
                    }
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        venda = Venda.objects.get(numero_nota_fiscal="NF-API-001")
        self.assertEqual(venda.itens.count(), 1)
        self.assertEqual(response.data["valor_total"], "50.00")

    def test_nao_cria_venda_sem_itens(self):
        cliente = Cliente.objects.create(
            nome="Cliente Sem Item",
            email="cliente.sem.item@example.com",
            telefone="11999990000",
        )
        vendedor = Vendedor.objects.create(
            nome="Vendedor Sem Item",
            email="vendedor.sem.item@example.com",
            telefone="11888880000",
        )

        response = self.client.post(
            "/api/vendas/",
            {
                "numero_nota_fiscal": "NF-SEM-ITEM",
                "data_hora": "2026-06-01T10:00:00-03:00",
                "cliente": cliente.id,
                "vendedor": vendedor.id,
                "itens": [],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("itens", response.data)

    def test_cria_regra_comissao(self):
        response = self.client.post(
            "/api/regras-comissao/",
            {
                "dia_semana": RegraComissao.DiaSemana.SEGUNDA,
                "percentual_minimo": "3.00",
                "percentual_maximo": "5.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(RegraComissao.objects.count(), 1)

    def test_lista_comissoes_por_periodo(self):
        cliente = Cliente.objects.create(
            nome="Cliente Comissao API",
            email="cliente.comissao.api@example.com",
            telefone="11999990000",
        )
        vendedor = Vendedor.objects.create(
            nome="Vendedor Comissao API",
            email="vendedor.comissao.api@example.com",
            telefone="11888880000",
        )
        produto = Produto.objects.create(
            codigo="COM-001",
            descricao="Produto comissao",
            valor_unitario=Decimal("100.00"),
            percentual_comissao=Decimal("5.00"),
        )
        venda = Venda.objects.create(
            numero_nota_fiscal="NF-COM-001",
            data_hora=timezone.make_aware(timezone.datetime(2026, 6, 1, 10, 0)),
            cliente=cliente,
            vendedor=vendedor,
        )
        ItemVenda.objects.create(venda=venda, produto=produto, quantidade=2)

        response = self.client.get(
            "/api/comissoes/",
            {
                "data_inicio": "2026-06-01",
                "data_fim": "2026-06-30",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_geral"], Decimal("10.00"))
        self.assertEqual(response.data["resultados"][0]["vendedor_nome"], vendedor.nome)
        self.assertEqual(response.data["resultados"][0]["total_comissao"], "10.00")

    def test_lista_comissoes_exige_periodo(self):
        response = self.client.get("/api/comissoes/")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("data_inicio", response.data)
        self.assertIn("data_fim", response.data)

    def test_lista_comissoes_rejeita_periodo_invalido(self):
        response = self.client.get(
            "/api/comissoes/",
            {
                "data_inicio": "2026-06-30",
                "data_fim": "2026-06-01",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)

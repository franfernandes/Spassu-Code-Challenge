from django.db import models


class DadosContato(models.Model):
    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=20)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Cliente(DadosContato):
    class Meta:
        ordering = ["nome"]
        verbose_name = "cliente"
        verbose_name_plural = "clientes"


class Vendedor(DadosContato):
    class Meta:
        ordering = ["nome"]
        verbose_name = "vendedor"
        verbose_name_plural = "vendedores"

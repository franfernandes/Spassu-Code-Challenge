from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vendas', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='itemvenda',
            options={'ordering': ['id'], 'verbose_name': 'item da venda', 'verbose_name_plural': 'itens da venda'},
        ),
        migrations.AlterModelOptions(
            name='regracomissao',
            options={'ordering': ['dia_semana'], 'verbose_name': 'regra de comissao', 'verbose_name_plural': 'regras de comissao'},
        ),
        migrations.AlterModelOptions(
            name='venda',
            options={'ordering': ['-data_hora', 'numero_nota_fiscal'], 'verbose_name': 'venda', 'verbose_name_plural': 'vendas'},
        ),
    ]

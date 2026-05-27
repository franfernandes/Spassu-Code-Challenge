import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('pessoas', '0001_initial'),
        ('produtos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='RegraComissao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dia_semana', models.PositiveSmallIntegerField(choices=[(0, 'Segunda-feira'), (1, 'Terca-feira'), (2, 'Quarta-feira'), (3, 'Quinta-feira'), (4, 'Sexta-feira'), (5, 'Sabado'), (6, 'Domingo')], unique=True)),
                ('percentual_minimo', models.DecimalField(decimal_places=2, max_digits=5, validators=[django.core.validators.MinValueValidator(Decimal('0.00')), django.core.validators.MaxValueValidator(Decimal('10.00'))])),
                ('percentual_maximo', models.DecimalField(decimal_places=2, max_digits=5, validators=[django.core.validators.MinValueValidator(Decimal('0.00')), django.core.validators.MaxValueValidator(Decimal('10.00'))])),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('atualizado_em', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['dia_semana'],
                'constraints': [models.CheckConstraint(condition=models.Q(('percentual_minimo__lte', models.F('percentual_maximo'))), name='regra_comissao_minimo_menor_igual_maximo')],
            },
        ),
        migrations.CreateModel(
            name='Venda',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero_nota_fiscal', models.CharField(max_length=50, unique=True)),
                ('data_hora', models.DateTimeField()),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('atualizado_em', models.DateTimeField(auto_now=True)),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='vendas', to='pessoas.cliente')),
                ('vendedor', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='vendas', to='pessoas.vendedor')),
            ],
            options={
                'ordering': ['-data_hora', 'numero_nota_fiscal'],
            },
        ),
        migrations.CreateModel(
            name='ItemVenda',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantidade', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('valor_unitario', models.DecimalField(decimal_places=2, editable=False, max_digits=10)),
                ('percentual_comissao', models.DecimalField(decimal_places=2, editable=False, max_digits=5)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('atualizado_em', models.DateTimeField(auto_now=True)),
                ('produto', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='itens_venda', to='produtos.produto')),
                ('venda', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='itens', to='vendas.venda')),
            ],
            options={
                'ordering': ['id'],
            },
        ),
    ]

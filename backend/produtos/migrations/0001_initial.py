import django.core.validators
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Produto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codigo', models.CharField(max_length=30, unique=True)),
                ('descricao', models.CharField(max_length=255)),
                ('valor_unitario', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))])),
                ('percentual_comissao', models.DecimalField(decimal_places=2, max_digits=5, validators=[django.core.validators.MinValueValidator(Decimal('0.00')), django.core.validators.MaxValueValidator(Decimal('10.00'))])),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('atualizado_em', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['descricao'],
                'constraints': [models.CheckConstraint(condition=models.Q(('valor_unitario__gt', 0)), name='produto_valor_unitario_positivo'), models.CheckConstraint(condition=models.Q(('percentual_comissao__gte', 0), ('percentual_comissao__lte', 10)), name='produto_percentual_comissao_intervalo')],
            },
        ),
    ]

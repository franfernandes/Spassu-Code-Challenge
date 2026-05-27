from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pessoas', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='cliente',
            options={'ordering': ['nome'], 'verbose_name': 'cliente', 'verbose_name_plural': 'clientes'},
        ),
        migrations.AlterModelOptions(
            name='vendedor',
            options={'ordering': ['nome'], 'verbose_name': 'vendedor', 'verbose_name_plural': 'vendedores'},
        ),
    ]

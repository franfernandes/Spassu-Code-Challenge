from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('produtos', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='produto',
            options={'ordering': ['descricao'], 'verbose_name': 'produto', 'verbose_name_plural': 'produtos'},
        ),
    ]

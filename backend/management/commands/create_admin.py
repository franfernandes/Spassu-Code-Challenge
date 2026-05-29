from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decouple import config


class Command(BaseCommand):
    help = 'Cria um superusuário administrador'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default=config('ADMIN_USERNAME', default='admin'),
            help='Nome de usuário do admin'
        )
        parser.add_argument(
            '--email',
            type=str,
            default=config('ADMIN_EMAIL', default='admin@example.com'),
            help='Email do admin'
        )
        parser.add_argument(
            '--password',
            type=str,
            default=config('ADMIN_PASSWORD', default=''),
            help='Senha do admin'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        if not password:
            self.stdout.write(
                self.style.ERROR('Erro: Senha não fornecida!')
            )
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'⚠️ Usuário "{username}" já existe!')
            )
            return

        User.objects.create_superuser(username, email, password)
        self.stdout.write(
            self.style.SUCCESS(f'✅ Superusuário "{username}" criado com sucesso!')
        )

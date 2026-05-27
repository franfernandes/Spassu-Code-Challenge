from rest_framework.viewsets import ModelViewSet

from .models import Cliente, Vendedor
from .serializers import ClienteSerializer, VendedorSerializer


class ClienteViewSet(ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class VendedorViewSet(ModelViewSet):
    queryset = Vendedor.objects.all()
    serializer_class = VendedorSerializer

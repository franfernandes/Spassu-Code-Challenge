from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers


@extend_schema(
    responses=inline_serializer(
        name="SaudeResponse",
        fields={"status": serializers.CharField()},
    ),
)
@api_view(["GET"])
def verificar_saude(request):
    return Response({"status": "ok"})

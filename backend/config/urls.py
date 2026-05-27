from django.contrib import admin
from django.urls import path

from .views import verificar_saude

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/saude/", verificar_saude, name="verificar-saude"),
]

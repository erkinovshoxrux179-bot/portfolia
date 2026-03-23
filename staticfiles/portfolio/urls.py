from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, admin_login, admin_logout, check_auth

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', admin_login, name='api-login'),
    path('auth/logout/', admin_logout, name='api-logout'),
    path('auth/check/', check_auth, name='api-check-auth'),
]

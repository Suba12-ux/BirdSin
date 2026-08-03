from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Админ-панель для управления пользователями."""

    ADDITIONAL_USER_FIELDS = (
        (
            None,
            {
                'fields': ('avatar',)
            }
        ),
    )
    fieldsets = BaseUserAdmin.fieldsets + ADDITIONAL_USER_FIELDS
    search_fields = ('username', 'email',)
    list_display = ('username', 'email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    ordering = ('username',)

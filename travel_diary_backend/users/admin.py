from django.contrib import admin
from .models import BaseUser, Citizen, Admin, Manager

class BaseUserAdmin(admin.ModelAdmin):
    # This makes the admin list view much cleaner and easier to read
    list_display = ('email', 'role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'role')
    ordering = ('-date_joined',)
    list_filter = ('role', 'is_active', 'is_staff')

    def save_model(self, request, obj, form, change):
        """
        Intercept the save process to ensure passwords are cryptographically hashed
        before they are committed to the PostgreSQL database.
        """
        # Scenario 1: Creating a brand new user
        if not obj.pk:
            obj.set_password(obj.password)
        
        # Scenario 2: Updating an existing user
        else:
            # Fetch the original user from the database to compare passwords
            orig_obj = BaseUser.objects.get(pk=obj.pk)
            # If the password in the form does not match the hashed password in the DB,
            # it means the admin typed a new raw password. We must hash it.
            if obj.password != orig_obj.password:
                obj.set_password(obj.password)
        
        # Proceed with the standard save operation
        super().save_model(request, obj, form, change)

# Register the models with the new custom admin panel
admin.site.register(BaseUser, BaseUserAdmin)
admin.site.register(Citizen)
admin.site.register(Admin)
admin.site.register(Manager)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Manager
from rest_framework import serializers

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Run the standard validation (checks email/password)
        data = super().validate(attrs)
        
        # Inject custom data into the final JSON response
        data['role'] = self.user.role
        data['email'] = self.user.email
        
        return data
    

class ManagerVerificationSerializer(serializers.ModelSerializer):
    # Flatten relational data from the linked BaseUser
    email = serializers.CharField(source='user.email', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)

    class Meta:
        model = Manager
        fields = ['id', 'email', 'company_name', 'is_verified', 'date_joined']
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Run the standard validation (checks email/password)
        data = super().validate(attrs)
        
        # Inject custom data into the final JSON response
        data['role'] = self.user.role
        data['email'] = self.user.email
        
        return data
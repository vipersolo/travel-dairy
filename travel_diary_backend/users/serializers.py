from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import Manager
from rest_framework import serializers
from .models import BaseUser, Citizen


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







class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=[('CITIZEN', 'Traveler'), ('MANAGER', 'Business Owner')])
    
    # Citizen specific fields
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    
    # MANAGER specific fields (Fixed to match your model!)
    company_name = serializers.CharField(required=False, allow_blank=True)
    business_registration_number = serializers.CharField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = BaseUser
        # Update the fields list to include the correct variables
        fields = (
            'email', 'password', 'role', 
            'first_name', 'last_name', 'phone_number', 
            'company_name', 'business_registration_number', 'contact_phone'
        )

    def validate(self, data):
        role = data.get('role')
        if role == 'CITIZEN':
            if not data.get('first_name') or not data.get('last_name'):
                raise serializers.ValidationError("First and last name are required for travelers.")
        
        elif role == 'MANAGER':
            # Enforce that all three required Manager fields are provided
            if not data.get('company_name') or not data.get('business_registration_number') or not data.get('contact_phone'):
                raise serializers.ValidationError("Company name, registration number, and contact phone are required for business accounts.")
                
            # Extra safety check: ensure the business_registration_number isn't already taken
            if Manager.objects.filter(business_registration_number=data.get('business_registration_number')).exists():
                raise serializers.ValidationError({"business_registration_number": "This registration number is already in use."})
                
        return data

    def create(self, validated_data):
        role = validated_data.get('role')
        
        # 1. Create the BaseUser securely
        user = BaseUser(
            email=validated_data['email'],
            role=role
        )
        user.set_password(validated_data['password']) 
        user.save()

        # 2. Create the associated profile
        if role == 'CITIZEN':
            Citizen.objects.create(
                user=user,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                phone_number=validated_data.get('phone_number', '')
            )
        elif role == 'MANAGER':
            Manager.objects.create(
                user=user,
                company_name=validated_data.get('company_name', ''),
                # Pass the correct fields to the database creation method
                business_registration_number=validated_data.get('business_registration_number', ''),
                contact_phone=validated_data.get('contact_phone', ''),
                is_verified=False 
            )

        return user
    

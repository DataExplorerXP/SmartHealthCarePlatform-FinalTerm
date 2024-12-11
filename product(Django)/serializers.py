#product/serializers.py
from rest_framework import serializers
from .models import *

class CertificationSerializer(serializers.ModelSerializer):
    is_usingID = serializers.BooleanField(write_only=True)  # 입력 전용 필드
    email=serializers.EmailField(required=False)
    userid=serializers.CharField(required=False)
    class Meta:
        model = Account
        fields = ["userid", "PWD", "email", "is_usingID"]
    def validate(self, data):
        """
            is_usingID에 따라 적절한 필드가 제공되었는지 확인
        """
        is_usingID = data.get("is_usingID", False)
        
        if is_usingID and not data.get("userid"):
            raise serializers.ValidationError({"userid": "User ID is required when is_usingID is True."})
        if not is_usingID and not data.get("email"):
            raise serializers.ValidationError({"email": "Email is required when is_usingID is False."})
        return data
class SignUpSerializer(serializers.ModelSerializer):
    class Meta :
        model = Account        # product 모델 사용
        fields = ["userid","PWD","email", "name"]
class ExerciseSerializer(serializers.ModelSerializer):
    userid = serializers.CharField(source="account.userid")
    class Meta :
        model = DailyRoutine
        fields = ["date","exercise","userid"]
class FoodSerializer(serializers.ModelSerializer):
    userid = serializers.CharField(source="account.userid")
    class Meta:
        model=DailyRoutine
        fields=["date","consumed_foods","userid"]
class FoodCompleteSerializer(serializers.ModelSerializer):
    userid = serializers.CharField(source="account.userid")
    class Meta:
        model=DailyRoutine
        fields=["date","food_complete","userid"]
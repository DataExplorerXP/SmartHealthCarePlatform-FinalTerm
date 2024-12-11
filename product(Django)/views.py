from django.contrib.auth.hashers import make_password, check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Account
from .serializers import *
import uuid
from datetime import datetime
import re
from django.core.exceptions import ObjectDoesNotExist
from urllib.parse import unquote

class LoginAPI(APIView):
    # def get(self, request):
    #     """
    #         디버깅
    #     """
    #     accounts = Account.objects.all()
    #     serializer = CertificationSerializer(accounts, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
            로그인
        """
        serializer = CertificationSerializer(data=request.data)
        if serializer.is_valid():
            account=get_certificated_account(serializer)
            if account:
                if check_password(serializer.validated_data["PWD"], account.PWD):
                    # Generate and update random_key
                    new_random_key = str(uuid.uuid4()).replace("-", "")[:30]
                    account.random_key = new_random_key
                    account.is_login = True
                    account.save()

                    return Response(
                        {"random_key": new_random_key,
                         "userid":account.userid,"email":account.email},
                        status=status.HTTP_200_OK
                    )
                return Response(status=status.HTTP_401_UNAUTHORIZED)
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        return Response(status=status.HTTP_400_BAD_REQUEST)
def is_valid_date(date_str):
    # YYYY-MM-DD 형식의 정규식
    pattern = r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$"
    return bool(re.match(pattern, date_str))
def convert_to_date_obj(date_str):
    return datetime.strptime(date_str, "%Y-%m-%d").date()
def validate_random_key(request):
    """
    Validates the random_key from the request headers.
    """

    random_key = request.headers.get("Random-Key")
    if request.data.get("is_usingID",True):
        userid = request.data.get("userid") or request.query_params.get("userid")
        if not userid or not random_key:
            return False
        account = Account.objects.filter(userid=userid).first()
    else:
        email=request.data.get("email") or request.query_params.get("email")
        if not email or not random_key:
            return False
        account=Account.objects.filter(email=email).first()
    if not account:
        return False

    return account.random_key == random_key
def get_certificated_account(serializer):
    if serializer.validated_data["is_usingID"]:
        account = Account.objects.filter(userid=serializer.validated_data["userid"]).first()
    else:
        account = Account.objects.filter(email=serializer.validated_data["email"]).first()
    return account

class AccountManageAPI(APIView):
    """
        아이디 존재 여부
    """
    def get(self, request):
        params = request.query_params
        userid = unquote(params.get("userid"))
        print(userid)
        if not userid:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if Account.objects.filter(userid=userid).exists():
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)
    def post(self, request):
        """
            회원가입
        """
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            userid = serializer.validated_data["userid"]
            email = serializer.validated_data["email"]
            if Account.objects.filter(userid=userid).exists():
                return Response(status=status.HTTP_403_FORBIDDEN)
            if Account.objects.filter(email=email).exists():
                return Response(status=status.HTTP_403_FORBIDDEN)
            hashed_pwd = make_password(serializer.validated_data["PWD"])
            name = serializer.validated_data["name"]
            Account(userid=userid, PWD=hashed_pwd, email=email,name=name).save()
            return Response({"userid": userid}, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request):
        """
            회원탈퇴
        """
        if not validate_random_key(request):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = CertificationSerializer(data=request.data)
        if serializer.is_valid():
            account = get_certificated_account(serializer)
            if account:
                if check_password(serializer.validated_data["PWD"], account.PWD):
                    account.delete()
                    return Response(status=status.HTTP_204_NO_CONTENT)
                return Response(status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    # def put(self,request):
    #     """
    #         회원 정보 수정
    #     """
def process_parameter(request):
    params = request.query_params
    userid = unquote(params.get("userid"))
    start_date = unquote(params.get("from"))
    end_date = unquote(params.get("to"))
    if not (is_valid_date(start_date) and is_valid_date(end_date)):
        raise ValueError("Invalid date format")

    start_date = convert_to_date_obj(start_date)
    end_date = convert_to_date_obj(end_date)

    if start_date > end_date:
        raise ValueError("Start date must be before end date")

    account = Account.objects.filter(userid=userid).first()
    if not account:
        raise ObjectDoesNotExist("Account not found")

    return DailyRoutine.objects.filter(account=account, date__range=(start_date, end_date))
def serialize_routines(routines, fields):
    return [
        {field: getattr(routine, field) for field in fields}
        for routine in routines
    ]

class FoodManageAPI(APIView): 
    def get(self, request):
        if not validate_random_key(request):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        try:
            routines = process_parameter(request)
        except ValueError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        routine_data = serialize_routines(routines, ["date", "total_calorie", "total_protein", "total_fat", "total_carbon_hydrate",
                                                     "total_sugar", "total_sodium","consumed_foods","food_complete"])
        return Response({"data": routine_data}, status=status.HTTP_200_OK)
    def post(self, request):
        """
            data 추가
        """
        # Random key validation
        if not validate_random_key(request):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        # Data validation with serializer
        serializer = FoodSerializer(data=request.data)
        if serializer.is_valid():
            print(serializer.validated_data)
            # Extract validated data
            date = serializer.validated_data["date"]
            consumed_foods:dict = serializer.validated_data["consumed_foods"]
            userid = serializer.validated_data["account"]["userid"]

            # Get Account instance
            try:
                account = Account.objects.get(userid=userid)
            except ObjectDoesNotExist:
                return Response(status=status.HTTP_401_UNAUTHORIZED)

            # Get or create DailyRoutine instance for the given date
            daily, created = DailyRoutine.objects.get_or_create(account=account, date=date)

            # Update consumed_foods JSON data
            daily_json: list = daily.consumed_foods
            daily_json.append(consumed_foods)  # Append new food entry
            index=len(daily_json)-1
            daily.consumed_foods = daily_json

            # Update nutritional values
            daily.total_calorie += consumed_foods.get("calorie", 0)
            daily.total_protein += consumed_foods.get("protein", 0)
            daily.total_fat += consumed_foods.get("fat", 0)
            daily.total_carbon_hydrate += consumed_foods.get("carbon_hydrate", 0)
            daily.total_sugar += consumed_foods.get("sugar", 0)
            daily.total_sodium += consumed_foods.get("sodium", 0)

            # Save the updated or new DailyRoutine instance
            daily.save()

            return Response({"date":date,"index":index},status=status.HTTP_201_CREATED)

        # If data is invalid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request):
        """
            data 삭제
        """
        # Validate random key
        if not validate_random_key(request):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        # Validate request data
        serializer = FoodSerializer(data=request.data)
        if serializer.is_valid():
            # Extract validated data
            date = serializer.validated_data["date"]
            consumed_foods:list = serializer.validated_data["consumed_foods"]
            userid = serializer.validated_data["account"]["userid"]
            print(serializer.validated_data)
            # Get Account instance
            try:
                account = Account.objects.get(userid=userid)
            except ObjectDoesNotExist:
                return Response(status=status.HTTP_401_UNAUTHORIZED)

            # Get DailyRoutine instance
            try:
                daily = DailyRoutine.objects.get(account=account, date=date)
            except ObjectDoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            # Modify consumed_foods JSON field
            daily_json: list = daily.consumed_foods
            keys_to_delete = consumed_foods
            if keys_to_delete:
                if (not isinstance(keys_to_delete,list) or max(keys_to_delete)>=len(daily_json) or min(keys_to_delete)<0 
                    or len(set(keys_to_delete))!=len(keys_to_delete) 
                    or not all(isinstance(x, int) for x in keys_to_delete)):
                    return Response({"valError":True},status=status.HTTP_400_BAD_REQUEST)
                changed=[None]*(len(daily_json)-len(consumed_foods))
                j=0
                # Remove specified keys from the JSON field
                for i in range(len(daily_json)):
                    if i in keys_to_delete:
                        food_data:dict = daily_json[i]
                        # 각 영양소 값을 확인하고 총합에서 차감
                        daily.total_calorie -= food_data.get("calorie", 0)
                        daily.total_protein -= food_data.get("protein", 0)
                        daily.total_fat -= food_data.get("fat", 0)
                        daily.total_carbon_hydrate -= food_data.get("carbon_hydrate", 0)
                        daily.total_sugar -= food_data.get("sugar", 0)
                        daily.total_sodium -= food_data.get("sodium", 0)
                    else:
                        changed[j]=daily_json[i]
                        j+=1

                # Update consumed_foods and save
                daily.consumed_foods = changed
            if len(daily.consumed_foods):
                daily.save()
            else:
                daily.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)

        # If data is invalid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self,request):
        if not validate_random_key(request):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer=FoodCompleteSerializer(data=request.data)
        if serializer.is_valid():
            # Extract validated data
            date = serializer.validated_data["date"]
            food_complete:bool = serializer.validated_data["food_complete"]
            userid = serializer.validated_data["account"]["userid"]
            print(serializer.validated_data)
            # Get Account instance
            try:
                account = Account.objects.get(userid=userid)
            except ObjectDoesNotExist:
                return Response(status=status.HTTP_401_UNAUTHORIZED)

            # Get DailyRoutine instance
            try:
                daily = DailyRoutine.objects.get(account=account, date=date)
            except ObjectDoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            daily.food_complete=food_complete
            daily.save()
            return Response(status=status.HTTP_200_OK)
            
class ExerciseManageAPI(APIView):
    def get(self, request):
        if not validate_random_key(request):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        try:
            routines = process_parameter(request)
        except ValueError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        routine_data = serialize_routines(routines, ["date", "exercise"])
        return Response({"data": routine_data}, status=status.HTTP_200_OK)
    def post(self, request):
        """
            운동 여부 정하기
        """
        # Random key validation
        if not validate_random_key(request):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        # Data validation with serializer
        serializer = ExerciseSerializer(data=request.data)
        if serializer.is_valid():
            # Extract validated data
            print(serializer.validated_data)
            date = serializer.validated_data["date"]
            exercise = serializer.validated_data["exercise"]
            userid = serializer.validated_data["account"]["userid"]

            # Get Account instance
            try:
                account = Account.objects.get(userid=userid)
            except ObjectDoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            # Get or create DailyRoutine instance for the given date
            daily, created = DailyRoutine.objects.get_or_create(account=account, date=date)
            daily.exercise=exercise
            daily.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)
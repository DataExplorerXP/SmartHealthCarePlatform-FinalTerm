from django.db import models
import uuid
# Create your models here.

class Account(models.Model):
    userid = models.CharField(max_length=150,unique=True)
    PWD = models.CharField(max_length=128)
    email = models.EmailField(max_length=254, unique=True)
    name = models.CharField(max_length=150)
    is_login = models.BooleanField(default=False)
    random_key = models.CharField(max_length=30,default=str(uuid.uuid4()).replace("-", "")[:30])
    # last_active = models.DateTimeField(auto_now=True)  # 마지막 요청 시간 자동 업데이트

    def __str__(self):
        return self.userid
class DailyRoutine(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="daily_routines")
    date=models.DateField()
    exercise=models.BooleanField(default=False)
    total_calorie=models.FloatField(default=0.0) # kcal
    total_protein=models.FloatField(default=0.0)
    total_fat=models.FloatField(default=0.0)
    total_carbon_hydrate=models.FloatField(default=0.0)
    total_sugar=models.FloatField(default=0.0)
    total_sodium=models.FloatField(default=0.0)
    consumed_foods=models.JSONField(default=list)
    food_complete=models.BooleanField(default=False)

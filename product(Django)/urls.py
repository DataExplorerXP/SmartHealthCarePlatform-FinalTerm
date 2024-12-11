from django.urls import path
from product.views import *

urlpatterns = [
    path('account/login/', LoginAPI.as_view()),
    path('account/manage/',AccountManageAPI.as_view()),
    path('food/manage/',FoodManageAPI.as_view()),
    path("exercise/manage/",ExerciseManageAPI.as_view())
]

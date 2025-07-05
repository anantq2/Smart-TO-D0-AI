from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()
from .models import Task, ContextEntry, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        extra_kwargs = {
            'title': {'required': False},
            'priority': {'required': False},
            'category': {'required': False},
            'status': {'required': False},
            'user': {'required': False},
        }
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()  # 👈 Add this
    )
    priority = serializers.ChoiceField(choices=Task.PRIORITY_CHOICES)


    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'category',
            'category_id',  # 👈 VERY IMPORTANT
            'deadline',
            'duration_minutes',
            'status',
            'user',
            'created_at'
        ]


class ContextEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContextEntry
        fields = '__all__'

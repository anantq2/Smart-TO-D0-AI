from django.urls import path
from .views import (
    TaskListCreateView,
    TaskRetrieveUpdateDestroyView,
    ContextListCreateView,
    CategoryListView,
    AISuggestionView,
    RegisterView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # POST /api/register/
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),  # ✅ GET, POST /api/tasks/
    path('tasks/<int:pk>/', TaskRetrieveUpdateDestroyView.as_view(), name='task-update'), # ✅ GET, PUT, DELETE /api/tasks/<id>/
    path('contexts/', ContextListCreateView.as_view(), name='context-list-create'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('ai-suggestions/', AISuggestionView.as_view(), name='ai-suggestions'),
]

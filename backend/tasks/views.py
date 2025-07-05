from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Task, ContextEntry, Category
from .serializers import TaskSerializer, ContextEntrySerializer, CategorySerializer

# ✅ /api/tasks/
class TaskListCreateView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            tasks = Task.objects.filter(user__id=user_id).order_by('-created_at')
        else:
            tasks = Task.objects.all().order_by('-created_at')

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        print("Incoming data:", request.data)  # 🟡 DEBUG line
        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)  # 🟠 This line helps debug
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ /api/contexts/
class ContextListCreateView(APIView):
    def get(self, request):
        contexts = ContextEntry.objects.all().order_by('-timestamp')
        serializer = ContextEntrySerializer(contexts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ContextEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ /api/categories/
class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

# ✅ /api/ai-suggestions/
class AISuggestionView(APIView):
    def post(self, request):
        title = request.data.get("title", "")
        description = request.data.get("description", "")

        ai_response = {
            "priority": "High",
            "suggested_deadline": "2025-07-10",
            "category": "Work",
            "enhanced_description": f"{description} (Don't forget to break it into subtasks)",
        }
        return Response(ai_response)

from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# ✅ /api/register/
class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        username = email  # ya user se alag bhi le sakta hai
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({'message': 'User registered successfully', 'id': user.id}, status=status.HTTP_201_CREATED)

from rest_framework import generics
from .models import Task
from .serializers import TaskSerializer

class TaskRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    lookup_field = 'pk'

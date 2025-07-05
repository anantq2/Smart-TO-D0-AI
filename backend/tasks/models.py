from django.db import models
from django.contrib.auth.models import User  # ✅ Yeh line zaroori hai

class Category(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#3B82F6")  # Optional: for UI color

    def __str__(self):
        return self.name

class Task(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
    ]

    PRIORITY_CHOICES = [
        ("Minimal", "Minimal"),
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
        ("Critical", "Critical"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="Medium")
    deadline = models.DateField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # ✅ Now it works

    def __str__(self):
        return self.title

class ContextEntry(models.Model):
    SOURCE_CHOICES = [
        ("WhatsApp", "WhatsApp"),
        ("Email", "Email"),
        ("Note", "Note"),
    ]

    content = models.TextField()
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source}: {self.content[:30]}"

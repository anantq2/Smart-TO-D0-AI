"use client";

import {
  getTasks,
  updateTask,
  createTask,
  getCategories,
  // Types import
  User,
  Task,
  ContextEntry,
  Category,
} from "@/lib/api";

import { useCallback, useEffect, useState } from "react";
import { AuthService } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  LogOut,
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import TaskForm from "./TaskForm";
import ContextForm from "./ContextForm";
import { AITaskService } from "@/lib/ai-service";
import { Input } from "@/components/ui/input";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contextEntries, setContextEntries] = useState<ContextEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showContextForm, setShowContextForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingAiSuggestions, setGeneratingAiSuggestions] = useState(false);

  // Function to generate AI suggestions
  const generateAiSuggestions = async () => {
    setGeneratingAiSuggestions(true);
    try {
      const suggestions = await AITaskService.generateTaskSuggestions(
        contextEntries.map(entry => ({
          ...entry,
          id: typeof entry.id === "string" ? Number(entry.id) : entry.id,
        }))
      );
      setAiSuggestions(suggestions);
      toast.success("AI suggestions generated!");
    } catch (error: any) {
      toast.error("Failed to generate AI suggestions: " + error.message);
    } finally {
      setGeneratingAiSuggestions(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const userTasks = await getTasks(Number(user.id));
      const allCategories = await getCategories();

      setTasks(userTasks);
      setCategories(allCategories);
    } catch (error: any) {
      toast.error("Failed to fetch data: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]); // user.id as dependency because it is used inside

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSignOut = async () => {
    await AuthService.signOut();
    toast.success("Signed out successfully");
  };



  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
  try {
    console.log("Updating task status...");
    if (!user || !user.id) {
      console.error("User not found");
      toast.error("User not found. Please login again.");
      return;
    }

    const existingTask = tasks.find((t) => t.id === Number(taskId));
    if (!existingTask) {
      console.error("Task not found with ID:", taskId);
      toast.error("Task not found.");
      return;
    }

    const capitalizeStatus = (
      s: string
    ): "Pending" | "In Progress" | "Completed" | undefined => {
      const lower = s.toLowerCase();
      if (lower === "pending") return "Pending";
      if (lower === "in_progress" || lower === "in progress") return "In Progress";
      if (lower === "completed") return "Completed";
      return undefined;
    };

    const updates: Partial<Task> = {
      title: existingTask.title,
      description: existingTask.description,
      priority: existingTask.priority,
      category_id:
        typeof existingTask.category === "object" && existingTask.category !== null
          ? (existingTask.category as { id: number }).id
          : existingTask.category_id,
      status: capitalizeStatus(status),
      user: typeof existingTask.user === "number" ? existingTask.user : Number(user.id),
      deadline: existingTask.deadline,
    };

    if (capitalizeStatus(status) === "Completed") {
      updates.completed_at = new Date().toISOString();
    }

    console.log("Final update payload:", updates);

    const updatedTask = await updateTask(Number(taskId), updates);

    console.log("Task successfully updated:", updatedTask);

    setTasks(tasks.map((task) => (task.id === Number(taskId) ? updatedTask : task)));
    toast.success(`Task marked as ${capitalizeStatus(status)}!`);
  } catch (error: any) {
    console.error("Update task failed:", error);
    toast.error("Failed to update task: " + error.message);
  }
};





  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    const matchesCategory =
  filterCategory === "all" ||
  (typeof task.category === 'object' && 'name' in task.category && (task.category as Category).name === filterCategory);

    const matchesSearch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5:
        return "bg-red-100 text-red-800 border-red-200";
      case 4:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5:
        return "Critical";
      case 4:
        return "High";
      case 3:
        return "Medium";
      case 2:
        return "Low";
      case 1:
        return "Minimal";
      default:
        return "Medium";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending" || t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress" || t.status === "In Progress").length,

    completed: tasks.filter((t) => t.status === "completed" || t.status === "Completed").length,

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  function createTaskFromSuggestion(suggestion: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Todo AI
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.email?.split("@")[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={generateAiSuggestions}
                disabled={generatingAiSuggestions}
                className="hidden sm:flex"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generatingAiSuggestions ? "Generating..." : "AI Suggestions"}
              </Button>
              <Button onClick={() => setShowTaskForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {taskStats.total}
              </div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {taskStats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {taskStats.inProgress}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {taskStats.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Task Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={getPriorityColor(suggestion.priority)}
                        >
                          {getPriorityLabel(suggestion.priority)}
                        </Badge>
                        <Badge variant="outline">{suggestion.category.name}</Badge>
                        <span className="text-xs text-gray-500">
                          {suggestion.reasoning}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createTaskFromSuggestion(suggestion)}
                      className="ml-4"
                    >
                      Add Task
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {/* Filters */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filterCategory}
                      onValueChange={setFilterCategory}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(task.status)}
                          <h3 className="font-semibold text-lg">
                            {task.title}
                          </h3>
                        </div>
                        {task.description && (
                          <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={getPriorityColor(Number(task.priority))}>
                            {getPriorityLabel(Number(task.priority))}
                          </Badge>
                          {task.category && (
                            <Badge variant="outline">
                              {typeof task.category === "object"
                                ? (task.category as Category)?.name
                                : task.category}
                            </Badge>
                          )}
                          {task.deadline && (
                            <Badge variant="outline">
                              Due:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </Badge>
                          )}
                          {task.estimated_duration && (
                            <Badge variant="outline">
                              {Math.floor(task.estimated_duration / 60)}h{" "}
                              {task.estimated_duration % 60}m
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {task.status !== "completed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateTaskStatus(
                                  String(task.id),
                                  task.status === "pending"
                                    ? "in_progress"
                                    : "pending"
                                )
                              }
                            >
                              {task.status === "pending" ? "Start" : "Pause"}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTaskStatus(String(task.id), "completed")
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Complete
                            </Button>
                          </>
                        )}
                        {task.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatus(String(task.id), "pending")}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTasks.length === 0 && (
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tasks found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery ||
                      filterStatus !== "all" ||
                      filterCategory !== "all"
                        ? "Try adjusting your filters or search query."
                        : "Get started by creating your first task!"}
                    </p>
                    {!searchQuery &&
                      filterStatus === "all" &&
                      filterCategory === "all" && (
                        <Button onClick={() => setShowTaskForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Task
                        </Button>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="context" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Context Entries
              </h2>
              <Button onClick={() => setShowContextForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Context
              </Button>
            </div>

            <div className="grid gap-4">
              {contextEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="bg-white/60 backdrop-blur-sm border-white/20"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="capitalize">
                        {entry.type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {entry.content}
                    </p>
                    {entry.source && (
                      <p className="text-sm text-gray-500 mt-2">
                        Source: {entry.source}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {contextEntries.length === 0 && (
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardContent className="p-12 text-center">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No context entries
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add emails, messages, or notes to help AI understand your
                      tasks better.
                    </p>
                    <Button onClick={() => setShowContextForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Context
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onTaskCreated={() => {
          fetchData();
          setShowTaskForm(false);
        }}
        user={user}
        categories={categories}
        contextEntries={contextEntries}
      />

      <ContextForm
        open={showContextForm}
        onOpenChange={setShowContextForm}
        onContextCreated={() => {
          fetchData();
          setShowContextForm(false);
        }}
        user={user}
      />
    </div>
  );
}

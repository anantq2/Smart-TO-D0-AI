"use client";

import { 
  createTask, 
  getTasks, 
  getCategories, 
  getContexts,
  // Types import
  User, 
  Category, 
  ContextEntry 
} from "@/lib/api";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Sparkles, Clock, Target, Brain } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AITaskService } from "@/lib/ai-service";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
  user: User;
  categories: Category[];
  contextEntries: ContextEntry[];
}

export default function TaskForm({
  open,
  onOpenChange,
  onTaskCreated,
  user,
  categories,
  contextEntries,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("3");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("3");
      setCategory("");
      setDeadline("");
      setAiAnalysis(null);
      setShowAiSuggestions(false);
    }
  }, [open]);

  const analyzeWithAI = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title first");
      return;
    }

    setAiAnalyzing(true);
    try {
      const analysis = await AITaskService.analyzeTask(
        title,
        description,
        contextEntries.slice(0, 5).map(entry => ({
          ...entry,
          id: typeof entry.id === "string" ? Number(entry.id) : entry.id,
        }))
      );
      setAiAnalysis(analysis);
      setShowAiSuggestions(true);
      toast.success("AI analysis complete!");
    } catch (error: any) {
      toast.error("AI analysis failed: " + error.message);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const applySuggestion = (type: string) => {
    if (!aiAnalysis) return;

    switch (type) {
      case "priority":
        setPriority(aiAnalysis.priority.score.toString());
        break;
      case "category":
        setCategory(aiAnalysis.category.suggested);
        break;
      case "deadline":
        if (aiAnalysis.deadline.suggested) {
          setDeadline(
            format(new Date(aiAnalysis.deadline.suggested), "yyyy-MM-dd")
          );
        }
        break;
      case "description":
        setDescription(aiAnalysis.enhancedDescription.description);
        break;
    }
    toast.success("Suggestion applied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority,
        category_id: Number(category) || undefined,
        deadline: deadline || undefined,
        duration_minutes: aiAnalysis?.estimatedDuration?.minutes || undefined,
        status: "Pending" as const,
        user: Number(user.id),
      };

      console.log("Payload being sent to backend:", payload);

      const newTask = await createTask(payload);
      console.log("New task created:", newTask);

      onTaskCreated();
      toast.success("Task created successfully!");
    } catch (error: any) {
      console.error("Task creation error:", error);
      toast.error("Failed to create task: " + error.message);
    } finally {
      setLoading(false);
    }
  };

const getPriorityLabel = (priority: number | string) => {
  if (typeof priority === 'string') return priority;
  switch (priority) {
    case 5: return "Critical";
    case 4: return "High";
    case 3: return "Medium";
    case 2: return "Low";
    case 1: return "Minimal";
    default: return "Medium";
  }
};

 const getPriorityColor = (priority: number | string) => {
  if (typeof priority === 'string') {
    switch (priority.toLowerCase()) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      case "minimal": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  // if numeric:
  switch (priority) {
    case 5: return "bg-red-100 text-red-800 border-red-200";
    case 4: return "bg-orange-100 text-orange-800 border-orange-200";
    case 3: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case 2: return "bg-blue-100 text-blue-800 border-blue-200";
    case 1: return "bg-green-100 text-green-800 border-green-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Add a new task and let AI help optimize it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <div className="flex gap-2">
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={analyzeWithAI}
                    disabled={!title.trim() || aiAnalyzing}
                    className="shrink-0"
                  >
                    {aiAnalyzing ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your task in detail..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                  <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minimal">Minimal</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {showAiSuggestions && aiAnalysis && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Suggestions
                  </h3>

                  <div className="grid gap-4">
                    {/* Priority Suggestion */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Priority</span>
                          <Badge
                            className={getPriorityColor(
                              aiAnalysis.priority.score.toString()
                            )}
                          >
                            {getPriorityLabel(
                              aiAnalysis.priority.score.toString()
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {aiAnalysis.priority.reasoning}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          Confidence:{" "}
                          {Math.round(aiAnalysis.priority.confidence * 100)}%
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion("priority")}
                        disabled={
                          priority === aiAnalysis.priority.score.toString()
                        }
                      >
                        {priority === aiAnalysis.priority.score.toString()
                          ? "Applied"
                          : "Apply"}
                      </Button>
                    </div>

                    {/* Category Suggestion */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Category</span>
                          <Badge variant="outline">
                            {aiAnalysis.category.suggested}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {aiAnalysis.category.reasoning}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          Confidence:{" "}
                          {Math.round(aiAnalysis.category.confidence * 100)}%
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion("category")}
                        disabled={category === aiAnalysis.category.suggested}
                      >
                        {category === aiAnalysis.category.suggested
                          ? "Applied"
                          : "Apply"}
                      </Button>
                    </div>

                    {/* Deadline Suggestion */}
                    {aiAnalysis.deadline.suggested && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Deadline</span>
                            <Badge variant="outline">
                              {format(
                                new Date(aiAnalysis.deadline.suggested),
                                "MMM d, yyyy"
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {aiAnalysis.deadline.reasoning}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            Confidence:{" "}
                            {Math.round(aiAnalysis.deadline.confidence * 100)}%
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => applySuggestion("deadline")}
                          disabled={
                            deadline ===
                            format(
                              new Date(aiAnalysis.deadline.suggested),
                              "yyyy-MM-dd"
                            )
                          }
                        >
                          {deadline ===
                          format(
                            new Date(aiAnalysis.deadline.suggested),
                            "yyyy-MM-dd"
                          )
                            ? "Applied"
                            : "Apply"}
                        </Button>
                      </div>
                    )}

                    {/* Enhanced Description */}
                    {aiAnalysis.enhancedDescription.description !==
                      description && (
                      <div className="flex items-start justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              Enhanced Description
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap mb-2">
                            {aiAnalysis.enhancedDescription.description}
                          </p>
                          <div className="text-xs text-gray-500">
                            Confidence:{" "}
                            {Math.round(
                              aiAnalysis.enhancedDescription.confidence * 100
                            )}
                            %
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => applySuggestion("description")}
                          disabled={
                            description ===
                            aiAnalysis.enhancedDescription.description
                          }
                          className="ml-4 shrink-0"
                        >
                          {description ===
                          aiAnalysis.enhancedDescription.description
                            ? "Applied"
                            : "Apply"}
                        </Button>
                      </div>
                    )}

                    {/* Additional Insights */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            Estimated Duration
                          </span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          {Math.floor(
                            aiAnalysis.estimatedDuration.minutes / 60
                          )}
                          h {aiAnalysis.estimatedDuration.minutes % 60}m
                        </p>
                        <p className="text-xs text-gray-500">
                          {aiAnalysis.estimatedDuration.reasoning}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            Complexity Score
                          </span>
                        </div>
                        <p className="text-lg font-bold text-purple-600">
                          {aiAnalysis.complexity.score}/10
                        </p>
                        <p className="text-xs text-gray-500">
                          {aiAnalysis.complexity.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !title.trim()}>
                {loading ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// // Local storage utilities for data persistence
// export interface Task {
//   id: string;
//   title: string;
//   description?: string;
//   status: 'pending' | 'in_progress' | 'completed';
//   priority: number;
//   category?: string;
//   deadline?: string;
//   estimated_duration?: number;
//   complexity_score?: number;
//   ai_enhanced_description?: string;
//   user_id: string;
//   created_at: string;
//   updated_at: string;
//   completed_at?: string;
// }

// export interface ContextEntry {
//   id: string;
//   content: string;
//   type: 'email' | 'message' | 'note' | 'document';
//   source?: string;
//   metadata: Record<string, any>;
//   user_id: string;
//   created_at: string;
// }

// export interface Category {
//   id: string;
//   name: string;
//   color: string;
//   description?: string;
//   user_id: string;
//   created_at: string;
// }

// export interface User {
//   id: string;
//   email: string;
//   created_at: string;
// }

// class LocalStorage {
//   private getKey(key: string, userId?: string): string {
//     return userId ? `${key}_${userId}` : key;
//   }

//   // User management
//   getUsers(): any[] {
//     const users = localStorage.getItem('users');
//     return users ? JSON.parse(users) : [];
//   }

//   saveUser(user: any): void {
//     const users = this.getUsers();
//     const existingIndex = users.findIndex(u => u.id === user.id);
//     if (existingIndex >= 0) {
//       users[existingIndex] = user;
//     } else {
//       users.push(user);
//     }
//     localStorage.setItem('users', JSON.stringify(users));
//   }

//   getUserByEmail(email: string): any | null {
//     const users = this.getUsers();
//     return users.find(u => u.email === email) || null;
//   }

//   // Current user session
//   getCurrentUser(): User | null {
//     const user = localStorage.getItem('currentUser');
//     return user ? JSON.parse(user) : null;
//   }

//   setCurrentUser(user: User | null): void {
//     if (user) {
//       localStorage.setItem('currentUser', JSON.stringify(user));
//     } else {
//       localStorage.removeItem('currentUser');
//     }
//   }

//   // Tasks
//   getTasks(userId: string): Task[] {
//     const tasks = localStorage.getItem(this.getKey('tasks', userId));
//     return tasks ? JSON.parse(tasks) : [];
//   }

//   saveTasks(tasks: Task[], userId: string): void {
//     localStorage.setItem(this.getKey('tasks', userId), JSON.stringify(tasks));
//   }

//   addTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
//     const newTask: Task = {
//       ...task,
//       id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     };

//     const tasks = this.getTasks(task.user_id);
//     tasks.unshift(newTask); // Add to beginning for newest first
//     this.saveTasks(tasks, task.user_id);
//     return newTask;
//   }

//   updateTask(taskId: string, updates: Partial<Task>, userId: string): Task | null {
//     const tasks = this.getTasks(userId);
//     const taskIndex = tasks.findIndex(t => t.id === taskId);
    
//     if (taskIndex === -1) return null;

//     const updatedTask = {
//       ...tasks[taskIndex],
//       ...updates,
//       updated_at: new Date().toISOString(),
//     };

//     tasks[taskIndex] = updatedTask;
//     this.saveTasks(tasks, userId);
//     return updatedTask;
//   }

//   deleteTask(taskId: string, userId: string): boolean {
//     const tasks = this.getTasks(userId);
//     const filteredTasks = tasks.filter(t => t.id !== taskId);
    
//     if (filteredTasks.length === tasks.length) return false;
    
//     this.saveTasks(filteredTasks, userId);
//     return true;
//   }

//   // Context Entries
//   getContextEntries(userId: string): ContextEntry[] {
//     const entries = localStorage.getItem(this.getKey('contextEntries', userId));
//     return entries ? JSON.parse(entries) : [];
//   }

//   saveContextEntries(entries: ContextEntry[], userId: string): void {
//     localStorage.setItem(this.getKey('contextEntries', userId), JSON.stringify(entries));
//   }

//   addContextEntry(entry: Omit<ContextEntry, 'id' | 'created_at'>): ContextEntry {
//     const newEntry: ContextEntry = {
//       ...entry,
//       id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
//       created_at: new Date().toISOString(),
//     };

//     const entries = this.getContextEntries(entry.user_id);
//     entries.unshift(newEntry); // Add to beginning for newest first
//     this.saveContextEntries(entries, entry.user_id);
//     return newEntry;
//   }

//   // Categories
//   getCategories(userId: string): Category[] {
//     const categories = localStorage.getItem(this.getKey('categories', userId));
//     if (categories) {
//       return JSON.parse(categories);
//     }

//     // Initialize with default categories
//     const defaultCategories: Category[] = [
//       {
//         id: '1',
//         name: 'Work',
//         color: '#3B82F6',
//         description: 'Professional tasks and projects',
//         user_id: userId,
//         created_at: new Date().toISOString(),
//       },
//       {
//         id: '2',
//         name: 'Personal',
//         color: '#10B981',
//         description: 'Personal activities and goals',
//         user_id: userId,
//         created_at: new Date().toISOString(),
//       },
//       {
//         id: '3',
//         name: 'Health',
//         color: '#EF4444',
//         description: 'Health and wellness related tasks',
//         user_id: userId,
//         created_at: new Date().toISOString(),
//       },
//       {
//         id: '4',
//         name: 'Learning',
//         color: '#8B5CF6',
//         description: 'Education and skill development',
//         user_id: userId,
//         created_at: new Date().toISOString(),
//       },
//       {
//         id: '5',
//         name: 'Finance',
//         color: '#F59E0B',
//         description: 'Financial planning and management',
//         user_id: userId,
//         created_at: new Date().toISOString(),
//       },
//       {
//         id: '6',
//         name: 'Home',
//         color: '#6B7280',
//         description: 'Household and maintenance tasks',
//         user_id: userId,
//         created_at: new Date().toISOString(),
//       },
//     ];

//     this.saveCategories(defaultCategories, userId);
//     return defaultCategories;
//   }

//   saveCategories(categories: Category[], userId: string): void {
//     localStorage.setItem(this.getKey('categories', userId), JSON.stringify(categories));
//   }
// }

// export const storage = new LocalStorage();
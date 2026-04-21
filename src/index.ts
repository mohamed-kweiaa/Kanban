//import "./style.css";
import "./output.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import 'flowbite';

//!------------------------------- Types -------------------------------
type TaskStatus = 'todo' | 'in-progress' | 'completed';
type Priority = 'high' | 'medium' | 'low';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  createdAt: number;
}

//!----------------State Management----------------
let editingTaskId: string | null = null;

//!----------------Local Storage Logic----------------

function getTasks(): Task[] {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderAllTasks();
}

//!----------------Time----------------

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) return "Just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

//!----------------CRUD Operations----------------

function addTask(task: Task) {
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
}

function updateTask(updatedTask: Task) {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    saveTasks(tasks);
  }
}

function updateTaskStatus(id: string, newStatus: TaskStatus) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    saveTasks(tasks);
  }
}

function deleteTask(id: string) {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
}

//!----------------Rendering Logic----------------

function renderTask(task: Task) {
  const priorityColors = {
    high: { 
      bg: 'bg-rose-50', 
      text: 'text-rose-600', 
      dot: 'bg-rose-500', 
      label: 'Critical' 
    },
    medium: { 
      bg: 'bg-amber-50', 
      text: 'text-amber-600', 
      dot: 'bg-amber-500', 
      label: 'Normal' 
    },
    low: { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      dot: 'bg-emerald-500', 
      label: 'Low' 
    }
  };

  const colors = priorityColors[task.priority] || priorityColors.low;

  return `
    <div class="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden" data-id="${task.id}">
      <div class="absolute top-0 left-0 w-1 h-full ${colors.dot} opacity-40"></div>
      
      <div class="flex items-center justify-between mb-4">
        <span class="${colors.bg} ${colors.text} text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-wider">
          <span class="w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse"></span>
          ${colors.label}
        </span>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="window.startEdit('${task.id}')" class="text-slate-300 hover:text-indigo-500 transition-colors cursor-pointer p-1">
            <i class="fa-solid fa-pen-to-square text-sm"></i>
          </button>
          <button onclick="window.confirmDelete('${task.id}')" class="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer p-1">
            <i class="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>
      </div>

      <h3 class="font-bold text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">${task.title}</h3>
      <p class="text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed">${task.description || 'Add details...'}</p>
      
      <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-5 pb-5 border-b border-slate-50">
        <div class="flex items-center gap-2">
          <i class="fa-regular fa-calendar-check text-indigo-400"></i>
          <span class="font-medium">${task.dueDate || 'Ongoing'}</span>
        </div>
        <div class="flex items-center gap-2 ml-auto font-medium" title="Saved at: ${new Date(task.createdAt).toLocaleString()}">
          <i class="fa-regular fa-clock text-slate-300"></i>
          <span>${getTimeAgo(task.createdAt)}</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mr-auto">Move to:</span>
        <div class="flex gap-1">
          ${task.status !== 'todo' ? `
            <button onclick="window.moveTask('${task.id}', 'todo')" title="Move to Todo" class="w-8 h-8 flex items-center justify-center cursor-pointer bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-90">
              <i class="fa-solid fa-list-ul"></i>
            </button>` : ''}
          
          ${task.status !== 'in-progress' ? `
            <button onclick="window.moveTask('${task.id}', 'in-progress')" title="Start Task" class="w-8 h-8 flex items-center justify-center cursor-pointer bg-amber-50 text-amber-500 rounded-lg hover:bg-amber-100 transition-all active:scale-90">
              <i class="fa-solid fa-play"></i>
            </button>` : ''}
          
          ${task.status !== 'completed' ? `
            <button onclick="window.moveTask('${task.id}', 'completed')" title="Complete" class="w-8 h-8 flex items-center justify-center cursor-pointer bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-100 transition-all active:scale-90">
              <i class="fa-solid fa-check-double"></i>
            </button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderAllTasks() {
  const tasks = getTasks();
  
  const containers = {
    todo: document.getElementById('tasks-todo'),
    'in-progress': document.getElementById('tasks-in-progress'),
    completed: document.getElementById('tasks-completed')
  };

  Object.keys(containers).forEach((statusKey) => {
    const status = statusKey as TaskStatus;
    const container = containers[status];
    if (!container) return;

    const filteredTasks = tasks.filter(t => t.status === status);
    
    if (filteredTasks.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
            <i class="fa-regular fa-clipboard text-2xl text-slate-300"></i>
          </div>
          <p class="text-sm font-bold text-slate-400">Clear for now</p>
          <p class="text-[11px] text-slate-300 mt-1 max-w-[150px]">No tasks are currently listed in this category.</p>
        </div>`;
    } else {
      container.innerHTML = filteredTasks.map(renderTask).join('');
    }

    //! Update the task counts next to column headers
    const countEl = container.previousElementSibling?.querySelector('p');
    if (countEl) {
      countEl.textContent = filteredTasks.length.toString();
    }
  });
}

//!----------------Event Initialization----------------

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const titleEle = document.getElementById('name') as HTMLInputElement;
  const titleError = document.getElementById('title-error');
  const dateEle = document.getElementById('task-due-date') as HTMLInputElement;
  const errorEle = document.getElementById('date-error');
  const modalTitle = document.querySelector('#crud-modal h3');
  const submitBtn = document.querySelector('form button[type="submit"] span') || document.querySelector('form button[type="submit"]');

  //! Set min date to today--
  const today = new Date().toISOString().split('T')[0];
  if (dateEle) dateEle.setAttribute('min', today);

  //! Reset modal
  document.getElementById('add-task-btn')?.addEventListener('click', () => {
    editingTaskId = null;
    form?.reset();
    if (modalTitle) modalTitle.textContent = "Create New Task";
    if (submitBtn) submitBtn.textContent = "Add Task";

    //!errors
    titleError?.classList.add('hidden');
    titleEle?.classList.remove('border-red-500');
    errorEle?.classList.add('hidden');
    dateEle?.classList.remove('border-red-500');

    document.getElementById('modal-show-trigger')?.click();
    
    setTimeout(() => titleEle?.focus(), 200);
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const titleEle = document.getElementById('name') as HTMLInputElement;
    const titleError = document.getElementById('title-error');
    const priorityEle = document.getElementById('task-priority') as HTMLSelectElement;
    const descriptionEle = document.getElementById('description') as HTMLTextAreaElement;

    let isValid = true;

    //! --- Title Validation ---
    if (!titleEle.value.trim()) {
      titleError?.classList.remove('hidden');
      titleEle.classList.add('border-red-500');
      titleEle.classList.remove('border-default-medium');
      isValid = false;
    } else {
      titleError?.classList.add('hidden');
      titleEle.classList.remove('border-red-500');
      titleEle.classList.add('border-default-medium');
    }

    //! --- Date Validation ---
    if (dateEle && dateEle.value && dateEle.value < today) {
      errorEle?.classList.remove('hidden');
      dateEle.classList.add('border-red-500');
      dateEle.classList.remove('border-default-medium');
      isValid = false;
    } else {
      errorEle?.classList.add('hidden');
      dateEle.classList.remove('border-red-500');
      dateEle.classList.add('border-default-medium');
    }
    
    if (!isValid) return;

    if (editingTaskId) {
      //! UPDATING
      const tasks = getTasks();
      const existingTask = tasks.find(t => t.id === editingTaskId);
      if (existingTask) {
        const updatedTask: Task = {
           ...existingTask,
           title: titleEle.value,
           description: descriptionEle.value,
           priority: priorityEle.value as Priority,
           dueDate: dateEle.value
        };
        updateTask(updatedTask);
      }
    } else {
      //! ADDING
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: titleEle.value,
        description: descriptionEle.value,
        priority: (priorityEle.value as Priority) || 'medium',
        dueDate: dateEle.value,
        status: 'todo',
        createdAt: Date.now()
      };
      addTask(newTask);
    }

    form.reset();
    editingTaskId = null;
    
    const closeBtn = document.querySelector<HTMLElement>('[data-modal-hide="crud-modal"]');
    closeBtn?.click();
  });

  setInterval(renderAllTasks, 60000);
  renderAllTasks();
});

//!----------------Global Functions for UI Actions----------------

(window as any).moveTask = (id: string, status: TaskStatus) => updateTaskStatus(id, status);

(window as any).confirmDelete = (id: string) => {
  if (confirm("Are you sure you want to delete this task?")) {
    deleteTask(id);
  }
};

(window as any).startEdit = (id: string) => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;

  const titleEle = document.getElementById('name') as HTMLInputElement;
  const priorityEle = document.getElementById('task-priority') as HTMLSelectElement;
  const dateEle = document.getElementById('task-due-date') as HTMLInputElement;
  const descriptionEle = document.getElementById('description') as HTMLTextAreaElement;
  const modalTitle = document.querySelector('#crud-modal h3');
  const submitBtn = document.querySelector('form button[type="submit"] span') || document.querySelector('form button[type="submit"]');

  titleEle.value = task.title;
  priorityEle.value = task.priority;
  dateEle.value = task.dueDate;
  descriptionEle.value = task.description;

  if (modalTitle) modalTitle.textContent = "Edit Task";
  if (submitBtn) submitBtn.textContent = "Save Changes";

  const modalTrigger = document.getElementById('modal-show-trigger');
  modalTrigger?.click();

  setTimeout(() => titleEle.focus(), 200);
};

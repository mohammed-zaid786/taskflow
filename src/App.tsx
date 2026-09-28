import React, { useState, useEffect } from "react";
import {
DragDropContext,
Droppable,
Draggable,
type DropResult,
} from "@hello-pangea/dnd";
import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
} from "./components/Dialog";
import { Combobox } from "./components/Combobox";
import {
Accordion,
AccordionItem,
AccordionTrigger,
AccordionContent,
} from "./components/Accordion";

// Task aur column ka structure
interface Task {
id: string;
title: string;
priority?: "low" | "medium" | "high";
}

interface Column {
id: string;
title: string;
tasks: Task[];
}

// Default board data
const initialColumns: Column[] = [
{
id: "todo",
title: "TO DO",
tasks: [
{ id: "t1", title: "Setup WCAG AA color tokens", priority: "high" },
{ id: "t2", title: "Wire drag-and-drop state", priority: "medium" },
],
},
{
id: "in-progress",
title: "IN PROGRESS",
tasks: [
{ id: "t3", title: "Multi-column layout testing", priority: "medium" },
],
},
{
id: "done",
title: "DONE",
tasks: [
{ id: "t4", title: "Project repository initialization", priority: "low" },
],
},
];

// Combobox options
const priorityOptions = [
{ label: "Low Priority", value: "low" },
{ label: "Medium Priority", value: "medium" },
{ label: "High Priority", value: "high" },
];

export default function App() {
// Theme state with local storage
const [theme, setTheme] = useState<"light" | "dark">(() => {
return (localStorage.getItem("taskflow-theme") as "light" | "dark") || "dark";
});

// Columns state with local storage
const [columns, setColumns] = useState<Column[]>(() => {
const saved = localStorage.getItem("taskflow-board");
if (saved) {
try {
return JSON.parse(saved);
} catch (e) {
console.error("Local storage parse error:", e);
}
}
return initialColumns;
});

// Inline task create state
const [addingColId, setAddingColId] = useState<string | null>(null);
const [newTitle, setNewTitle] = useState("");

// Edit dialog state
const [editingTask, setEditingTask] = useState<{
colId: string;
taskId: string;
title: string;
priority: string;
} | null>(null);

// Track focused task
const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

// Sync board data to local storage
useEffect(() => {
localStorage.setItem("taskflow-board", JSON.stringify(columns));
}, [columns]);

// Sync theme class to html tag
useEffect(() => {
const root = document.documentElement;
if (theme === "dark") {
root.classList.add("dark");
} else {
root.classList.remove("dark");
}
localStorage.setItem("taskflow-theme", theme);
}, [theme]);

// Drag and drop reorder logic
const onDragEnd = (result: DropResult) => {
const { source, destination } = result;
if (!destination) return;
if (
source.droppableId === destination.droppableId &&
source.index === destination.index
) {
return;
}

const sourceCol = columns.find((c) => c.id === source.droppableId);  
const destCol = columns.find((c) => c.id === destination.droppableId);  
if (!sourceCol || !destCol) return;  

if (source.droppableId === destination.droppableId) {  
  // Same column reorder  
  const updatedTasks = Array.from(sourceCol.tasks);  
  const [movedTask] = updatedTasks.splice(source.index, 1);  
  updatedTasks.splice(destination.index, 0, movedTask);  

  setColumns(  
    columns.map((col) =>  
      col.id === sourceCol.id ? { ...col, tasks: updatedTasks } : col  
    )  
  );  
} else {  
  // Move between columns  
  const sourceTasks = Array.from(sourceCol.tasks);  
  const [movedTask] = sourceTasks.splice(source.index, 1);  
  const destTasks = Array.from(destCol.tasks);  
  destTasks.splice(destination.index, 0, movedTask);  

  setColumns(  
    columns.map((col) => {  
      if (col.id === sourceCol.id) return { ...col, tasks: sourceTasks };  
      if (col.id === destCol.id) return { ...col, tasks: destTasks };  
      return col;  
    })  
  );  
}

};

// Add new task
const handleAddTask = (colId: string) => {
if (!newTitle.trim()) return;
const newTask: Task = {
id: "task-" + Date.now(),
title: newTitle.trim(),
priority: "medium",
};

setColumns(  
  columns.map((col) =>  
    col.id === colId ? { ...col, tasks: [...col.tasks, newTask] } : col  
  )  
);  
setNewTitle("");  
setAddingColId(null);

};

// Delete task
const handleDeleteTask = (colId: string, taskId: string) => {
  const confirmDelete = window.confirm(
    "Do you want to delete this task?"
  );

  if (!confirmDelete) return;

  setColumns(
    columns.map((col) =>
      col.id === colId
        ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
        : col
    )
  );
};

// Open edit modal
const openEditModal = (colId: string, task: Task) => {
setEditingTask({
colId,
taskId: task.id,
title: task.title,
priority: task.priority || "medium",
});
};

// Save changes from dialog
const handleSaveEdit = () => {
if (!editingTask || !editingTask.title.trim()) return;

setColumns(  
  columns.map((col) => {  
    if (col.id === editingTask.colId) {  
      return {  
        ...col,  
        tasks: col.tasks.map((t) =>  
          t.id === editingTask.taskId  
            ? {  
                ...t,  
                title: editingTask.title.trim(),  
                priority: editingTask.priority as "low" | "medium" | "high",  
              }  
            : t  
        ),  
      };  
    }  
    return col;  
  })  
);  
setEditingTask(null);

};

// Helper badge color based on priority
const getPriorityBadge = (p?: string) => {
if (p === "high") return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
if (p === "low") return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
};

return (
<div className="min-h-screen bg-slate-100 dark:bg-[#0f172a] text-gray-900 dark:text-white transition-colors duration-200">
{/* Top Header */}
<header className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1e293b]">
<h1 className="text-xl font-bold tracking-tight">TaskFlow Workspace</h1>
<button
type="button"
onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition"
>
{theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>
</header>

{/* Main Board Container */}  
  <main className="max-w-6xl mx-auto p-6">  
    {/* Accordion for Board Guidelines */}  
    <div className="mb-6">  
      <Accordion  
        type="single"  
        collapsible  
        className="w-full bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-slate-800 px-4 shadow-sm"  
      >  
        <AccordionItem value="workspace-info">  
          <AccordionTrigger className="text-sm font-semibold">  
            Workspace Guidelines & Shortcuts  
          </AccordionTrigger>  
          <AccordionContent>  
            Aap mouse se drag karke ya Spacebar daba kar card ko grab karke Arrow keys se columns ke beech move kar sakte hain. Edit ya Delete ke liye card ke right side icons use karein.  
          </AccordionContent>  
        </AccordionItem>  
      </Accordion>  
    </div>  

    {/* Drag and drop board area */}  
    <DragDropContext onDragEnd={onDragEnd}>  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">  
        {columns.map((column) => (  
          <section  
            key={column.id}  
            aria-label={column.title}  
            className="bg-gray-200/70 dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-gray-300/60 dark:border-slate-800 flex flex-col max-h-[80vh]"  
          >  
            {/* Column Title and Count */}  
            <div className="flex items-center justify-between mb-3 px-1">  
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">  
                {column.title}  
              </h2>  
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-gray-200">  
                {column.tasks.length}  
              </span>  
            </div>  

            {/* Droppable Task Area */}  
            <Droppable droppableId={column.id}>  
              {(provided, snapshot) => (  
                <div  
                  {...provided.droppableProps}  
                  ref={provided.innerRef}  
                  className={`flex-1 overflow-y-auto space-y-2.5 min-h-[60px] p-1 rounded-lg transition-colors ${  
                    snapshot.isDraggingOver  
                      ? "bg-gray-300/50 dark:bg-slate-800/60"  
                      : ""  
                  }`}  
                >  
                  {column.tasks.map((task, index) => {  
                    const isFocused = focusedTaskId  
                      ? focusedTaskId === task.id  
                      : index === 0;  

                    return (  
                      <Draggable  
                        key={task.id}  
                        draggableId={task.id}  
                        index={index}  
                      >  
                        {(provided, snapshot) => (  
                          <div  
                            ref={provided.innerRef}  
                            {...provided.draggableProps}  
                            {...provided.dragHandleProps}  
                            tabIndex={isFocused ? 0 : -1}  
                            id={`task-card-${task.id}`}  
                            onFocus={() => setFocusedTaskId(task.id)}  
                            role="button"  
                            aria-label={`${task.title}. Press Spacebar to grab, arrow keys to move, Spacebar to drop.`}  
                            className={`bg-white dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm flex flex-col gap-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-grab active:cursor-grabbing ${  
                              snapshot.isDragging  
                                ? "shadow-lg ring-2 ring-blue-500 rotate-1 bg-blue-50 dark:bg-slate-600"  
                                : "hover:shadow-md"  
                            }`}  
                          >  
                            <div className="flex items-start justify-between gap-2">  
                              <span className="text-gray-400 select-none text-sm">⠿</span>  

                              <span className="text-sm font-medium text-gray-900 dark:text-white break-words flex-1">  
                                {task.title}  
                              </span>  

                              {/* Edit and Delete Buttons */}  
                              <div  
                                className="flex items-center gap-1 shrink-0"  
                                onKeyDown={(e) => e.stopPropagation()}  
                              >  
                                <button  
                                  type="button"  
                                  tabIndex={0}  
                                  aria-label={`Edit task: ${task.title}`}  
                                  onClick={(e) => {  
                                    e.stopPropagation();  
                                    openEditModal(column.id, task);  
                                  }}  
                                  title="Edit task"  
                                  className="p-1 text-gray-400 hover:text-blue-500 rounded hover:bg-gray-100 dark:hover:bg-slate-600 text-xs"  
                                >  
                                  ✏️  
                                </button>  
                                <button  
                                  type="button"  
                                  tabIndex={0}  
                                  aria-label={`Delete task: ${task.title}`}  
                                  onClick={(e) => {  
                                    e.stopPropagation();  
                                    handleDeleteTask(column.id, task.id);  
                                  }}  
                                  title="Delete task"  
                                  className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-slate-600 text-xs"  
                                >  
                                  🗑️  
                                </button>  
                              </div>  
                            </div>  

                            {/* Priority Tag */}  
                            {task.priority && (  
                              <span  
                                className={`self-start text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${getPriorityBadge(  
                                  task.priority  
                                )}`}  
                              >  
                                {task.priority}  
                              </span>  
                            )}  
                          </div>  
                        )}  
                      </Draggable>  
                    );  
                  })}  
                  {provided.placeholder}  
                </div>  
              )}  
            </Droppable>  

            {/* Add Task Block */}  
            {addingColId === column.id ? (  
              <div className="mt-3 p-1">  
                <input  
                  type="text"  
                  autoFocus  
                  placeholder="Enter task title..."  
                  value={newTitle}  
                  onChange={(e) => setNewTitle(e.target.value)}  
                  onKeyDown={(e) => {  
                    if (e.key === "Enter") handleAddTask(column.id);  
                    if (e.key === "Escape") setAddingColId(null);  
                  }}  
                  className="w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mb-2"  
                />  
                <div className="flex gap-2">  
                  <button  
                    type="button"  
                    onClick={() => handleAddTask(column.id)}  
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"  
                  >  
                    Add  
                  </button>  
                  <button  
                    type="button"  
                    onClick={() => setAddingColId(null)}  
                    className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs hover:underline"  
                  >  
                    Cancel  
                  </button>  
                </div>  
              </div>  
            ) : (  
              <button  
                type="button"  
                onClick={() => {  
                  setAddingColId(column.id);  
                  setNewTitle("");  
                }}  
                className="mt-3 w-full py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300/60 dark:hover:bg-slate-700 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-600"  
              >  
                + Add task  
              </button>  
            )}  
          </section>  
        ))}  
      </div>  
    </DragDropContext>  
  </main>  

  {/* Reusable Edit Dialog Modal */}  
  <Dialog  
    open={Boolean(editingTask)}  
    onOpenChange={(isOpen: boolean) => {  
      if (!isOpen) {  
        setEditingTask(null);  
      }  
    }}  
  >  
    <DialogContent>  
      <DialogHeader>  
        <DialogTitle>Edit Task</DialogTitle>  
      </DialogHeader>  

      {editingTask && (  
        <div className="space-y-4 mt-2">  
          <div>  
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">  
              Title  
            </label>  
            <input  
              type="text"  
              value={editingTask.title}  
              onChange={(e) =>  
                setEditingTask({ ...editingTask, title: e.target.value })  
              }  
              className="w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"  
            />  
          </div>  

          <div>  
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">  
              Priority  
            </label>  
            <Combobox  
              options={priorityOptions}  
              value={editingTask.priority}  
              onChange={(val) =>  
                setEditingTask({ ...editingTask, priority: val })  
              }  
              placeholder="Select Priority"  
            />  
          </div>  

          <div className="flex justify-end gap-2 pt-3">  
            <button  
              type="button"  
              onClick={() => setEditingTask(null)}  
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"  
            >  
              Cancel  
            </button>  
            <button  
              type="button"  
              onClick={handleSaveEdit}  
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"  
            >  
              Save  
            </button>  
          </div>  
        </div>  
      )}  
    </DialogContent>  
  </Dialog>  
</div>

);
}
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/*
  Color Palette:
    Primary:   #1976D2
    Secondary: #424242
    Accent:    #FF4081
  Modern, minimal, light-themed
*/

// Task structure example:
// { id: 1, text: 'Buy milk', completed: false }

const COLOR_PRIMARY = "#1976D2";
const COLOR_SECONDARY = "#424242";
const COLOR_ACCENT = "#FF4081";

const FILTERS = {
  all: "All",
  active: "Active",
  completed: "Completed",
};

// Header Component
// PUBLIC_INTERFACE
function TodoHeader() {
  /** Renders the application header with branding and simple navigation. */
  return (
    <header className="todo-header">
      <h1 className="todo-title">Tasks</h1>
      <nav className="todo-nav">
        {/* Minimal navigation: Here it's for demo/future extension */}
        <span style={{ color: COLOR_ACCENT, fontWeight: "bold" }}>·</span>
        <span className="todo-nav-link active">My Tasks</span>
      </nav>
    </header>
  );
}

// Task Input Bar Component
// PUBLIC_INTERFACE
function TaskInput({ onAdd }) {
  /** Renders input field to add new tasks. */
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const handleAdd = () => {
    if (value.trim() === "") return;
    onAdd(value.trim());
    setValue("");
    inputRef.current.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="task-input-wrapper">
      <input
        ref={inputRef}
        type="text"
        className="task-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a new task..."
        maxLength={100}
        aria-label="Add a new task"
        autoFocus
      />
      <button className="add-btn" onClick={handleAdd} title="Add Task">
        +
      </button>
    </div>
  );
}

// Task Item (supports editing, toggle, delete)
// PUBLIC_INTERFACE
function TaskItem({ task, onToggle, onDelete, onEdit }) {
  /** Renders single task item, allowing marking complete, edit, delete. */
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);
  const editInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.text) {
      onEdit(task.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditBlur = () => {
    handleEditSave();
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      setEditValue(task.text);
      setIsEditing(false);
    }
  };

  return (
    <li
      className={`task-item${task.completed ? " completed" : ""}`}
      tabIndex={0}
    >
      <label className="checkbox-container" tabIndex={-1}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark ${task.text} as ${task.completed ? "incomplete" : "complete"}`}
        />
        <span className="custom-checkbox"></span>
      </label>
      {!isEditing ? (
        <span
          className="task-text"
          onDoubleClick={() => setIsEditing(true)}
          title="Double click to edit"
        >
          {task.text}
        </span>
      ) : (
        <input
          ref={editInputRef}
          className="task-edit-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditBlur}
          onKeyDown={handleEditKeyDown}
          maxLength={100}
          aria-label="Edit task"
        />
      )}
      <button
        className="delete-btn"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.text}`}
        title="Delete"
      >
        ×
      </button>
      {!isEditing && (
        <button
          className="edit-btn"
          onClick={() => setIsEditing(true)}
          aria-label={`Edit ${task.text}`}
          title="Edit"
        >
          ✎
        </button>
      )}
    </li>
  );
}

// Task List
// PUBLIC_INTERFACE
function TaskList({ tasks, onToggle, onDelete, onEdit }) {
  /** Renders an unordered list of tasks. */
  if (!tasks.length) {
    return <div className="empty-list">No tasks to show.</div>;
  }
  return (
    <ul className="task-list" aria-label="Task list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}

// Filter Bar
// PUBLIC_INTERFACE
function FilterBar({ current, setFilter }) {
  /** Renders filters for all/active/completed tasks. */
  return (
    <div className="filter-bar">
      {Object.entries(FILTERS).map(([key, label]) => (
        <button
          key={key}
          className={`filter-btn${key === current ? " selected" : ""}`}
          onClick={() => setFilter(key)}
          aria-pressed={key === current}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Main App
// PUBLIC_INTERFACE
function App() {
  /** Main App holding all state and orchestrating components. */
  // Task list state
  const [tasks, setTasks] = useState(() => {
    // Try loading from localStorage
    const stored = window.localStorage.getItem("todo-tasks");
    return stored ? JSON.parse(stored) : [];
  });
  const [filter, setFilter] = useState("all");

  // Save to localStorage for persistence
  useEffect(() => {
    window.localStorage.setItem("todo-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // PUBLIC_INTERFACE
  const addTask = (text) => {
    setTasks([
      { id: Date.now(), text, completed: false },
      ...tasks,
    ]);
  };

  // PUBLIC_INTERFACE
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // PUBLIC_INTERFACE
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // PUBLIC_INTERFACE
  const editTask = (id, text) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, text }
          : task
      )
    );
  };

  // Derived filtered tasks
  const getFilteredTasks = () => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  };

  // For minimal navigation (demo only)
  // const handleNav = () => {};

  return (
    <div className="todo-app-wrapper">
      <TodoHeader />
      <main className="main-section">
        <TaskInput onAdd={addTask} />
        <FilterBar current={filter} setFilter={setFilter} />
        <TaskList
          tasks={getFilteredTasks()}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onEdit={editTask}
        />
        <div className="task-footer">
          <span style={{ color: COLOR_SECONDARY, fontSize: 13 }}>
            Total: <b>{tasks.length}</b> / Active: <b>{tasks.filter((t) => !t.completed).length}</b>
          </span>
        </div>
      </main>
      <footer className="todo-footer" tabIndex={-1}>
        <span style={{ color: COLOR_PRIMARY, fontWeight: 500 }}>
          Minimal Todo &copy; {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}

export default App;

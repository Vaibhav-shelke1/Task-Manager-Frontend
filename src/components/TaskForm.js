function TaskForm() {
  const { addTask } = useTaskContext();
  const { theme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTask = {
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      dueDate: formData.get('dueDate'),
    };
    addTask(newTask);
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="title"
        placeholder="Task Title"
        className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
        required
      />
      <textarea
        name="description"
        placeholder="Task Description"
        className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
      ></textarea>
      <select name="status" className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`} required>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
      <select name="priority" className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`} required>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <input
        type="date"
        name="dueDate"
        className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
        required
      />
      <Button type="submit">Add Task</Button>
    </form>
  );
}

export default TaskForm;

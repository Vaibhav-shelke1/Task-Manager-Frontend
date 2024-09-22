function TaskList({ tasks }) {
  const { theme } = useTheme();
  const { deleteTask } = useTaskContext();

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  return (
    <ul className="space-y-4">
      {tasks.length > 0 ? tasks.map((task) => (
        <li key={task._id} className={`p-4 rounded shadow ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{task.title}</h3>
              <p className="text-sm mt-1">{task.description}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">Status: <span className="font-semibold">{task.status}</span></p>
                <p className="text-sm">Priority: <span className="font-semibold">{task.priority}</span></p>
                <p className="text-sm">Due Date: <span className="font-semibold">{new Date(task.dueDate).toLocaleDateString()}</span></p>
              </div>
            </div>
            <div className="flex space-x-2">
              <EditTaskDialog taskId={task._id} />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(task._id)}
                aria-label={`Delete task: ${task.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </li>
      )) : <p>No tasks found</p>}
    </ul>
  );
}

export default TaskList;

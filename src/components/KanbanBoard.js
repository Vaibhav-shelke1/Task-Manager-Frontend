function KanbanBoard({ tasks }) {
  const { theme } = useTheme();
  const columns = ['To Do', 'In Progress', 'Completed'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <div key={column} className={`p-4 rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}>
          <h3 className="font-bold mb-2">{column}</h3>
          {tasks
            .filter((task) => task.status === column)
            .map((task) => (
              <div key={task._id} className={`p-2 mb-2 rounded shadow ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-black'}`}>
                <h4 className="font-bold">{task.title}</h4>
                <p>{task.description}</p>
                <p>Priority: {task.priority}</p>
                <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default KanbanBoard;

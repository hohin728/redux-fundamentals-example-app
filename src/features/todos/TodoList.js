import React from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import TodoListItem from './TodoListItem'

const selectTodosIds = (state) => state.todos.map((todo) => todo.id)

const TodoList = () => {
  const todosIds = useSelector(selectTodosIds, shallowEqual)

  const renderedListItems = todosIds.map((todoId) => {
    return <TodoListItem key={todoId} id={todoId} />
  })

  return <ul className="todo-list">{renderedListItems}</ul>
}

export default TodoList

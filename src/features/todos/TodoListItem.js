import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { ReactComponent as TimesSolid } from './times-solid.svg'
import { availableColors, capitalize } from '../filters/colors'
import { selectTodoById } from '../todos/todosSlice'

const TodoListItem = ({ id }) => {
  const todo = useSelector((state) => selectTodoById(state, id))
  const { text, completed, color } = todo

  const dispatch = useDispatch()

  const handleCompletedChanged = () => {
    dispatch({ type: 'todos/todoToggled', payload: todo.id })
  }

  const handleColorChanged = (e) => {
    dispatch({
      type: 'todos/colorSelected',
      payload: { color: e.target.value, todoId: todo.id },
    })
  }

  const handleDelete = () => {
    dispatch({ type: 'todos/todoDeleted', payload: todo.id })
  }

  const colorOptions = availableColors.map((c) => (
    <option key={c} value={c}>
      {capitalize(c)}
    </option>
  ))

  return (
    <li>
      <div className="view">
        <div className="segment label">
          <input
            className="toggle"
            type="checkbox"
            checked={completed}
            onChange={handleCompletedChanged}
          />
          <div className="todo-text">{text}</div>
        </div>
        <div className="segment buttons">
          <select
            className="colorPicker"
            value={color}
            style={{ color }}
            onChange={handleColorChanged}
          >
            <option value=""></option>
            {colorOptions}
          </select>
          <button className="destroy" onClick={handleDelete}>
            <TimesSolid />
          </button>
        </div>
      </div>
    </li>
  )
}

export default TodoListItem

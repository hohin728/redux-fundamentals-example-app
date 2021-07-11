import { createSelector } from 'reselect'
import { client } from '../../api/client'
import { StatusFilters } from './../filters/filtersSlice'

const initialState = [
  // { id: 0, text: 'Learn React', completed: true },
  // { id: 1, text: 'Learn Redux', completed: false, color: 'purple' },
  // { id: 2, text: 'Build something fun!', completed: false, color: 'blue' },
]

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/todoAdded': {
      // Can return just the new todos array - no extra object around it
      return [...state, action.payload]
    }
    case 'todos/todoToggled': {
      return state.map((todo) => {
        if (todo.id !== action.payload) {
          return todo
        }
        return {
          ...todo,
          completed: !todo.completed,
        }
      })
    }
    case 'todos/colorSelected': {
      const { color, todoId } = action.payload
      return state.map((todo) => {
        if (todo.id !== todoId) {
          return todo
        }
        return {
          ...todo,
          color,
        }
      })
    }
    case 'todos/todoDeleted': {
      return state.filter((todo) => todo.id !== action.payload)
    }
    case 'todos/allCompleted': {
      return state.map((todo) => {
        return { ...todo, completed: true }
      })
    }
    case 'todos/completedCleared': {
      return state.filter((todo) => !todo.completed)
    }
    case 'todos/todosLoaded': {
      return action.payload
    }
    default:
      return state
  }
}

export const selectTodoIds = createSelector(
  (state) => state.todos,
  (todos) => todos.map((todo) => todo.id)
)

export const selectFilteredTodos = createSelector(
  // First input selector: all todos
  (state) => state.todos,
  // Second input selector: current status filter
  (state) => state.filters,
  // Output selector: receives both values
  (todos, filters) => {
    const { status, colors } = filters
    const showAllCompletions = status === StatusFilters.All
    if (showAllCompletions && colors.length === 0) {
      return todos
    }

    const completedStatus = status === StatusFilters.Completed

    // Return either active or completed todos based on filter
    return todos.filter((todo) => {
      const statusMatches =
        showAllCompletions || todo.completed === completedStatus
      const colorMatches = colors.length === 0 || colors.includes(todo.color)
      return statusMatches && colorMatches
    })
  }
)

export const selectFilteredTodoIds = createSelector(
  selectFilteredTodos,
  (todos) => todos.map((todo) => todo.id)
)

export async function fetchTodos(dispatch, getState) {
  const response = await client.get('/fakeApi/todos')

  const stateBefore = getState()
  console.log('Todos before dispatch: ', stateBefore.todos.length)

  dispatch({ type: 'todos/todosLoaded', payload: response.todos })

  const stateAfter = getState()
  console.log('Todos after dispatch', stateAfter.todos.length)
}

export function saveNewTodo(text) {
  return async function saveNewTodoThunk(dispatch, getState) {
    const initialTodo = { text }
    const response = await client.post('/fakeApi/todos', { todo: initialTodo })
    console.log(response)
    dispatch({ type: 'todos/todoAdded', payload: response.todo })
  }
}

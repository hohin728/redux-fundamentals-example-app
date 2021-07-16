import { createSelector } from 'reselect'
import { client } from '../../api/client'
import { StatusFilters } from './../filters/filtersSlice'

const initialState = {
  status: 'idle',
  entities: [],
}

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/todoAdded': {
      return {
        ...state,
        entities: [...state.entities, action.payload],
      }
    }
    case 'todos/todoToggled': {
      return {
        ...state,
        entities: state.entities.map((todo) => {
          if (todo.id !== action.payload) {
            return todo
          }
          return {
            ...todo,
            completed: !todo.completed,
          }
        }),
      }
    }
    case 'todos/colorSelected': {
      const { color, todoId } = action.payload
      return {
        ...state,
        entities: state.entities.map((todo) => {
          if (todo.id !== todoId) {
            return todo
          }
          return {
            ...todo,
            color,
          }
        }),
      }
    }
    case 'todos/todoDeleted': {
      return {
        ...state,
        entities: state.entities.filter((todo) => todo.id !== action.payload),
      }
    }
    case 'todos/allCompleted': {
      return {
        ...state,
        entities: state.entities.map((todo) => {
          return { ...todo, completed: true }
        }),
      }
    }
    case 'todos/completedCleared': {
      return {
        ...state,
        entities: state.entities.filter((todo) => !todo.completed),
      }
    }
    case 'todos/todosLoaded': {
      return {
        ...state,
        entities: action.payload,
      }
    }
    default:
      return state
  }
}

export const selectTodos = (state) => state.todos.entities

export const selectTodoIds = createSelector(
  (state) => state.todos,
  (todos) => todos.map((todo) => todo.id)
)

export const selectTodoById = (state, todoId) => {
  return selectTodos(state).find((todo) => todo.id === todoId)
}

export const selectFilteredTodos = createSelector(
  // First input selector: all todos
  selectTodos,
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
  console.log('Todos before dispatch: ', stateBefore.todos.entities.length)

  dispatch({ type: 'todos/todosLoaded', payload: response.todos })

  const stateAfter = getState()
  console.log('Todos after dispatch', stateAfter.todos.entities.length)
}

export function saveNewTodo(text) {
  return async function saveNewTodoThunk(dispatch, getState) {
    const initialTodo = { text }
    const response = await client.post('/fakeApi/todos', { todo: initialTodo })
    console.log(response)
    dispatch({ type: 'todos/todoAdded', payload: response.todo })
  }
}

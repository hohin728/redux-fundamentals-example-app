import { createSlice, createSelector } from '@reduxjs/toolkit'
import { client } from '../../api/client'
import { StatusFilters } from './../filters/filtersSlice'

const initialState = {
  status: 'idle',
  entities: {},
}

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todosAdded(state, action) {
      const todo = action.payload
      state.push(todo)
    },
    todoToggled(state, action) {
      const todoId = action.payload
      const todo = state.entities[todoId]
      todo.completed = !todo.completed
    },
    todoColorSelected: {
      reducer(state, action) {
        const { todoId, color } = action.payload
        const todo = state.entities[todoId]
        todo.color = color
      },
      prepare(todoId, color) {
        return { payload: { todoId, color } }
      },
    },
    todoDeleted(state, action) {
      const todoId = action.payload
      delete state.entities[todoId]
    },
    allTodosCompleted(state) {
      Object.values(state.entities).forEach((todo) => (todo.completed = true))
    },
    completedTodosCleared(state) {
      Object.values(state.entities).forEach((todo) => {
        if (todo.completed) {
          delete state.entities[todo.id]
        }
      })
    },
    todosLoading(state) {
      state.status = 'loading'
    },
    todosLoaded(state, action) {
      const todos = action.payload
      const todoEntities = {}
      Object.values(todos).forEach((todo) => {
        todoEntities[todo.id] = todo
      })
      state.entities = todoEntities
      state.status = 'idle'
    },
  },
})

export const {
  todoAdded,
  todoToggled,
  todoColorSelected,
  todoDeleted,
  allTodosCompleted,
  completedTodosCleared,
  todosLoading,
  todosLoaded,
} = todosSlice.actions

export const fetchTodos = () => {
  // data processing...
  return async (dispatch) => {
    dispatch(todosLoading())
    const response = await client.get('/fakeApi/todos')
    dispatch(todosLoaded(response.todos))
  }
}

export function saveNewTodo(text) {
  return async function saveNewTodoThunk(dispatch) {
    const initialTodo = { text }
    const response = await client.post('/fakeApi/todos', { todo: initialTodo })
    dispatch(todoAdded(response.todo))
  }
}

export const selectTodoEntities = (state) => state.todos.entities

export const selectTodos = createSelector(selectTodoEntities, (entities) =>
  Object.values(entities)
)

export const selectTodoById = (state, todoId) => {
  return selectTodoEntities(state)[todoId]
}

export const selectUncompletedTodos = createSelector(selectTodos, (todos) =>
  todos.filter((todo) => !todo.completed)
)

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

export default todosSlice.reducer

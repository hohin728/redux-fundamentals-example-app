import {
  createSlice,
  createSelector,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { client } from '../../api/client'
import { StatusFilters } from './../filters/filtersSlice'

const todosAdaptor = createEntityAdapter()

const initialState = todosAdaptor.getInitialState({
  status: 'idle',
})

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})

export const saveNewTodo = createAsyncThunk(
  'todos/saveNewTodo',
  async (text) => {
    const initialTodo = { text }
    const response = await client.post('/fakeApi/todos', { todo: initialTodo })
    return response.todo
  }
)

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
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
    todoDeleted: todosAdaptor.removeOne,
    allTodosCompleted(state) {
      Object.values(state.entities).forEach((todo) => (todo.completed = true))
    },
    completedTodosCleared(state) {
      const completedIds = Object.values(state.entities)
        .filter((todo) => todo.completed)
        .map((todo) => todo.id)
      todosAdaptor.removeMany(state, completedIds)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        const newEntities = {}
        const todos = action.payload
        todos.forEach((todo) => {
          newEntities[todo.id] = todo
        })
        state.entities = newEntities
        state.status = 'idle'
      })
      .addCase(saveNewTodo.fulfilled, todosAdaptor.addOne)
  },
})

export const {
  todoAdded,
  todoToggled,
  todoColorSelected,
  todoDeleted,
  allTodosCompleted,
  completedTodosCleared,
} = todosSlice.actions

export default todosSlice.reducer

export const selectTodoEntities = (state) => state.todos.entities

export const {
  selectAll: selectTodos,
  selectByI: selectTodoById,
} = todosAdaptor.getSelectors((state) => state.todos)

export const selectUncompletedTodos = createSelector(selectTodos, (todos) =>
  todos.filter((todo) => !todo.completed)
)

export const selectTodoIds = createSelector(selectTodos, (todos) =>
  todos.map((todo) => todo.id)
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

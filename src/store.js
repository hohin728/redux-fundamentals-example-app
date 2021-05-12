import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducer'
import { composeWithDevTools } from 'redux-devtools-extension'
import {
  loggerMiddleware,
  alwaysReturnHelloMiddleware,
  delayedMessageMiddleware,
  addCustomAttributeMiddleware,
} from './exampleAddons/middleware'

const middlewareEnhancer = applyMiddleware(
  loggerMiddleware,
  alwaysReturnHelloMiddleware,
  delayedMessageMiddleware,
  addCustomAttributeMiddleware
)

const composedEnhancer = composeWithDevTools(middlewareEnhancer)

// Pass enhancer as the second arg, since there's no preloadedState
const store = createStore(rootReducer, composedEnhancer)

export default store

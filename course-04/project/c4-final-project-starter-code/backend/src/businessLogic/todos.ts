import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('todos')

const todosAccess = new TodoAccess()

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {

    const todoId = uuid.v4()
    logger.info('Creating todo for user', {userId: userId, todoId: todoId})

    return await todosAccess.createTodo({
        todoId: todoId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false
    })
}

export async function deleteTodo(userId: string, todoId: string){
    logger.info('Deleting todo for user', {userId: userId, todoId: todoId})
    return await todosAccess.deleteTodo(userId, todoId)
}

export async function getTodos(userId: string){
    logger.info('Getting todos for user ', {userId: userId})
    return await todosAccess.getTodos(userId)
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updatedTodoRequest: UpdateTodoRequest
  ) {
    logger.info('Sending TODO Update Request', {userId: userId, todoId: todoId})
    return await todosAccess.updateTodo(userId, todoId, updatedTodoRequest)
  }


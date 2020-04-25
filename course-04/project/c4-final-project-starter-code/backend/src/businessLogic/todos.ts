import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getAllToDos(
  jwtToken: string
  ): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoAccess.getAllTodos(userId)
}

export async function deleteToDo(
    todoId: string,
   jwtToken: string
  ): Promise<TodoItem> {
    const userId = parseUserId(jwtToken)
    return await todoAccess.deleteToDo(
      todoId,
      userId
    )
 }
export async function createToDo(
  createToDoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId: todoId,
    createdAt: new Date().toISOString(),
    done: createToDoRequest.done,
    attachmentUrl: createToDoRequest.attachmentUrl,
    name: createToDoRequest.name,
    dueDate: createToDoRequest.dueDate,
    userId: userId
  })
}

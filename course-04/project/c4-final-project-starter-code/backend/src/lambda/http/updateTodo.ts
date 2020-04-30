import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  const logger = createLogger('updateTodos')

  try{
    await updateTodo(userId, todoId, updateTodoRequest)
    logger.info('--TODOS Updated--', {
      key: 'updateTodos'
    })
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 204,
      body: ''
    }
  } catch(e) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 400,
      body: ''
    }
  }
}

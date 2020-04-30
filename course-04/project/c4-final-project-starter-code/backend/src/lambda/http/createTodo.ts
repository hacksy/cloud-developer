import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const newTodo : CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  const logger = createLogger('createTodo')
  logger.info('--Init Create TODO--', {
    key: 'createTodo'
  })
  logger.info('--Trying to Create TODO--', {
    key: 'createTodo'
  })
  try{
    const newItem = await createTodo(newTodo, userId)
    logger.info('--TODO Created--', {
      key: 'createTodo'
    })
    return {
      headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
      },
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  } catch(e) {
    logger.info('--TODO Failed--', {
      key: 'createTodo'
    })
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

import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const logger = createLogger('deleteTodo')
  logger.info('--Init Delete TODO--', {
    key: 'deleteTodo'
  })
  try{
    await deleteTodo(userId, todoId)
    logger.info('--TODO Deleted--', {
      key: 'deleteTodo'
    })
    return {
      headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
      },
      statusCode: 200,
      body: ''
    }
  } catch(e) {
    logger.info('--Failed to delete TODO--', {
      key: 'deleteTodo'
    })
    logger.info(e, {
      key: 'deleteTodo'
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
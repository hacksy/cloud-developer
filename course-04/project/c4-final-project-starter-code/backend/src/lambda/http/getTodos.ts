import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getTodos } from '../../businessLogic/todos';
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  const logger = createLogger('getTodos')

  try{
    const todos = await getTodos(userId)
    logger.info('--Listing Todos--', {
      key: 'getTodos'
    })
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 201,
      body: JSON.stringify({
        items: todos
      })
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
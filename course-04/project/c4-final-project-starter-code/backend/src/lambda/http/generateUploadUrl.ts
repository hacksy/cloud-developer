import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const bucketName = process.env.TODOS_S3_BUCKET
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todosIndex = process.env.TODOS_INDEX
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const logger = createLogger('generateUploadUrl')

  try{
    await todoUpdate(userId, todoId)
    const url = getUploadUrl(todoId)
    logger.info('--S3 Upload Url Generated--', {
      key: 'generateUploadUrl'
    })
    return {
    	headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
      },
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  } catch(e) {
    return {
      headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
      },
      statusCode: 404,
      body: JSON.stringify({
        error: 'Cannot generate signedUrl'
      })
    }
   }
}
async function todoUpdate(userId: string, todoId: string) {
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: todosIndex,
    KeyConditionExpression: 'userId = :userId and todoId = :todoId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':todoId': todoId
    }
  })
  .promise()
  if(result.Count === 0){
    throw new Error('Invalid todoId')
  }

  const todoItem = result.Items[0]
  await docClient.update({
    TableName: todosTable,
    Key:{
      "userId": todoItem.userId,
      "createdAt": todoItem.createdAt
    },
    UpdateExpression: "set attachmentUrl=:attachmentUrl",
    ExpressionAttributeValues:{
        ":attachmentUrl":`https://${bucketName}.s3.amazonaws.com/${todoId}`,
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()
}
function getUploadUrl(imageId: string): string {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: urlExpiration,
    });
}
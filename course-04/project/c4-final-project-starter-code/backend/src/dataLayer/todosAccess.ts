import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todosAccess')

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODO_ID_INDEX) {
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeNames:{
        ':userId': userId
      },
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem as TodoItem
  }
  async deleteTodo(userId: string, todoId: string): Promise<boolean> {
    const todoItem = await this.getTodo(userId, todoId)
    await this.docClient.delete({
      TableName: this.todosTable,
       Key:{
        "userId": todoItem.userId,
        "createdAt": todoItem.createdAt
      },
      ConditionExpression:"userId = :userId",
    }).promise()
    return true
  }

  async getTodo(userId: string, todoId: string): Promise<TodoItem>{
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeValues:{
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()
    
        if (result.Count === 0){
            throw new Error('Todo not found')
        }
        const todoItem = result.Items[0];
        return todoItem as TodoItem
    }

    async updateTodo(userId: string, todoId: string, updatedTodoRequest: UpdateTodoRequest){    
        const todoItem = await this.getTodo(userId, todoId)
      
        await this.docClient.update({
            TableName: this.todosTable,
            Key:{
                "userId": todoItem.userId,
                "createdAt": todoItem.createdAt
            },
            UpdateExpression: "set done=:done, dueDate=:dueDate, #name=:name",
            ExpressionAttributeValues:{
                ":done":updatedTodoRequest.done,
                ":dueDate":updatedTodoRequest.dueDate,
                ":name":updatedTodoRequest.name,
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ReturnValues:"UPDATED_NEW"
        }).promise()
    }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

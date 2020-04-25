import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODO_ID_INDEX) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')
    const todosIndex = this.todosIndex
    const result = await this.docClient.query({
      TableName: this.todosTable,
      ExpressionAttributeNames:{
        todosIndex: userId
      },
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createToDo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }
  async deleteToDo(todoId: String, userId: String): Promise<boolean> {
    const todosIndex = this.todosIndex

    await this.docClient.delete({
      TableName: this.todosTable,
       Key:{
        todosIndex: todoId,
      },
      ConditionExpression:"userId = :userId",
    }).promise()
    return true
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

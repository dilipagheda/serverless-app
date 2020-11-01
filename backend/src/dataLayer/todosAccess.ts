import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { BadRequestError } from '../validation/BadRequestError'

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log(`Getting all todo items for user: ${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()

    return todoItem
  }

  async updateTodoItem(
    todoItem: TodoUpdate,
    userId: string,
    todoId: string
  ): Promise<TodoItem> {
    console.log(todoItem)

    var params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set #n = :name, dueDate=:dueDate, done=:done',
      ExpressionAttributeValues: {
        ':name': todoItem.name,
        ':dueDate': todoItem.dueDate,
        ':done': todoItem.done
      },
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ReturnValues: 'UPDATED_NEW'
    }

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId and todoId = :todoId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId': todoId
        }
      })
      .promise()

    if(result.Items.length === 0)
    {
      throw new BadRequestError("todoId does not exist!")
    }
    const newData = await this.docClient.update(params).promise()
    return {
      ...result[0],
      ...newData.Attributes
    } as TodoItem

  }


  async getTodoItemById(
    userId: string,
    todoId: string
  ): Promise<TodoItem> {

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId and todoId = :todoId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId': todoId
        }
      })
      .promise()

    if(result.Items.length === 0)
    {
     return null
    }

    return result.Items[0] as TodoItem
  }


  async updateAttachmentForTodoItem(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ) {

    var params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl,
      },
      ReturnValues: 'UPDATED_NEW'
    }

    await this.docClient.update(params).promise()
  }

  async deleteTodoItem(
    userId: string,
    todoId: string
  ) {

    var params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }

    await this.docClient.delete(params).promise()
  }  
}

function createDynamoDBClient() {
  return new AWS.DynamoDB.DocumentClient()
}

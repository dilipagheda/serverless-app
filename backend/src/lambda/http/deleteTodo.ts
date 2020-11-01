import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { deleteAttachment } from './utils'
import { getTodoItemById, deleteTodoItem } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const authHeader = event.headers.Authorization

  try {
    //1. check if todoId already exists and has an attachment Url
    const todoItem = await getTodoItemById(authHeader, todoId)
    if (todoItem) {
      if (todoItem.attachmentUrl) {
        //2. delete current attachment first
        await deleteAttachment(todoItem.attachmentUrl)
        logger.log({
          level: 'info',
          message: 'delete s3 object successful'
        })
      }
      await deleteTodoItem(authHeader, todoId)
      logger.log({
        level: 'info',
        message: 'delete dynamodb record successful'
      })
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({})
      }
    } else {
      //return bad request
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'todo item does not exist!'
        })
      }
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: error
    })
  }
}

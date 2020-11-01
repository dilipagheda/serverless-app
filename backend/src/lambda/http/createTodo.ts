import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodoItem } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const authHeader = event.headers.Authorization

  try {
    if (newTodo.name.length === 0) {
      logger.log({
        level: 'error',
        message: 'todo name can not be empty. returning 400'
      })

      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'todo name can not be empty!'
        })
      }
    }
    const newToDoItem = await createTodoItem(newTodo, authHeader)

    logger.log({
      level: 'info',
      message: 'create successful'
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: newToDoItem
      })
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: error
    })
  }
}

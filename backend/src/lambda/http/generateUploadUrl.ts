import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import * as AWSXRay from 'aws-xray-sdk'
import {
  getTodoItemById,
  updateAttachmentForTodoItem
} from '../../businessLogic/todos'
import { deleteAttachment } from './utils'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')
const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const authHeader = event.headers.Authorization
  const todoId = event.pathParameters.todoId

  try {
    //1. check if todoId already exists and has an attachment Url
    const todoItem = await getTodoItemById(authHeader, todoId)
    if (todoItem) {
      if (todoItem.attachmentUrl) {
        //2. delete current attachment
        await deleteAttachment(todoItem.attachmentUrl)
        logger.log({
          level: 'info',
          message: 'delete s3 object successful'
        })
      }
    } else {
      logger.log({
        level: 'error',
        message: 'todo item is not found in dynamodb'
      })
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

    //3. generate new image id
    const imageId = uuid.v4()
    //4. genereate a signed URL for put object operation
    const url = getUploadUrl(imageId)
    //5. update the dynamodb with new image id
    const getUrl = `https://${bucketName}.s3-ap-southeast-2.amazonaws.com/${imageId}`
    await updateAttachmentForTodoItem(authHeader, todoItem.todoId, getUrl)
    logger.log({
      level: 'info',
      message: `upload url is successfully generated as ${url}`
    })
    //6. return a signed url
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: error
    })
  }
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}

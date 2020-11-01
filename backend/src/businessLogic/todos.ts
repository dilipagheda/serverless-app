import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId, getToken } from '../auth/utils'
import { TodoUpdate } from '../models/TodoUpdate'

const todosAccess = new TodoAccess()

export async function getAllTodos(authHeader: string): Promise<TodoItem[]> {
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)
  return todosAccess.getAllTodos(userId)
}

export async function createTodoItem(
  createTodoRequest: CreateTodoRequest,
  authHeader: string
): Promise<TodoItem> {
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)
  const itemId = uuid.v4()

  return await todosAccess.createTodoItem({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  })
}

export async function updateTodoItem(
  updateTodoRequest: UpdateTodoRequest,
  authHeader: string,
  todoId: string
): Promise<TodoItem> {
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)

  const updateInfo: TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }

  return await todosAccess.updateTodoItem(updateInfo, userId, todoId)
}

export async function getTodoItemById(authHeader: string,
  todoId: string
): Promise<TodoItem> {

  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)

  return await todosAccess.getTodoItemById(userId, todoId)
}

export async function updateAttachmentForTodoItem(authHeader: string,
  todoId: string, attachmentId: string)
{
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)
  await todosAccess.updateAttachmentForTodoItem(userId,todoId, attachmentId)
}

export async function deleteTodoItem(authHeader: string,
  todoId: string)
{
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)
  await todosAccess.deleteTodoItem(userId,todoId)
}

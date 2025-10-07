/**
 * Example: How to integrate notifications into the analysis workflow
 * 
 * This file demonstrates how to send notifications to users when
 * process analysis completes, both for success and failure cases.
 */

import { Dao } from '@/lib/db/mysql'
import { analyze } from '@/lib/ai/analysis'
import { getCurrentUser } from '@/lib/user'

/**
 * Example 1: Send notification when analysis completes successfully
 */
export async function analyzeProcessWithNotification(
  batchName: string | undefined,
  dossierNumber: string,
  kind: string | undefined,
  complete: boolean
) {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const username = user.preferredUsername || user.name
  const user_id = await Dao.assertIAUserId(username)

  try {
    // Perform the analysis
    const result = await analyze(batchName, dossierNumber, kind, complete)

    // Send success notification
    await Dao.createNotification({
      user_id,
      title: 'Análise Concluída',
      message: `A análise do processo ${dossierNumber} foi concluída com sucesso. ${result.generatedContent.length} produtos foram gerados.`,
      type: 'success',
      link: `/process/${dossierNumber}`
    })

    return result
  } catch (error) {
    // Send error notification
    await Dao.createNotification({
      user_id,
      title: 'Erro na Análise',
      message: `Ocorreu um erro ao analisar o processo ${dossierNumber}: ${error.message}`,
      type: 'error',
      link: `/process/${dossierNumber}`
    })

    throw error
  }
}

/**
 * Example 2: Send notification when batch processing completes
 */
export async function notifyBatchCompletion(
  batchName: string,
  processedCount: number,
  failedCount: number
) {
  const user = await getCurrentUser()
  if (!user) return

  const username = user.preferredUsername || user.name
  const user_id = await Dao.assertIAUserId(username)

  const totalCount = processedCount + failedCount
  const hasFailures = failedCount > 0

  await Dao.createNotification({
    user_id,
    title: 'Processamento em Lote Concluído',
    message: `O lote "${batchName}" foi processado. ${processedCount} de ${totalCount} processos foram analisados com sucesso.${hasFailures ? ` ${failedCount} processos falharam.` : ''}`,
    type: hasFailures ? 'warning' : 'success',
    link: `/batch/${batchName}`
  })
}

/**
 * Example 3: Send notification for long-running operations
 */
export async function notifyLongRunningOperation(
  user_id: number,
  operationType: string,
  status: 'started' | 'in_progress' | 'completed' | 'failed',
  details?: string
) {
  const messages = {
    started: {
      title: `${operationType} Iniciado`,
      message: `A operação foi iniciada. Você será notificado quando for concluída.`,
      type: 'info'
    },
    in_progress: {
      title: `${operationType} em Andamento`,
      message: details || 'A operação está em andamento...',
      type: 'info'
    },
    completed: {
      title: `${operationType} Concluído`,
      message: details || 'A operação foi concluída com sucesso.',
      type: 'success'
    },
    failed: {
      title: `${operationType} Falhou`,
      message: details || 'A operação falhou. Por favor, tente novamente.',
      type: 'error'
    }
  }

  const notification = messages[status]

  await Dao.createNotification({
    user_id,
    title: notification.title,
    message: notification.message,
    type: notification.type
  })
}

/**
 * Example 4: Send notification with custom link
 */
export async function notifyWithCustomAction(
  user_id: number,
  title: string,
  message: string,
  actionUrl: string
) {
  await Dao.createNotification({
    user_id,
    title,
    message,
    type: 'info',
    link: actionUrl
  })
}

/**
 * Example 5: Notify user about system updates or announcements
 */
export async function notifySystemUpdate(
  message: string,
  affectedUsers?: number[]
) {
  // If specific users are provided, notify only them
  if (affectedUsers && affectedUsers.length > 0) {
    for (const user_id of affectedUsers) {
      await Dao.createNotification({
        user_id,
        title: 'Atualização do Sistema',
        message,
        type: 'info'
      })
    }
  } else {
    // This would require a new DAO method to get all active users
    // For now, this is just a placeholder
    console.log('System-wide notification:', message)
  }
}

/**
 * Example 6: Use in an API route
 * 
 * In app/api/v1/batch/[name]/[number]/route.ts:
 * 
 * export async function POST(req: Request, { params }: { params: { name: string, number: string } }) {
 *   const { name, number } = params
 *   const url = new URL(req.url)
 *   const complete: boolean = url.searchParams.get('complete') === 'true'
 *   
 *   try {
 *     const user = await getCurrentUser()
 *     if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })
 * 
 *     const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
 * 
 *     // Send notification that analysis started
 *     await Dao.createNotification({
 *       user_id,
 *       title: 'Análise Iniciada',
 *       message: `Iniciando análise do processo ${number}...`,
 *       type: 'info'
 *     })
 * 
 *     const msg = await analyze(name, number, 'RELATORIO_DE_ACERVO', complete)
 * 
 *     // Send notification that analysis completed
 *     await Dao.createNotification({
 *       user_id,
 *       title: 'Análise Concluída',
 *       message: `A análise do processo ${number} foi concluída com sucesso`,
 *       type: 'success',
 *       link: `/process/${number}`
 *     })
 * 
 *     return Response.json({ status: 'OK', msg })
 *   } catch (error) {
 *     console.error('Erro analisando', error)
 *     return Response.json({ errormsg: error.message }, { status: 500 })
 *   }
 * }
 */

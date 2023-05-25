import { Events, PermissionsBitField, TextChannel } from 'discord.js'

import { StickyMessage } from '@prisma/client'

import { STICKY_CACHE_PREFIX } from '@/features/stickyMessage/index'
import { prisma } from '@/prisma'
import { defineEventHandler } from '@/types/defineEventHandler'
import { getCache, removeCache } from '@/utils/cache'
import { sendDm } from '@/utils/discord'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: false,
  execute: async (_botContext, message) => {
    if (!message.content.startsWith('?stickao-remove')) {
      return
    }

    const channel = message.channel as TextChannel

    // Check if the user has the 'MANAGE_MESSAGES' permission
    const authorPermissions = channel.permissionsFor(message.author)
    if (!authorPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
      sendDm(message, {
        content:
          'You must have the "Manage Messages" permission to use this command.',
      })
      return
    }

    try {
      // Retrieve the sticky message with the specified order from the database
      const stickyMessageEntity = getCache(
        `${STICKY_CACHE_PREFIX}-${message.channelId}`,
      ) as StickyMessage

      // If the sticky message exists, remove it from the database
      if (stickyMessageEntity) {
        await prisma.stickyMessage.delete({
          where: {
            channelId: message.channelId,
          },
        })
        removeCache(`${STICKY_CACHE_PREFIX}-${message.channelId}`)

        const stickyMessage = await channel.messages.fetch(
          stickyMessageEntity.messageId,
        )

        await stickyMessage.delete()

        console.info(`Sticky message removed: ${stickyMessageEntity.message}`)
        sendDm(message, {
          content: 'Successfully removed the sticky message.',
        })
      } else {
        sendDm(message, {
          content: 'Not found message in this channel',
        })
      }
    } catch (error) {
      console.error(
        `Error removing sticky message: ${(error as Error).message}`,
      )
      sendDm(message, {
        content: 'An error occurred while removing the sticky message.',
      })
    } finally {
      await message.delete()
    }
  },
})

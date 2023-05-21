import { Environment } from '../../config.js'

import { isChannelLock, lockChannel, unlockChannel } from './lockChannel.js'

interface ChannelCounter {
  [channelId: string]: number
}

const messageInChannelCounter: ChannelCounter = {}

/**
 * Increase counter of the message that was sent in the channel
 *
 * @param channelId - the id of channel that message want sent
 *
 */
export function incCounter(channelId: string): void {
  if (!++messageInChannelCounter[channelId]) {
    messageInChannelCounter[channelId] = 1
  }
}

/**
 * Reset the counter
 *
 * @param channelId - the id of channel of counter that want to reset
 *
 */
export function resetCounter(channelId: string): void {
  messageInChannelCounter[channelId] = 0
}

/**
 * Get current message count
 *
 * @param channelId - the id of channel that message want sent
 *
 */
export function getCounter(channelId: string): number {
  return messageInChannelCounter[channelId]
}

interface ChannelCooldown {
  [channelId: string]: NodeJS.Timeout
}

const channelCooldown: ChannelCooldown = {}

/**
 * set cooldown of the channel
 *
 * @param channelId - the id of channel that want to reset cooldown
 *
 */
export function resetCooldown(channelId: string): void {
  lockChannel(channelId)

  const cooldown = channelCooldown[channelId]
  if (channelCooldown[channelId]) {
    cooldown.refresh()
    return
  }

  const timeoutId = setTimeout(() => {
    unlockChannel(channelId)
  }, Environment.MESSAGE_COOLDOWN_SEC)

  channelCooldown[channelId] = timeoutId
}

/**
 * check is need to update the sticky message to bottom of channel
 *
 * @param channelId - the id of channel that want to check
 * @returns true if need to update otherwise false.
 *
 */
export function isNeedToUpdateMessage(channelId: string): boolean {
  //! channel lock cooldown and message >= 5 push -> cooldown
  // channel unlock and message < 5 push
  // channel lock cooldown and message < 5 do nothing
  //! channel lock available and message >= 5 do nothing -> doing task

  const count = getCounter(channelId)

  if (count >= Environment.MESSAGE_MAX) {
    return true
  }

  return !isChannelLock(channelId, true) && count < Environment.MESSAGE_MAX
}

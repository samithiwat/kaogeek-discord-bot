import { CommandHandlerConfig } from '@/types/CommandHandlerConfig'

import ping from './info/ping.js'
import activeThreads from './moderators/activeThreads.js'
import deleteAllMessage from './moderators/deleteAllMessage.js'
import inspectProfile from './moderators/inspectProfile.js'
import report from './moderators/report.js'
import stickyMessage from './moderators/stickyMessage.js'
import user from './moderators/user.js'
import inspectConfig from './runtimeConfig/inspectConfig.js'
import reloadConfig from './runtimeConfig/reloadConfig.js'

export default [
  activeThreads,
  deleteAllMessage,
  inspectConfig,
  ...inspectProfile,
  ...stickyMessage,
  ping,
  reloadConfig,
  report,
  user,
] satisfies CommandHandlerConfig[]

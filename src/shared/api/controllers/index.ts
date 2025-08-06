export { BaseController } from '../BaseController'
export { UserController } from './UserController'
export { LeadController } from './LeadController'

// Controller instances - lazy initialization
import { UserController } from './UserController'
import { LeadController } from './LeadController'

export const userController = new UserController()
export const leadController = new LeadController()
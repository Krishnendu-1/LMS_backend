import express from 'express'
import { checkHealth } from '../controller/healthCheck.controller.js'



const healthCheckRoute=express.Router()

healthCheckRoute.get('/',checkHealth);

export default healthCheckRoute
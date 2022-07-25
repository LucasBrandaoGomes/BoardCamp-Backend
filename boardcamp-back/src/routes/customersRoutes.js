import { Router } from "express"
import { GetCustomers, PostCustomers, UpdateCustomers } from "../controllers/customersControllers.js"

const router = Router()

router.post('/customers', PostCustomers)
router.get('/customers/:id', GetCustomers)
router.put('/customers/:id', UpdateCustomers)

export default router;
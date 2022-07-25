import { Router } from "express"
import { GetCustomerByCPF, GetCustomersById, PostCustomers, UpdateCustomers } from "../controllers/customersControllers.js"

const router = Router()

router.post('/customers', PostCustomers)
router.get('/customers/:id', GetCustomersById)
router.get('/customers', GetCustomerByCPF)
router.put('/customers/:id', UpdateCustomers)

export default router;
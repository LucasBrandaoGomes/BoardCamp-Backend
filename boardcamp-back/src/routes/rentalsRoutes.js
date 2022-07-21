import { Router } from "express"
import { GetRentals } from "../controllers/rentalsController.js"

const router = Router()

router.get('/rentals', GetRentals)

export default router;
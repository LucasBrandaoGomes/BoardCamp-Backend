import { Router } from "express"
import { DeleteRental, EndRental, GetRentals, PostRentals } from "../controllers/rentalsController.js"

const router = Router()

router.post('/rentals', PostRentals);
router.get('/rentals', GetRentals);
router.post('/rentals/:id/return', EndRental)
router.delete('/rentals/:id', DeleteRental)

export default router;
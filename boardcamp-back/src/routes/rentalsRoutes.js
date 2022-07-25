import { Router } from "express"
import { GetRentals, PostRentals } from "../controllers/rentalsController.js"

const router = Router()

router.post('/rentals', PostRentals);
router.get('/rentals', GetRentals);

export default router;
import { Router } from "express"
import { PostCategory, GetCategories } from "../controllers/categoriesController.js"

const router = Router()

router.post('/categories', PostCategory)
router.get('/categories', GetCategories)

export default router;
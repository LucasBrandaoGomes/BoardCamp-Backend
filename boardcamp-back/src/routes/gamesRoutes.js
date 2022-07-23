import { Router } from "express"
import { PostGames, GetGames } from "../controllers/gamesController.js"

const router = Router()

router.post('/games', PostGames)
router.get('/games', GetGames)

export default router;
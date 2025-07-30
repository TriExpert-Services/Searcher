import { Router } from 'express';
import { searchController } from '../controllers/searchController.js';
import { validateSearch } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', validateSearch, asyncHandler(searchController.search));
router.get('/suggestions', asyncHandler(searchController.getSuggestions));
router.post('/index', asyncHandler(searchController.indexData));
router.delete('/index', asyncHandler(searchController.clearIndex));

export { router as searchRoutes };
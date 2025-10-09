import express from 'express';

import { requireAuth } from '@clerk/express';
import { globalStyleValidator, isRequestValidated } from '../validator/styleValidator';
import { createStyle, deleteStyle, getStyle, updateStyle } from '../controllers/style.controller';

const router = express.Router();

router.get("/styles", getStyle);
router.post('/styles', globalStyleValidator,isRequestValidated, createStyle);
router.patch("/style/:id",  globalStyleValidator,isRequestValidated, updateStyle);
router.delete("/style/:id", deleteStyle);

export default router;

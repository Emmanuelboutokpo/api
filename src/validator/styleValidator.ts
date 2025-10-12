import { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

export const globalStyleValidator = [
  check('model')
    .notEmpty().withMessage('Le nom du modèle est obligatoire.')
    .isString().withMessage('Le modèle doit être une chaîne de caractères.'),
];

export const isRequestValidated = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.array().length > 0 ) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};
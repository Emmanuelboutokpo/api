import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

export const globalMesureValidator = [
  body('clientId')
    .isInt({ min: 1 })
    .withMessage('Le clientId doit être un entier valide'),

  body('tableauDeMesures')
    .isArray({ min: 1 })
    .withMessage('Le tableauDeMesures doit être un tableau non vide'),

  body('tableauDeMesures.*.label')
    .notEmpty()
    .withMessage('Le nom de la mesure est requis'),

  body('tableauDeMesures.*.valeur')
    .notEmpty()
    .withMessage('La valeur de la mesure est requise')
];

export const isRequestValidated = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.array().length > 0 ) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};
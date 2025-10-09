import { body, param } from 'express-validator';

export const addMesureToTableauValidator = [
  param('mesureId')
    .isInt({ min: 1 })
    .withMessage('L’ID de la mesure manuelle doit être valide'),

  body('label')
    .notEmpty()
    .withMessage('Le nom de la mesure est requis'),

  body('valeur')
    .notEmpty()
    .withMessage('La valeur de la mesure est requise')
];

export const updateMesureTableauValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('L’ID doit être valide'),

  body('label')
    .optional()
    .notEmpty()
    .withMessage('Le nom de la mesure ne peut pas être vide'),

  body('valeur')
    .optional()
    .notEmpty()
    .withMessage('La valeur de la mesure ne peut pas être vide')
];

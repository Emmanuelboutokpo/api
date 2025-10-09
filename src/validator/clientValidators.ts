import { check, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const globalClientValidators = [
  check('firstName')
    .notEmpty().withMessage('Le prénom est obligatoire')
    .isLength({ min: 3, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/).withMessage('Le prénom ne peut contenir que des lettres')
    .trim()
    .escape(),

  check('lastName')
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 3, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/).withMessage('Le nom ne peut contenir que des lettres')
    .trim()
    .escape(),

  // ✅ TELEPHONE INTERNATIONAL SIMPLE
  check('telephone')
    .notEmpty().withMessage('Le téléphone est obligatoire')
    .isLength({ min: 8, max: 20 }).withMessage('Le téléphone doit contenir entre 8 et 20 caractères')
    .matches(/^[\+]?[1-9][\d\s\-\(\)]{7,18}$/).withMessage('Veuillez entrer un numéro de téléphone valide')
    .custom((value: string) => {
      // Compter uniquement les chiffres
      const digitCount = (value.match(/\d/g) || []).length;
      if (digitCount < 8) {
        throw new Error('Le numéro doit contenir au moins 8 chiffres');
      }
      if (digitCount > 15) {
        throw new Error('Le numéro ne peut pas contenir plus de 15 chiffres');
      }
      return true;
    })
    .trim(),

  check('adresse')
    .optional()
    .isLength({ max: 200 }).withMessage('L\'adresse ne peut pas dépasser 200 caractères')
    .trim()
    .escape(),

  check('gender')
    .optional()
    .isIn(['M', 'F', 'OTHER']).withMessage('Le genre doit être M ou F'),
];

export const isRequestValidated = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.array().length > 0 ) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};
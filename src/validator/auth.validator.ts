import { NextFunction, Request, Response } from 'express';
import { body, check, validationResult } from 'express-validator';

export const emailPasswordValidator = [
  check('email')
    .notEmpty()
    .withMessage("L'email est requis")
    .bail()
    .isEmail()
    .withMessage("Format d'email invalide"),

  check('password')
    .notEmpty()
    .withMessage("Le mot de passe est requis")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères")
];

export const isRequestValidated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (errors.array().length > 0) {
    return res.status(400).json({
      error: errors.array()[0].msg
    });
  }

  next();
};

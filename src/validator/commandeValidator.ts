 import { body } from 'express-validator';

export const createCommandeRules = [
  body('clientId').optional().isInt(),
  body('client').optional().isObject(),
  body('style').optional().isObject(),
  body('client.firstName').if(body('client').exists()).notEmpty(),
  body('client.lastName').if(body('client').exists()).notEmpty(),
  body('client.telephone').if(body('client').exists()).notEmpty(),
  body('dateLivraisonPrevue').notEmpty().isISO8601().toDate(),
  body('prix').notEmpty().isFloat({ gt: 0 }),
  body('montantAvance').optional().isFloat({ min: 0 }),
  body('employeId').notEmpty().isInt(),
  body('styleId').notEmpty().isInt(),
];

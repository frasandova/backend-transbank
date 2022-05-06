const { check } = require('express-validator') //TODO <---
const { validarCampos } = require('../helpers/validateHelper')

const validateCreateTransaction = [
    // check('rut', 'rut requerido')
    //     .not()
    //     .isEmpty(),
    check('nombre', 'nombre requerido')
        .not()
        .isEmpty()
        .isLength({ min: 2 }).withMessage('minimo 2 caracteres'),
    check('apellido_paterno', 'apellido_paterno requerido')
        .not()
        .isEmpty()
        .isLength({ min: 2 }).withMessage('apellido_paterno minimo 2 caracteres'),
    check('apellido_materno', 'apellido_materno requerido')
        .exists()
        .not()
        .isEmpty()
        .isLength({ min: 2 }).withMessage('apellido_materno minimo 2 caracteres'),
    check('email')
        .exists()
        .isEmail().withMessage('email formato invalido'),
    check('monto', 'monto requerido')
        .exists()
        // .isNumeric({min: 10, max: 99 }),
        .isInt({min: 1}).withMessage('monto debe ser mayor a 0'),
    (req, res, next) => {
        validarCampos(req, res, next)
    }

    //Custom validator
    // check('age')
    //     .exists()
    //     .isNumeric()
    //     .custom((value, { req }) => {
    //         //TODO: 18
    //         if (value < 18 || value > 40) {
    //             throw new Error('Rango de edad debe ser entre 18 y 40')
    //         }
    //         return true
    //     })
    // ,
]

module.exports = { validateCreateTransaction }
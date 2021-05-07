const {
    body,
    param,
    validationResult
} = require('express-validator');


exports.transferValidationRules = () => {
    return [
        body("DBC").notEmpty().trim().escape().withMessage("DBC is required"),
        body("CDA").notEmpty().trim().escape().withMessage("CDA is required"),
        body("AN").notEmpty().trim().escape().withMessage("AN is required"),
        body("ON").notEmpty().trim().escape().withMessage("ON is required"),
        body("REF").notEmpty().trim().escape().withMessage("REF is required"),
        body("AMT").notEmpty().trim().escape().withMessage("AMT is required"),
        body("INA").notEmpty().trim().escape().withMessage("INA is required"),  
    ]
}


exports.validate = (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            return next()
        }
        const extractedErrors = []
        errors.array().map(err => extractedErrors.push({
            [err.param]: err.msg
        }))

        console.log(extractedErrors);

        return res.status(422).json({
            errors: extractedErrors,
        })

    } catch(err) {
        res.status(401).json({
            error: "Unauthorized",
            status: "error"
        })
    }
}
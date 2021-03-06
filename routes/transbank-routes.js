const { Router } = require('express');
const router = Router();
const transbankController = require('../controllers/transbank-controller');
const WebpayPlus = require("transbank-sdk").WebpayPlus;
const { validateCreateTransaction } = require('../validators/transbank')

router.use(function (req, res, next) {
  if (process.env.WPP_CC && process.env.WPP_KEY) {
    WebpayPlus.configureForProduction(process.env.WPP_CC, process.env.WPP_KEY);
  } else {
    WebpayPlus.configureForTesting();
  }
  next();
});

// Mejorar variables de Entorno Local y Produccion //OK
// Mejora validacion de campos en requeridos en peticiones Post y Get //OK
// incorporar cors OK //OK
// variables de produccion para transbank //OK

router.get('/getenv',
    transbankController.GetEnv
);

router.get('/firestore',
    transbankController.saveDataFirestore
);

router.post('/api/transbank/createTransaction',
    [validateCreateTransaction],
    transbankController.createTransaction
);

router.get('/api/transbank/commit',
    transbankController.commit
);

router.post('/api/transbank/commit',
    transbankController.commit
);

// router.get('api/transbank/getResultTransaction/:token',
//   transbankController.getResultTransaction
// );

router.get('/api/transbank/getResultTransaction/:token',
  transbankController.getResultTransaction
);



module.exports = router;
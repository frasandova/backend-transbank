const { Router } = require('express');
const router = Router();

const transbankController = require('../controllers/transbank-controller')

router.get('/api/transbank/createToken',
    transbankController.createTokenTransbank
);

router.put('/api/transbank/putToken/:id',
    transbankController.putToken
);

router.delete('/api/transbank/deleteToken',
    transbankController.deleteTokenTransbank
);

router.post('/api/transbank/sendFormTransbank',
    transbankController.sendFormTransbank
);


module.exports = router;
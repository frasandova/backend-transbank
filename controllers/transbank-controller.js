const WebpayPlus = require("transbank-sdk").WebpayPlus;
const asyncHandler = require("../utils/async_handler");
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

// const serviceAccount = require('./firebase/credentials/backend-musikastudio-f66ca6d09c6e.json');
const serviceAccount = require('../firebase/credentials/backend-musikastudio-f66ca6d09c6e.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// const Environment = require('transbank-sdk').Environment;

// WebpayPlus.commerceCode = 597055555532;
// WebpayPlus.apiKey = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
// WebpayPlus.environment = Environment.Integration;

exports.saveDataFirestore = async (req,res) => {

const docRef = db.collection('users').doc('alovelace');

await docRef.set({
  first: 'Ada',
  last: 'Lovelace',
  born: 1815
});

res.status(200).json({
  ok:true,
  message: 'usuarios guardados'
})

}

exports.createTransaction= async (req, res) => {
    console.log('createTransaction Post');
    console.log('req.body', req.body)
    
    let { monto = '' }  = req.body;
    if(monto ===''){
      res.status('200').json({
        ok:false,
        message: 'Campo Monto es Requerido' 
      })
    }
    let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
    let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
    // let amount = Math.floor(Math.random() * 1000) + 1001;
    let amount = monto;
 
    const host = process.env.ENVIROMENT === 'desa' 
                 ? 'http://localhost:8081'
                 : 'https://backend-transbank.herokuapp.com'


    // let returnUrl =
    // req.protocol + "://" + "localhost:8081" + "/api/transbank/commit";

    // let returnUrl =
    // req.protocol + "://" + "localhost:8081" + "/api/transbank/commit";

    // let returnUrl =
    // req.protocol + "://" + req.get("host") + "/api/transbank/commit";

    let returnUrl =
    req.protocol + "://" + req.get("host") + "/api/transbank/commit";

    const createResponse = await (new WebpayPlus.Transaction()).create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );
  
    let token = createResponse.token;
    let url = createResponse.url;

      res.render('webpay_request',{
        urlWebPay:url,
        token:token
    })
}

exports.commit = asyncHandler(async function (request, response, next) {
  console.log('Entro Commit')
  //Flujos:
  //1. Flujo normal (OK): solo llega token_ws
  //2. Timeout (más de 10 minutos en el formulario de Transbank): llegan TBK_ID_SESION y TBK_ORDEN_COMPRA
  //3. Pago abortado (con botón anular compra en el formulario de Webpay): llegan TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA
  //4. Caso atipico: llega todos token_ws, TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA
  // console.log("================================================================================");
  // console.log(request);
  // console.log("================================================================================");
  let params = request.method === 'GET' ? request.query : request.body;
  console.log('params', params)


  let token = params.token_ws;
  let tbkToken = params.TBK_TOKEN;
  let tbkOrdenCompra = params.TBK_ORDEN_COMPRA;
  let tbkIdSesion = params.TBK_ID_SESION;

  let step = null;
  // let stepDescription = null;
  // let viewData = {
  //   token,
  //   tbkToken,
  //   tbkOrdenCompra,
  //   tbkIdSesion
  // };

  if (token && !tbkToken) {//Flujo 1
    console.log('Entro Transaction')
    
    const commitResponse = await (new WebpayPlus.Transaction()).commit(token);
    const { 
        amount,
        status,
        buy_order,
        session_id,
        card_detail,
        accounting_date,
        transaction_date,
        authorization_code,
        payment_type_code,
        response_code,
        installments_number
    } = commitResponse;
    viewData = {
      token,
      commitResponse,
    };
    step = "Transacción Procesada";
    stepDescription = "En este paso tenemos que confirmar la transacción con el objetivo de avisar a " +
      "Transbank que hemos recibido la transacción ha sido recibida exitosamente. En caso de que " +
      "no se confirme la transacción, ésta será reversada.";

    response.render('webpay_response_success',{
        // urlRedirect: `http://localhost:3000/transbak-response?token=${tbkToken}&mesagge=${step}`,
        // urlRedirect: `http://localhost:3000/transbak-response`,
        urlRedirect: `https://www.musikastudio.online/transbak-response`,
        step,        
        amount,
        status,
        buy_order,
        session_id,
        card_detail: card_detail.card_number,
        accounting_date,
        transaction_date,
        authorization_code,
        payment_type_code,
        response_code,
        installments_number
        
    })
    return;
  }
  else if (!token && !tbkToken) {//Flujo 2
    step = "El pago fue anulado por tiempo de espera.";
    stepDescription = "En este paso luego de anulación por tiempo de espera (+10 minutos) no es necesario realizar la confirmación ";
  }
  else if (!token && tbkToken) {//Flujo 3
    step = "El pago fue anulado por el usuario.";
    stepDescription = "En este paso luego de abandonar el formulario no es necesario realizar la confirmación ";
  }
  else if (token && tbkToken) {//Flujo 4
    step = "El pago es inválido.";
    stepDescription = "En este paso luego de abandonar el formulario no es necesario realizar la confirmación ";
  }

  response.render('webpay_response_error',{
    // urlRedirect: `http://localhost:3000/transbak-response`,
    urlRedirect: `https://www.musikastudio.online/transbak-response`,
    step,
    token,
    tbkToken,
    tbkOrdenCompra,
    tbkIdSesion
    })

//   response.render("webpay_plus/commit-error", {
//     step,
//     stepDescription,
//     viewData,
//   });
});





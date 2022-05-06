const WebpayPlus = require("transbank-sdk").WebpayPlus;
const asyncHandler = require("../utils/async_handler");
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

// const serviceAccount = require('./firebase/credentials/backend-musikastudio-f66ca6d09c6e.json');
// const serviceAccount = require('../firebase/credentials/backend-musikastudio-f66ca6d09c6e.json');
const { json } = require("express");
// initializeApp({
//   credential: cert(serviceAccount)
// });

const urlBase= process.env.NODE_ENV === 'desa' 
               ? 'http://localhost:3000'
               : 'https://www.musikastudio.online'

const urlBaseBackend= process.env.NODE_ENV === 'desa' 
               ? 'http://localhost:8081'
               : 'https://backend-transbank.herokuapp.com'

initializeApp({
  credential: applicationDefault(),
  // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

const db = getFirestore();




// const Environment = require('transbank-sdk').Environment;

// WebpayPlus.commerceCode = 597055555532;
// WebpayPlus.apiKey = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
// WebpayPlus.environment = Environment.Integration;

exports.GetEnv = async (req, res) => {
  return res.status(200).json({
    ok:true,
    ambiente: process.env.NODE_ENV
  })
}

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
    
    let { 
      nombre, 
      apellido_paterno, 
      apellido_materno, 
      email,
      monto,
      nombre_alumno = "", 
      apellido_paterno_alumno = "", 
      apellido_materno_alumno = "",
    }  = req.body;

    let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
    let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
    // let amount = Math.floor(Math.random() * 1000) + 1001;
    let amount = monto;
 
    // const host = process.env.ENVIROMENT === 'desa' 
    //              ? 'http://localhost:8081'
    //              : 'https://backend-transbank.herokuapp.com'


    // let returnUrl =
    // req.protocol + "://" + "localhost:8081" + "/api/transbank/commit";

    // let returnUrl =
    // req.protocol + "://" + "localhost:8081" + "/api/transbank/commit";

    // let returnUrl =
    // req.protocol + "://" + req.get("host") + "/api/transbank/commit";

    // let returnUrl =
    // req.protocol + "://" + req.get("host") + "/api/transbank/commit";

    let returnUrl = `${urlBaseBackend}/api/transbank/commit`;

    // let returnUrl = 'https://www.musikastudio.online/transbank-response';

    const createResponse = await (new WebpayPlus.Transaction()).create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );
  
    let token = createResponse.token || null;
    let url = createResponse.url  || null;

    // console.log(token)
    // console.log(url)
    if(token && url){
      console.log('entro')
      // await db.collection('TRANSACCIONES').doc(`${token}_${rut}_${monto}`).set({
        await db.collection('TRANSACCIONES').doc(token).set({
        nombre: nombre,
        apellido_paterno: apellido_paterno,
        apellido_materno:apellido_materno,
        email: email,
        monto: monto,
        nombre_alumno, 
        apellido_paterno_alumno, 
        apellido_materno_alumno,
        buyOrder,
        sessionId,
        returnUrl
      })
    }
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

      await db.collection('TRANSACCIONES')
              .doc(token)
              .update({
                estadoTransaccion:'ok',
                descripcion:step,
                response_code,
                respuestaTransaccion: {
                  commitResponse
                }
              });

    response.render('webpay_response_success',{
        urlRedirect: `${urlBase}/transbank-response`,
        token,
        // step,        
        // amount,
        // status,
        // buy_order,
        // session_id,
        // card_detail: card_detail.card_number,
        // accounting_date,
        // transaction_date,
        // authorization_code,
        // payment_type_code,
        // response_code,
        // installments_number
        
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

  console.log('TOKEN', tbkToken)
  await db.collection('TRANSACCIONES')
  .doc(tbkToken)
  .update({
    estadoTransaccion:'error',
    descripcion:step,
    response_code:400,
    respuestaTransaccion: {}
  });

  response.render('webpay_response_error',{
    urlRedirect: `${urlBase}/transbank-response`,
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

exports.getResultTransaction = async (req, res) => {
  console.log('Entro getResultTransaction')
  const { token ='' } = req.params

const transaccionesRef = db.collection('TRANSACCIONES').doc(token);
const doc = await transaccionesRef.get();
if (!doc.exists) {
  console.log('No such document!');
  return res.status(200).json({
    ok:false,
    message:'No Existe el documento'
  })
} 

  return res.status(200).json({
    ok:true,
    payload: doc.data()
  })
}





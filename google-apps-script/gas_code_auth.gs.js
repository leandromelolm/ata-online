/**
 * Verificar credenciais
 * **/
function checkAuthCredentials(user, password, deviceId) {
  const usr = findTextInColumn(sheetSession(env().SHEETNAME_USER), 'C', user, false);
  if (!usr.success)
    return {success: false, message: 'erro na autenticação'};
  if(usr.result[3] !== sha256(password))
    return {success: false, message: 'erro na autenticação'};
  let atoken = generateAccessToken(usr.result[1], usr.result[2]);
  let rtoken = generateRefreshToken(deviceId)
  createUserSession(new Date(), usr.result[1], usr.result[2], rtoken, deviceId, 'ativo' );
  return {
    success: true, 
    message: 'autenticação realizada com sucesso', 
    content: {accesstoken: atoken, refreshtoken: rtoken}
  };  
};

/**
 * Renovar token
 * **/
function renewToken(refreshToken, _deviceid) {
  const msgErr = 'Não é possivel renovar o token';
  let tok = validateToken(refreshToken, env().KEY_REFRESH_TOKEN);
  if (!tok.auth)
    return {success: false, message: msgErr, error: tok.message};
  sheet = sheetSession(env().SHEETNAME_REFRESH);
  const data = findTextInColumn(sheet, 'D', refreshToken , false) // 'D' = coluna do refreshToken
  if(!data.success)
    return {success: false, message: msgErr, error: data.result};
  const [criado, id, userName, rToken, deviceId, status] = data.result;
  if( _deviceid !== deviceId)
    return {success: false, message: msgErr, error: 'dispositivo não encontrado'};
  if (status !== 'ativo')
    return {success: false, message: msgErr, error: 'refreshToken não está ativo'};  
  let payload = refreshToken.split('.')[1];
  const blob = Utilities.newBlob(Utilities.base64Decode(payload)).getDataAsString();
  const dataPayload = JSON.parse(blob);
  const horasRestantes = horasParaExpiracao(dataPayload.exp);
  if (horasRestantes < 248) {
    let atoken = generateAccessToken(id, userName);
    let newRefreshtoken = generateRefreshToken(deviceId);
    updateUserSessioRefreshToken(deviceId, newRefreshtoken, data.row);
    return {success: true, content: {accesstoken: atoken, refreshtoken: newRefreshtoken}};
  } else {
    return {success: false, message: `Faltam ${horasRestantes} horas para o refresh_token expirar.`};
  }
};

function diasEmMili(dias) {
  const milissegundosPorDia = 24 * 60 * 60 * 1000; // Um dia em milissegundos
  return dias * milissegundosPorDia;
};

function horasParaExpiracao(expTimestamp) {
  const agora = Date.now();
  const expTimeMs = expTimestamp * 1000;
  const diferencaMs = expTimeMs - agora;
  const horas = diferencaMs / (60 * 60 * 1000);
  return horas > 0 ? Math.floor(horas) : 0;
};

function sheetSession(sheetName) {
  return SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheetByName(sheetName);
};

function createUserSession(timeStamp, userId, userName, refreshToken, deviceId, status) {
  let sheet = sheetSession(env().SHEETNAME_REFRESH);
  sheet.appendRow([timeStamp, userId, userName, refreshToken, deviceId, status]);
  return {success: true, message: 'sessão criada com sucesso'};
};

function deleteUserSession(column = 'E', deviceId) {
  let sheet = sheetSession(env().SHEETNAME_REFRESH);
  let objRow = findTextInColumn(sheet, column, deviceId); // coluna 'E' = dispositivoId
  if(!objRow.success)
    return {success: false, message: 'objeto não encontrado'};
  sheet.deleteRow(objRow.result);
  return {success: true, result: `objeto deletado com sucesso`}
};

function updateUserSessioRefreshToken(deviceId, newRefresh, row) {
  let sheet = sheetSession(env().SHEETNAME_REFRESH);
  sheet.getRange(row, 4).setValue(newRefresh);
  sheet.getRange(row, 7).setValue(new Date());
  return {success: true, message: `Objeto alterado: ${deviceId}`};
};

function findTextInColumn(sheet, column, textToFind, isGetRowPosition = true) {
  coluna = sheet.getRange(`${column}:${column}`);
  var textFinder = coluna.createTextFinder(textToFind);
  textFinder.matchEntireCell(true); // texto exato
  var resultadoUnico = textFinder.findNext(); //findNext para primeiro resultado encontrado
  if(resultadoUnico)
    if (isGetRowPosition)
      return {success: true, result: resultadoUnico.getRow()};
    else
      return {
        success: true, 
        row: resultadoUnico.getRow(),
        result: sheet.getRange(resultadoUnico.getRow(), 1, 1, sheet.getLastColumn()).getValues().flat()
      }; 
  else
    return {success: false, result: 'Nenhum objeto encontrado'};
};

/**
 * Gerar access_token
 * **/
const generateAccessToken = (id, userName) => {
  const accessToken = createToken({
    expiresInMinutes: 15,
    privateKeyJwt: env().KEY_ACCESS_TOKEN,
    data: {
      userId: id,
      name: userName,
    },
  });
  return accessToken;
};

/**
 * Gerar refresh_token
 * **/
const generateRefreshToken = (deviceId) => {
  const refreshToken = createToken({
    expiresInHours: 168, // 168 horas = 7 dias
    privateKeyJwt: env().KEY_REFRESH_TOKEN,
    data: {
      deviceId: deviceId,
    },
  });
  return refreshToken;
};

const createToken = ({ 
  expiresInHours = 0, 
  expiresInMinutes = 0, 
  privateKeyJwt ='', 
  data = {}
  }) => {
  // Sign token using HMAC with SHA-256 algorithm
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Date.now();
  const expires = new Date(now);
  
  if (expiresInHours > 0) {
    expires.setHours(expires.getHours() + expiresInHours);
  }
  if (expiresInMinutes > 0) {
    expires.setMinutes(expires.getMinutes() + expiresInMinutes);
  }

  const payload = {
    exp: Math.round(expires.getTime() / 1000),
    iat: Math.round(now / 1000),
  };

  Object.keys(data).forEach(function (key) {
    payload[key] = data[key];
  });

  const base64Encode = (text, json = true) => {
    const data = json ? JSON.stringify(text) : text;
    return Utilities.base64EncodeWebSafe(data).replace(/=+$/, '');
  };

  const toSign = `${base64Encode(header)}.${base64Encode(payload)}`;
  const signatureBytes = Utilities.computeHmacSha256Signature(toSign, privateKeyJwt);
  const signature = base64Encode(signatureBytes, false);

  return `${toSign}.${signature}`;
};

/**
 * Validar token
 * **/
const validateToken = (strJwt, privatKeyJwt) => {
  try {
    let [header, payload, signature] = strJwt.split('.');
    let signatureBytes = Utilities.computeHmacSha256Signature(`${header}.${payload}`, privatKeyJwt);
    let validSignature = Utilities.base64EncodeWebSafe(signatureBytes);
    if (signature !== validSignature.replace(/=+$/, ''))
      return { auth: false, message: 'Invalid signature' }
    const blob = Utilities.newBlob(Utilities.base64Decode(payload)).getDataAsString();
    const { exp, ...data } = JSON.parse(blob);
    if (new Date(exp * 1000) < new Date())
      return { auth: false,  message: 'The token has expired' }
    return { auth: true, message: 'Valid signature' }    
  } catch(e) {
    return res = {
      auth: false,
      error: e,
      message: 'Erro na validação do token'
    }
  }
};

function encrypt(value, key) {
  return CryptoJS.AES.encrypt(value, key).toString();
}

function decrypt(value, key) {
  return CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8)
}

function sha256(value){
  let str = value + env().PRIVATE_KEY_HASH; 
  const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str);
  let hexString = signature
      .map(function(byte) {
          var v = (byte < 0) ? 256 + byte : byte;
          return ("0" + v.toString(16)).slice(-2);
      })
      .join("");
  return hexString;
}

function authUser(user, password) {
  const data = localizarUsuario(user);
  if (!data.success)
    return false;
  let pw = decrypt(password, env().ENV_CRYPTO_KEY_SECRET);
  if(data[3] !== sha256(pw))
    return false;
  return true;
}

function localizarUsuario(user) {
  const aba = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheetByName(env().SHEETNAME_USER);
  coluna = aba.getRange("C:C");
  const textFinder = coluna.createTextFinder(user);
  textFinder.matchEntireCell(true);
  const resultado = textFinder.findNext();
  if(!resultado)
    return {success: false, message: 'usuário não encontrado'};
  return {
    success: true, 
    data: aba.getRange(resultado.getRow(), 1, 1, aba.getLastColumn()).getValues().flat()
  };
}

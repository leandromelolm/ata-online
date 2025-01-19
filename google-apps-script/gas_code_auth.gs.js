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
  const usuarioEncontrado = localizarUsuario(user);
  if (usuarioEncontrado) {
    let pw = decrypt(password, env().ENV_KEY_SECRECT);
    if(usuarioEncontrado[3] === sha256(pw))
    return true;
  }
  else
    return false;  
}

function localizarUsuario(user) {
  const aba = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheetByName(env().SHEETNAME_USER);
  coluna = aba.getRange("C:C");
  const textFinder = coluna.createTextFinder(user);
  textFinder.matchEntireCell(true);
  const resultado = textFinder.findNext();
  if(resultado)
    return aba.getRange(resultado.getRow(), 1, 1, aba.getLastColumn()).getValues().flat();
  else
    return null;
}

# ata-online-angular

Projeto gerado com a versão Angular 17.3.11.

Configuração do projeto

### Executar o Projeto
```sh

# Entrar no diretorio do projeto '/ata-online'
# executar:
npm install

# executar o projeto:
npm start
# ou
npm serve


# build ataonline
# environment.prod.ts
ng build --configuration=production

# build sindatsb
# environment.prodsindatsb.ts
ng build --configuration=sindatsb-prod

# executar projeto com variveis de prod (sindatsb-pe)
# alteração feitas no angular.json
ng serve --configuration=sindatsb-prod

# executar projeto com variveis de prod (ata-online)
ng serve --configuration=production

# comandos firebase
# para deploy é necessario alterar o firebase.json alterando o hosting > site.
firebase logout
firebase login
firebase deploy
firebase projects:list
firebase use
firebase use <project-id>

```
# AtaOnline

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.11.

### Comandos
```sh

#limpar cache do npm (opcional)
npm cache clean --force

# instalar versão Angular 17
npm install -g @angular/cli@17

# ver versão angular
ng version

# criar projeto
ng new ata-online --no-standalone

# executar projeto execute uma das opções
npm start
ng serve -o
# para permitir abrir no dispositivo mobile execute uma das opções
ng serve --host {HOST_LOCAL_PARA_ABRIR_NO_MOBILE}
ng serve --host=0.0.0.0 --disable-host-check
ng serve --host=0.0.0.0 --port=4200 --disable-host-check

# instalar boostrap
npm install bootstrap@5.3.3

# instalar material angular
ng add @angular/material

# para adicionar máscaras de input
npm install ngx-mask --save

### comandos angular

# comando para criar componente
ng generate component components/button
ng generate component components/location
ng generate component pages/index
#`ng generate Directive|pipe|service|class|guard|interface|enum|module`.

# criar sistema de autenticação
ng g m commom/auth --routing
ng g c commom/auth/components/login
ng g c commom/auth/components/cadastro
ng g s commom/auth/service/authentication

# criar guard
ng g guard commom/auth
$ (X) CanActivate
ng g guard commom/authCanMatch
$ (X) CanMatch

# criar modulo para importações do angular material
ng g m shared/material

# criar serviço
ng g s services/NOME_DO_SERVICO

# criar class
ng generate class models/meeting


### implantar projeto no firebase
npm install firebase
npm install -g firebase-tools
firebase logout
firebase login
firebase init


### Build and Deploy

## build and deploy sindatsbpe

# configurar firebase.json "site": "sindatsbpe",

# criar arquivo environment.prodsindatsb.ts no diretorio environment

# construir o projeto com variaveis do environment.prodsindatsb.prod
ng build --configuration=sindatsb-prod
# arquivo env personalizado acrescentado no angular.json

# se não estiver logado
firebase login



#listar os projetos no firebase
firebase projects:list

# usar o projeto existente
firebase use --add PROJECT_ID

# fazer o deploy
firebase deploy --only hosting:sindatsbpe


## build and deploy ata-online

# construir o projeto com variaveis do environment.prod
ng build --configuration=production
# o ng build deve ser dentro do diretório ata-online
# escolher a opcão App Hosting
# usar um projeto existente que ja foi criado no firebase
# configurar arquivo firebase.json para localizar pasta index
# configurar o firebase.json na linha "site": "ataonline",
firebase deploy --only hosting:ataonline


### deploy de preview - teste
# https://firebase.google.com/docs/hosting/test-preview-deploy
firebase hosting:channel:deploy preview_beta



### Outros comandos úteis

## NODE

# listar versões node
nvm ls
nvm ls-remote
# instalar versão compatível com Angular 17
nvm install v18.20.5
# usar uma versão node
nvm use v18.20.5
# tornar versão node padrão
nvm alias default 18.20.5
# matar projeto executado na porta 4200
sudo kill -9 `sudo lsof -t -i:4200`
fuser -k 4200/tcp

## GITHUB CODESPACES

## usar o Github Codespaces pela primeira vez
# 1- entrar no diretorio do projeto
# 2 - instalar npm
npm install
# 3 - instalar o angular
npm install -g @angular/cli@17
#4 instalar o firebase e realizar as operações de login

```
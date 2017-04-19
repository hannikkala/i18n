#!/usr/bin/env bash

mkdir /locales

npm run --prefix i18n-service start &
npm start
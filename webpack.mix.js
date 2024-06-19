let mix = require('laravel-mix');

mix.js('Resources/js/app.js', 'Public/Js/app.js').sass('Resources/Scss/app.scss', 'Public/Css/app.css');
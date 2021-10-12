# shopify-ajax-cart-sidebar
Full source code to make an ajax cart sidebar when custom click 'add to cart' Btn. You don't need to use an app and you can make it by yourself! I will take only 5 mins to install it on your theme

![Screenshot_1](https://user-images.githubusercontent.com/72150923/136978287-591490cc-534e-41b1-a0e1-f287515129a8.png)


## Install

1. copy drawer.css and drawer.js paste into theme.liquid before ```</body>```
2. create drawer.liquid snippet or section and move it theme.liquid before ```</body>```
3. upload custom-ajax-js.js file into assets folder on your theme


## Small updates your theme
1. In header seciton, add 'data-drawer-trigger aria-controls="drawer-name" aria-expanded="false"' attrs to cart icon's anchor 

For example: 
```
<a href="/cart" data-drawer-trigger aria-controls="drawer-name" aria-expanded="false" class="btn-link btn-lg">{% include "svg-cart" %}</a>
```

2. In product page or collection product item, all of product forms class should be 'shopify-product-form'

For example: 
```
<form class="shopify-product-form">
```


Author: Roman Gavrilov <br>
Version: 1.0

If you have question, please reach out to me here! 

gmail: roman.gavrilov.0309@gmail.com <br>
skype: live:.cid.47c14b6b0b7e8b07

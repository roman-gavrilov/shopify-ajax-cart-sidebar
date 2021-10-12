Author: Roman Gavrilov
Version: 1.0


1. copy drawer.css and drawer.js paste into theme.liquid before </body>
2. create drawer.liquid snippet or section and move it theme.liquid before </body>
3. In header seciton, add 'data-drawer-trigger aria-controls="drawer-name" aria-expanded="false"' attrs to cart icon's anchor 

For example: 
<a href="/cart" data-drawer-trigger aria-controls="drawer-name" aria-expanded="false" class="btn-link btn-lg">{% include "svg-cart" %}</a>

done!


If you have question, please reach out to me here! 
gmail: roman.gavrilov.0309@gmail.com
skype: live:.cid.47c14b6b0b7e8b07
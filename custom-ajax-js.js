 
  if ((typeof ShopifyAPI) === 'undefined') { ShopifyAPI = {}; }
  
  ShopifyAPI.addItemFromForm = function(form, callback, errorCallback) {
    var params = {
      type: 'POST',
      url: '/cart/add.js',
      data: jQuery(form).serialize(),
      dataType: 'json',
      success: function(line_item) {
        if ((typeof callback) === 'function') {
          callback(line_item, form);
        }
        else {
          ShopifyAPI.onItemAdded(line_item, form);
        }
      },
      error: function(XMLHttpRequest, textStatus) {
        if ((typeof errorCallback) === 'function') {
          errorCallback(XMLHttpRequest, textStatus);
        }
      }
    };
    jQuery.ajax(params);
  };
  
  ShopifyAPI.getCart = function(callback) {
    jQuery.getJSON('/cart.js', function (cart, textStatus) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        ShopifyAPI.onCartUpdate(cart);
      }
    });
  };
  
  ShopifyAPI.changeItem = function(line, quantity, callback) {
    var params = {
      type: 'POST',
      url: '/cart/change.js',
      data: 'quantity=' + quantity + '&line=' + line,
      dataType: 'json',
      success: function(cart) {
        if ((typeof callback) === 'function') {
          callback(cart);
        }
        else {
          ShopifyAPI.onCartUpdate(cart);
        }
      },
      error: function(XMLHttpRequest, textStatus) {
        ShopifyAPI.onError(XMLHttpRequest, textStatus);
      }
    };
    jQuery.ajax(params);
  };

  var init, loadCart;
  
  // Private plugin variables
  var $formContainer, $addToCart, $cartCountSelector, $cartCostSelector, $cartContainer, $drawerContainer, $body, $buildCart;

  // Private functions
  var updateCountPrice, formOverride, itemAddedCallback, itemErrorCallback, adjustCartCallback, cartUpdateCallback, cartUpdateCallbackInitial, validateQty;
    
  init = function() {
    // Default settings
    settings = {
      addToCartSelector  : 'input[type="submit"]',
      cartCountSelector  : '#drawer__item-count',
      cartContainer      : '#cart__drawer_items'
  
    };

    $formContainer     = $('form.shopify-product-form');
    $addToCart         = $formContainer.find(settings.addToCartSelector);
    $cartCountSelector = $(settings.cartCountSelector);
    $cartContainer     = $(settings.cartContainer);
    
    $body = $('body');
  };
  formOverride = function () {
    $formContainer.on('submit', function(evt) {
      evt.preventDefault();

      // Add class to be styled if desired
      $addToCart.removeClass('is-added').addClass('is-adding');

      // Remove any previous quantity errors
      $('.qty-error').remove();

      ShopifyAPI.addItemFromForm(evt.target, itemAddedCallback, itemErrorCallback.bind(this));
    });
  };

  itemAddedCallback = function (product) {
    $addToCart.removeClass('is-adding').addClass('is-added');

    ShopifyAPI.getCart(cartUpdateCallback);
  };
  
  itemErrorCallback = function (XMLHttpRequest, textStatus) {
    var $form = $(this);
    var $button = $form.find(settings.addToCartSelector);
    var data = eval('(' + XMLHttpRequest.responseText + ')');

    $button.removeClass('is-adding is-added');

    if (!!data.message) {
      if (data.status == 422) {
        $form.after('<div class="errors qty-error">'+ data.description +'</div>')
      }
    }
  };
  
  cartUpdateCallback = function (cart) {
    // Update quantity and price
    updateCountPrice(cart);
    buildCart(cart);         
    cartCallback(cart);
  };
  
  cartUpdateCallbackInitial = function (cart) {
    // Update quantity and price
    updateCountPrice(cart);
    buildCart(cart);
  };
  updateCountPrice = function (cart) {
    if ($cartCountSelector) {
      $cartCountSelector.html(cart.item_count).removeClass('hidden-count');

      if (cart.item_count === 0) {
        $cartCountSelector.addClass('hidden-count');
      }
    }
    if ($cartCostSelector) {
      $cartCostSelector.html(Shopify.formatMoney(cart.total_price, Shopify.money_format));
    }
  };
  
  buildCart = function (cart) {
    var line_item = '';
      $cartContainer.empty();
      if(cart.items.length > 0) {
          cart.items.forEach(function(product, index) { 
            line_item +=
            `
            <div class="line-item" data-line="${index+1}">
              <div class="line-item__header">
                <div class="line-item__title">
                  <p>${product.title}</p>
                </div>
                <p class="line-item__price">${Shopify.formatMoney(product.line_price, Shopify.money_format)}</p>
                <div class="line-item__qty">
                  <div class="qtybox">
                    <button type="button" data-line="${index+1}" class="btnqty qtyminus icon icon-minus">-</button>
                    <input type="text" id="quantity" name="quantity" value="${product.quantity}" min="1" class="quantity-selector quantity-input" readonly="">
                    <button type="button" data-line="${index+1}" class="btnqty qtyplus icon icon-plus">+</button>
                  </div>
                </div>
                <button data-line="${index+1}" class="line-item__remove-btn">
                  <svg class="icon icon--trash fill-body" id="trash" style="height: 20px;width: 17px;fill: #72757e;"><g fill-rule="nonzero"><path d="M12.02 16.04c0 .32-.26.56-.56.56-.3 0-.56-.26-.56-.56V5.54H8.96v10.5c0 .32-.26.56-.56.56-.3 0-.56-.26-.56-.56V5.54H5.92v10.5c0 .32-.26.56-.56.56-.3 0-.56-.26-.56-.56V5.54H2.18v11.12c0 1.34 1.1 2.44 2.44 2.44h7.56c1.34 0 2.44-1.1 2.44-2.44V5.54h-2.6v10.5zM15.8 2.78h-4.02V.94c0-.46-.38-.84-.84-.84H5.86c-.46 0-.84.38-.84.84v1.84H1c-.46 0-.84.38-.84.84 0 .46.38.84.84.84h14.8c.46 0 .84-.38.84-.84 0-.46-.36-.84-.84-.84zM6.7 1.8h3.38v1H6.7v-1z"></path></g></svg>
                </button>
              </div>
              <div class="line-item__boday">
                <div class="line-item__image">
                  <img src="${product.featured_image.url}" alt="${product.featured_image.alt}">
                </div>
                <div class="line-item__meta">
                  <h5>${product.title}</h5>
                </div>
              </div>
            </div>
            `;
          });
          $cartContainer.append(line_item);
      } else {
        document.getElementById('cart__drawer_items').innerHTML = '<p>Cart is empty</p>';
        document.getElementById('cart__checkout_btn').setAttribute('disabled', 'disabled');
        document.getElementById('cart__checkout_btn').style.pointerEvents = 'none';
      }
      document.getElementById('cart__total_price').innerHTML = Shopify.formatMoney(cart.total_price, Shopify.money_format);
  };

  cartCallback = function(cart) {
    $('[data-drawer-target]').addClass('is-active').addClass('is-visible');
    $body.trigger('ajaxCart.afterCartLoad', cart);
  };

  loadCart = function () {
    ShopifyAPI.getCart(cartUpdateCallbackInitial);
  };

  
  function updateQuantity(line, qty) {
    isUpdating = true;

    // Add activity classes when changing cart quantities
    var $row = $('.ajaxcart__row[data-line="' + line + '"]').addClass('is-loading');

    if (qty === 0) {
      $row.parent().addClass('is-removed');
    }

    // Slight delay to make sure removed animation is done
    setTimeout(function() {
      ShopifyAPI.changeItem(line, qty, adjustCartCallback);
    }, 250);
  }
    
  adjustCartCallback = function (cart) {
    isUpdating = false;

    // Update quantity and price
    updateCountPrice(cart);

    // Reprint cart on short timeout so you don't see the content being removed
    setTimeout(function() {
      ShopifyAPI.getCart(buildCart);
    }, 150)
  };
    
  $body.on('click', '.line-item__qty .btnqty', function() {
    var $el = $(this),
        line = $el.data('line'),
        $qtySelector = $el.siblings('.line-item__qty .quantity-input'),
        qty = parseInt($qtySelector.val().replace(/\D/g, ''));

    var qty = validateQty(qty);

    // Add or subtract from the current quantity
    if ($el.hasClass('qtyplus')) {
      qty += 1;
    } else {
      qty -= 1;
      if (qty <= 0) qty = 0;
    }

    // If it has a data-line, update the cart.
    // Otherwise, just update the input's number
    if (line) {
      updateQuantity(line, qty);
    } else {
      $qtySelector.val(qty);
    }
  });

  $body.on('click', '.line-item__header .line-item__remove-btn', function() {
    var $el = $(this),
        line = $el.data('line');
    updateQuantity(line, 0);
  });
    
  validateQty = function (qty) {
    if((parseFloat(qty) == parseInt(qty)) && !isNaN(qty)) {
      // We have a valid number!
    } else {
      // Not a number. Default to 1.
      qty = 1;
    }
    return qty;
  };
  init();
  loadCart();
  formOverride();

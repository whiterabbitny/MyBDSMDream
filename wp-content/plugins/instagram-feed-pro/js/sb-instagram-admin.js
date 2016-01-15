jQuery(document).ready(function($) {

	//Autofill the token and id
	var hash = window.location.hash,
        token = hash.substring(14),
        id = token.split('.')[0];
    //If there's a hash then autofill the token and id
    if(hash){
        $('#sbi_config').append('<div id="sbi_config_info"><p><b>Access Token: </b><input type="text" size=58 readonly value="'+token+'" onclick="this.focus();this.select()" title="To copy, click the field then press Ctrl + C (PC) or Cmd + C (Mac)."></p><p><b>User ID: </b><input type="text" size=12 readonly value="'+id+'" onclick="this.focus();this.select()" title="To copy, click the field then press Ctrl + C (PC) or Cmd + C (Mac)."></p><p>Copy and paste these into the fields below, or use a different Access Token and User ID if you wish.</p></div>');
    }
	
	//Tooltips
	jQuery('#sbi_admin .sbi_tooltip_link').click(function(){
		jQuery(this).siblings('.sbi_tooltip').slideToggle();
	});

  jQuery('#sbi_admin label').click(function(){
    var $sbi_shortcode = jQuery(this).siblings('.sbi_shortcode');
    if($sbi_shortcode.is(':visible')){
      jQuery(this).siblings('.sbi_shortcode').css('display','none');
    } else {
      jQuery(this).siblings('.sbi_shortcode').css('display','block');
    }  
  });

  jQuery('#sbi_admin label').hover(function(){
    if( jQuery(this).siblings('.sbi_shortcode').length > 0 ){
      jQuery(this).attr('title', 'Click for shortcode option').append('<code class="sbi_shortcode_symbol">[]</code>');
    }
  }, function(){
    jQuery(this).find('.sbi_shortcode_symbol').remove();
  });

  //Add the color picker
	if( jQuery('.sbi_colorpick').length > 0 ) jQuery('.sbi_colorpick').wpColorPicker();

	//Check User ID is numeric
	jQuery("#sb_instagram_user_id").change(function() {

		var sbi_user_id = jQuery('#sb_instagram_user_id').val(),
			$sbi_user_id_error = $(this).closest('td').find('.sbi_user_id_error');

		if (sbi_user_id.match(/[^0-9, _.-]/)) {
  			$sbi_user_id_error.fadeIn();
  		} else {
  			$sbi_user_id_error.fadeOut();
  		}

	});

  //Hide the location coordinates initially
  jQuery('#sbi_loc_radio_coordinates_opts').hide();

  var sbi_loc_type = 'id';
  //Toggle location id/coordinates options
  jQuery('#sbi_loc_radio_id, #sbi_loc_radio_coordinates').change(function(){
    if( jQuery('#sbi_loc_radio_id').is(':checked') ){
      jQuery('#sbi_loc_radio_id_opts').show();
      jQuery('#sbi_loc_radio_coordinates_opts').hide();
      sbi_loc_type = 'id';
    } else {
      jQuery('#sbi_loc_radio_coordinates_opts').show();
      jQuery('#sbi_loc_radio_id_opts').hide();
      sbi_loc_type = 'coordinates';
    }
  });

	//Add new location
	var sbiCoordinatesShow = false,
      $sb_instagram_coordinates_options = jQuery('#sb_instagram_coordinates_options');
  jQuery('#sb_instagram_new_coordinates').on('click', function(){
      if( sbiCoordinatesShow ){
          $sb_instagram_coordinates_options.hide();
          sbiCoordinatesShow = false;
      } else {
          $sb_instagram_coordinates_options.show();
          sbiCoordinatesShow = true;
      }
      
  });

  var $sb_instagram_coordinates = jQuery('#sb_instagram_coordinates'),
      sbi_coordinates = $sb_instagram_coordinates.val();
  $sb_instagram_coordinates.blur(function() {
      sbi_coordinates = $sb_instagram_coordinates.val();
  });

  jQuery('#sb_instagram_add_location').on('click', function(){
      if( sbi_coordinates.length > 0 ) sbi_coordinates = sbi_coordinates + ',';

      sbi_coordinates = sbi_coordinates + '(' + jQuery('#sb_instagram_lat').val() + ',' + jQuery('#sb_instagram_long').val() + ',' + jQuery('#sb_instagram_dist').val() + ')';
      $sb_instagram_coordinates.val( sbi_coordinates );

      //Clear fields
      jQuery('#sb_instagram_long').val('');
      jQuery('#sb_instagram_lat').val('');
      jQuery('#sb_instagram_loc_id').val('');
  });

  //Scroll to hash
  $('#sbi_admin a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 500);
        return false;
      }
    }
  });


  //Boxed header options
  var sb_instagram_header_style = $('#sb_instagram_header_style').val(),
    $sb_instagram_header_style_boxed_options = $('#sb_instagram_header_style_boxed_options');

  //Should we show anything initially?
  if(sb_instagram_header_style == 'circle') $sb_instagram_header_style_boxed_options.hide();
  if(sb_instagram_header_style == 'boxed') $sb_instagram_header_style_boxed_options.show();

  //When page type is changed show the relevant item
  $('#sb_instagram_header_style').change(function(){
    sb_instagram_header_style = $('#sb_instagram_header_style').val();

    if( sb_instagram_header_style == 'boxed' ) {
      $sb_instagram_header_style_boxed_options.fadeIn();
    } else {
      $sb_instagram_header_style_boxed_options.fadeOut();
    }
  });


});
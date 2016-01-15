<?php

/**
 * Plugin Name: PDF Embedder Premium Secure
 * Plugin URI: http://wp-pdf.com/
 * Description: Embed secure undownloadable PDFs straight into your posts and pages, with flexible width and height. No third-party services required. 
 * Version: 2.4.7
 * Author: Dan Lester
 * Author URI: http://wp-pdf.com/
 * Text Domain: pdf-embedder
 * License: Premium Paid per WordPress site
 * 
 * Do not copy, modify, or redistribute without authorization from author Lesterland Ltd (contact@wp-pdf.com)
 * 
 * You need to have purchased a license to install this software on each website.
 * 
 * You are not authorized to use, modify, or distribute this software beyond the single site license(s) that you
 * have purchased.
 * 
 * You must not remove or alter any copyright notices on any and all copies of this software.
 * 
 * This software is NOT licensed under one of the public "open source" licenses you may be used to on the web.
 * 
 * For full license details, and to understand your rights, please refer to the agreement you made when you purchased it 
 * from our website at https://wp-pdf.com/
 * 
 * THIS SOFTWARE IS SUPPLIED "AS-IS" AND THE LIABILITY OF THE AUTHOR IS STRICTLY LIMITED TO THE PURCHASE PRICE YOU PAID 
 * FOR YOUR LICENSE.
 * 
 * Please report violations to contact@wp-pdf.com
 * 
 * Copyright Lesterland Ltd, registered company in the UK number 08553880
 * 
 */

require_once( plugin_dir_path(__FILE__).'/core/commercial_pdf_embedder.php' );

class pdfemb_premium_secure_pdf_embedder extends pdfemb_commerical_pdf_embedder {

	protected $PLUGIN_VERSION = '2.4.7';
    protected $WPPDF_STORE_URL = 'http://wp-pdf.com/';
    protected $WPPDF_ITEM_NAME = 'PDF Embedder Secure';

    protected function useminified() {
		/* using-minified */ return true;
	}
	
	// Singleton
	private static $instance = null;
	
	public static function get_instance() {
		if (null == self::$instance) {
			self::$instance = new self;
		}
		return self::$instance;
	}
	
	// ACTIVATION
	public function pdfemb_activation_hook($network_wide) {
		$su = $this->get_SecureUploader();
		$su->create_protection_files(true);
	}
	
	// Premium specific
	
	protected function get_translation_array() {
		
		$su = $this->get_SecureUploader();
		
		return array_merge(parent::get_translation_array(), 
				Array('k' => $su->getSecretKey(),
						'is_admin' => (current_user_can('manage_options'))));
	}
	
	
	// SHORTCODES
	
	protected function modify_pdfurl($url) {
		$su = $this->get_SecureUploader();
		
		$securepdfpath = $su->getSecurePath($url);
		
		if ($securepdfpath !== '') {
			// Turn into a secure version of the URL
			$url = parse_url(home_url('/'),  PHP_URL_PATH).'?pdfemb-serveurl='.urlencode($url);
		}
		
		return parent::modify_pdfurl($url);
	}
	
	// Downloader
	
	public function pdfemb_admin_init() {
		parent::pdfemb_admin_init();
		$su = $this->get_SecureUploader();
		$su->intercept_uploads();
		$su->create_protection_files(false);
	}
	
	public function pdfemb_init() {
		$su = $this->get_SecureUploader();
		$su->handle_downloads();
		parent::pdfemb_init();
	}
	
	protected $_secureUploader = null;
	protected function get_SecureUploader() {
		if (is_null($this->_secureUploader)) {
			include_once( dirname( __FILE__ ) . '/core/secure/uploads.php' );
            $options = $this->get_option_pdfemb();
			$this->_secureUploader = new pdfemb_SecureUploader($options['pdfemb_secure']);
		}
		return $this->_secureUploader;
	}


    protected function extra_shortcode_attrs($atts, $content=null)
    {
        $options = $this->get_option_pdfemb();

        $securemore = '';
	    $disablerightclick_html = '';

        if (isset($atts['url'])) {

            $su = $this->get_SecureUploader();

            $securepdfpath = $su->getSecurePath($atts['url']);

            if ($securepdfpath !== '') {
                // Is a secure PDF

                $download = isset($atts['download']) ? $atts['download'] : (isset($options['pdfemb_download']) && $options['pdfemb_download'] ? 'on' : 'off');
                if (!in_array($download, array('on', 'off'))) {
                    $download = 'off';
                }

                if ($download == 'on') {
                    $securemore = ' data-download-nonce="' . wp_create_nonce('pdfemb-secure-download-' . $atts['url']) . '"';
                }

	            $disablerightclick = isset($atts['disablerightclick']) ? $atts['disablerightclick'] : (isset($options['pdfemb_disablerightclick']) && $options['pdfemb_disablerightclick'] ? 'on' : 'off');
	            if (!in_array($disablerightclick, array('on', 'off'))) {
		            $disablerightclick = 'off';
	            }

	            if ($disablerightclick == 'on') {
		            $disablerightclick_html = ' data-disablerightclick="on"';
	            }

            }
        }

        return parent::extra_shortcode_attrs($atts, $content).$securemore.$disablerightclick_html;
    }

	// AUX

	protected function pdfemb_securesection_text()
	{
		$options = $this->get_option_pdfemb();
		?>

		<h2><?php _e('Secure PDFs', 'pdf-embedder'); ?></h2>

		<label for="pdfemb_secure" class="textinput"><?php _e('Secure PDFs', 'pdf-embedder'); ?></label>
		<span>
        <input type="checkbox" name='<?php echo $this->get_options_name(); ?>[pdfemb_secure]' id='pdfemb_secure' class='checkbox' <?php echo $options['pdfemb_secure'] ? 'checked' : ''; ?> />
        <label for="pdfemb_secure" class="checkbox plain"><?php _e("Send PDF media uploads to 'securepdfs' folder", 'pdf-embedder'); ?></label>
        </span>

		<br class="clear" />


		<label for="pdfemb_disablerightclick" class="textinput"><?php _e('Disable Right Click', 'pdf-embedder'); ?></label>
		<span>
        <input type="checkbox" name='<?php echo $this->get_options_name(); ?>[pdfemb_disablerightclick]' id='pdfemb_disablerightclick' class='checkbox' <?php echo $options['pdfemb_disablerightclick'] == 'on' ? 'checked' : ''; ?> />
        <label for="pdfemb_disablerightclick" class="checkbox plain"><?php _e("Disable right-click mouse menu", 'pdf-embedder'); ?></label>
        </span>

		<br class="clear" />
		<br class="clear" />


		<p><?php _e("If 'Secure PDFs' is checked above, your PDF uploads will be 'secure' by default.
            That is, they should be uploaded to a 'securepdfs' sub-folder of your uploads area. These files should not be accessible directly,
            and the plugin provides a backdoor method for the embedded viewer to obtain the file contents.", 'pdf-embedder'); ?></p>

		<p><?php _e("This means that your PDF is unlikely to be shared outside your site where you have no control over who views, prints, or shares it.
            Please note that it is still always possible for a determined user to obtain the original file. Sensitive information should never be presented to viewers in any form.", 'pdf-embedder'); ?></p>

		<p><?php _e('See <a href="http://wp-pdf.com/premium-instructions/?utm_source=PDF%20Settings%20Secure&utm_medium=premium&utm_campaign=Premium" target="_blank">Instructions</a> for more details.', 'pdf-embedder'); ?>
		</p>

		<?php
	}

	protected function get_eddsl_optname() {
		return 'eddsl_pdfemb_secure_ls';
	}

	protected function get_default_options() {
		return array_merge( parent::get_default_options(),
			Array(
				'pdfemb_download' => 'off',
				'pdfemb_secure' => true,
				'pdfemb_disablerightclick' => 'off'
			) );
	}

	public function pdfemb_options_validate($input)
	{
		$newinput = parent::pdfemb_options_validate($input);

		$newinput['pdfemb_secure'] = isset($input['pdfemb_secure']) && ($input['pdfemb_secure'] === true || $input['pdfemb_secure'] == 'on');
		$newinput['pdfemb_disablerightclick'] = isset($input['pdfemb_disablerightclick']) && ($input['pdfemb_disablerightclick'] === true || $input['pdfemb_disablerightclick'] == 'on');

		return $newinput;
	}

	protected function my_plugin_basename() {
		$basename = plugin_basename(__FILE__);
		if ('/'.$basename == __FILE__) { // Maybe due to symlink
			$basename = basename(dirname(__FILE__)).'/'.basename(__FILE__);
		}
		return $basename;
	}
	
	protected function my_plugin_url() {
		$basename = plugin_basename(__FILE__);
		if ('/'.$basename == __FILE__) { // Maybe due to symlink
			return plugins_url().'/'.basename(dirname(__FILE__)).'/';
		}
		// Normal case (non symlink)
		return plugin_dir_url( __FILE__ );
	}
	
}

// Global accessor function to singleton
function pdfembPDFEmbedderSecure() {
	return pdfemb_premium_secure_pdf_embedder::get_instance();
}

// Initialise at least once
pdfembPDFEmbedderSecure();

?>
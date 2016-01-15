<?php get_header();	?>

<div id="content" class="site-content clearfix">

  <?php get_template_part( 'loop-meta' ); ?>
    
  <div class="container_16 clearfix">
    
    <div class="grid_11">
      
      <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">

	  <?php $Path= $_SERVER['REQUEST_URI'];
  	     if($Path == '/contract/') {
       	          if (!is_user_logged_in()) {
		       echo "<h3><strong>You must be logged in to view this content.</strong></h3>";
		       echo "&nbsp";
             	       echo "<a id=ulink href=" . wp_login_url( site_url( '/contract/ ' ) ) . ">Login</a>";
		       echo " or ";
             	       echo "<a id=ulink href=" . wp_registration_url() . "> Register</a>";
     		       contango_breadcrumbs();
		       ?>
		       </main>
		       </div>
		       </div>
		       <?php get_sidebar(); ?>
		       </div>
		       </div>
		       <?php get_footer();
		       exit;	
		  }		 
  	     } ?>

      	  <?php contango_breadcrumbs(); ?>

          <?php if ( have_posts() ) : ?>
            
              <?php while ( have_posts() ) : the_post(); ?>
              
                <?php get_template_part( 'content', 'page' ); ?>
              
              <?php endwhile; ?>
            
            <?php else : ?>
                        
              <?php get_template_part( 'loop-error' ); ?>
            
          <?php endif; ?>
        
        </main><!-- #main -->
      </div><!-- #primary -->
    
    </div> <!-- end .grid_11 -->
    
    <?php get_sidebar(); ?>

  </div> <!-- end .container_16 -->

</div><!-- #content -->
  
<?php get_footer(); ?>

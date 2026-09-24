<?php
/**
 * Plugin Name: COLAE Integration
 * Description: Integra o configurador de orçamentos COLAE ao WordPress.
 * Version: 0.1.0
 */

if (!defined('ABSPATH')) exit;

define('COLAE_APP_URL', defined('COLAE_APP_URL_OVERRIDE') ? COLAE_APP_URL_OVERRIDE : 'https://app.colae.com.br');

add_shortcode('colae_quote', function($atts) {
    $atts = shortcode_atts(['height' => '900'], $atts);
    $url = esc_url(COLAE_APP_URL);
    $height = esc_attr($atts['height']);
    return '<iframe src="' . $url . '" style="width:100%;height:' . $height . 'px;border:0;border-radius:24px;" loading="lazy" title="Calculadora de orçamento COLAE"></iframe>';
});

add_action('rest_api_init', function() {
    register_rest_route('colae/v1', '/health', [
        'methods' => 'GET',
        'callback' => function() {
            return new WP_REST_Response(['ok' => true, 'app' => COLAE_APP_URL], 200);
        },
        'permission_callback' => '__return_true',
    ]);
});

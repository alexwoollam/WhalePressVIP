<?php
/**
 * WordPress local config
 *
 * @package docker-wordpress-vip-go
 */

require_once '/var/www/html/vendor/autoload.php';

$whoops = new \Whoops\Run;
$whoops->pushHandler(new \Whoops\Handler\PrettyPageHandler);
$whoops->register();


if ( isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && 'https' === $_SERVER['HTTP_X_FORWARDED_PROTO'] ) {
	$_SERVER['HTTPS'] = 'on';
}

define( 'VIP_GO_ENV', 'local' );
define( 'AUTOMATIC_UPDATER_DISABLED', true );
define( 'WP_DEBUG', true );
define( 'WP_DISPLAY_DEBUG', true );

$memcached_servers = [
	[
		'memcached',
		11211,
	]
];

#!/bin/bash

echo "ServerName=localhost" >> /etc/apache2/apache2.conf
pecl install xdebug
apachectl restart




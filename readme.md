```shell
openssl req -x509 -nodes -days 36500 -newkey rsa:2048 -keyout ./nginx.key -out nginx.crt
# CN
# BEIJING
# BEIJING
# Mock
# Mock
# www.a.com | x.x.x.x
# a@admin.com

openssl req -new -newkey rsa:2048 -sha256 -nodes -out mypanda_com.csr -keyout \
mypanda_com.key -subj "/C=CN/ST=Beijing/L=Beijing/O=Example Inc./OU=Web Security/CN=mypanda.com"

openssl req -new -newkey rsa:2048 -sha256 -nodes -out 122_51_125_215.csr -keyout \
122_51_125_215.key -subj "/C=CN/ST=Beijing/L=Beijing/O=Example Inc./OU=Web Security/CN=122.51.125.215"

openssl genrsa -des3 -out server.key 1024 # 两边密码
openssl req -new -key server.key -out server.csr
openssl rsa -in server.key -out server_nopwd.key
openssl x509 -req -days 365 -in server.csr -signkey server_nopwd.key -out server.crt
```

docker run --name nginx-https -d \
--rm \
-p 80:80 \
-p 443:443 \
-v /root/docker-home/nginx-https/cert:/etc/nginx/cert \
-v /root/docker-home/nginx-https/conf.d:/etc/nginx/conf.d \
nginx

docker rm -f nginx-https

-v /root/docker-home/nginx-https/index.html:/usr/share/nginx/html/index.html


docker run --name nginx-https -d  --rm  -p 80:80  nginx

netstat -tunlp



docker run --name nginx-https -d \
--rm \
-p 80:80 \
-v /root/docker-home/nginx-https/html:/usr/share/nginx/html \
nginx

ssh -L 8888:122.51.125.215:80 root@122.51.125.215
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/sidebar-crudstone /usr/share/nginx/html/sidebar-crudstone

EXPOSE 5902

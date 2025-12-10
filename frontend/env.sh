#!/bin/sh
cat <<EOF > /usr/share/nginx/html/config.js
window.APP_CONFIG = {
  API_URL: "${API_URL:-http://localhost:3000/api/v1}",
};
EOF

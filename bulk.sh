#!/bin/bash

OWNER_NAME='yona-projects'
SERVER='https://main.yona.io'
USER_TOKEN='AsdlfHp6LASFLAiljkEydi95u/ztz3z9SAflh'


SERVER=$(echo "$SERVER" | sed 's/\//\\\//g')
USER_TOKEN=$(echo "$USER_TOKEN" | sed 's/\//\\\//g')
for file in exported/$OWNER_NAME/*
do
    if [[ -f $file ]]; then
        PRJ_NAME=`basename ${file%%.*}`
        REPLACEMENT_PATTERN="s/\${prj_name}/$PRJ_NAME/g; \
                             s/\${owner_name}/$OWNER_NAME/g; \
                             s/\${server}/$SERVER/; \
                             s/\${user_token}/$USER_TOKEN/"
        echo $PRJ_NAME

        sed -e "$REPLACEMENT_PATTERN" config.template > config.js
        npm start -- import > /dev/null >> bulk_import_out.log
    fi
done
